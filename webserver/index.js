const express = require('express');
const {paths, noReject} = require('../utils');
const {writeFileSync} = require('fs');
/**
 * @typedef {import('../controller')} Controller
 * @typedef {import('../db.js')} Database
 * @typedef {import('../utils').CliOptions} CliOptions
 */
/**
 * Webserver
 */
class WebServer {
  /**
   * Constructor
   * @param {Controller} controller
   * @param {Database} database
   * @param {CliOptions} options
   */
  constructor(controller, database, {noAPI}) {
    this.controller = controller;
    this.database = database;
    this.app = express();
    this.app.use(express.static(paths.buildDir));

    this.app.get('/web/*', (req, res) => {
      res.sendFile(paths.build);
    });
    if (noAPI) return;
    /**
     * API section
     */
    this.app.get('/api/:channelName', async (req, res) => {
      const channelName = req.params.channelName.toLowerCase();
      const op = await this.database.getChannelMatches(channelName);
      if (!op || !op.currentMatch) {
        res.json({status: 404, message: 'Not Found!'});
        return;
      }
      const matchId = op.currentMatch;
      const report = await this.controller.getMatchReport(matchId);
      const isStarted = report.started;

      const ret = {
        status: 200,
        started: isStarted,
        matchId: matchId,
        noPlayers: report.players.length - 1,
        players: [],
      };

      if (isStarted) {
        ret['mode'] = report['mode'];
        ret['msBeforeEnd'] = report['msBeforeEnd'];
        ret['finished'] = report['finished'];
      }
      report.players.forEach((player) => {
        if (player['codingmerId'] === this.controller.myId) return;

        const pInfo = {
          name: player['codingamerNickname'],
          avatarId: player['codingamerAvatarId'],
        };

        if (isStarted) {
          const isCompleted = player['testSessionStatus'] === 'COMPLETED';
          pInfo['finished'] = isCompleted;

          if (isCompleted) {
            pInfo['rank'] = player['rank'];
            pInfo['duration'] = player['duration'];
            pInfo['language'] = player['languageId'];
            pInfo['criterion'] = player['criterion'];
          }
        }
        ret['players'].push(pInfo);
      });
      res.json(ret);
    });

    this.app.get('/api/prev/:channelName', async (req, res) => {
      const channelName = req.params.channelName.toLowerCase();
      const op = await this.database.getChannelMatches(channelName);
      if (!op) {
        res.json([]);
        return;
      }
      const ret = [];
      for (const match of op.prevMatches.slice(0, 5)) {
        const m = await this.controller.getMatchReport(match);
        const w = m['players'][0];
        const o = {
          matchId: match,
          winner: {
            name: w['codingamerNickname'],
            avatarId: w['codingamerAvatarId'],
            rank: w['rank'],
            duration: w['duration'],
            language: w['languageId'],
            criterion: w['criterion'],
          },
        };
        ret.push(o);
      }
      res.json(ret);
    });

    this.app.get('/api/summary/:channelName', async (req, res) => {
      const channelName = req.params.channelName.toLowerCase();
      // TODO: send Channel wise report only
      const data = await this.database.getPrevMatchInfo();
      if (data) {
        if (data[channelName]) {
          res.json({status: 206, data: data[channelName]});
        } else res.json({status: 200, data});
      } else {
        res.status(404).send({status: 404, message: 'No File found!!'});
      }
    });

    /**
     * Requires login
     */
    this.app.use((req, res, next) => {
      const auth = {
        login: process.env.ADMIN_USER,
        password: process.env.ADMIN_PASS,
      };
      const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
      const [login, password] = Buffer.from(b64auth, 'base64')
          .toString()
          .split(':');
      if (
        login &&
        password &&
        login === auth.login &&
        password === auth.password
      ) {
        return next();
      }

      res.set('WWW-Authenticate', 'Basic realm="401"');
      res.status(401).send('Authentication required.');

      // -----------------------------------------------------------------------
    });

    this.app.get('/view', async (req, res) => {
      const op = await this.database.getAll();
      res.send(op);
    });

    this.app.get('/set/:channelName/:matchId', async (req, res) => {
      await this.database.addMatch(
          req.params.channelName.toLowerCase(),
          req.params.matchId,
          true,
      );
    });

    this.app.get('/create/:channelName', async (req, res) => {
      const channelName = req.params.channelName.toLowerCase();
      const op = await this.database.getChannelMatches(channelName);
      if (!op) {
        res.json([]);
        return;
      }
      console.time('create');
      const proms = [];
      for (const match of op.prevMatches) {
        proms.push(noReject(this.controller.getMatchReport(match)));
      }
      let jsonOp = await Promise.all(proms);
      jsonOp = jsonOp.filter((x)=>x);
      console.timeLog('create', ' Got All');
      const ret = {
        total: 0,
        fTotal: 0,
        sTotal: 0,
        rTotal: 0,
        players: [],
        languages: [],
      };
      for (const match of jsonOp) {
        ret.total++;

        let f = 0;
        let s = 0;
        let r = 0;
        if (match.mode === 'FASTEST') {
          ret.fTotal++;
          f = 1;
        } else if (match.mode === 'REVERSE') {
          ret.rTotal++;
          r = 1;
        } else if (match.mode === 'SHORTEST') {
          ret.sTotal++;
          s = 1;
        }

        for (const player of match.players) {
          // Don't Include Bot
          if (player.codingamerId === 4265340) continue;

          const p = {
            playerId: player.codingamerId,
            name: player.codingamerNickname,
            handle: player.codingamerHandle,
            avatarId: player.codingamerAvatarId,
            rank: player.rank,
            language: player.languageId,
          };
          let index = ret.players.findIndex((v) => v.playerId === p.playerId);
          if (index === -1) {
            index = ret.players.push({
              playerId: p.playerId,
              name: p.name,
              avatarId: p.avatarId,
              handle: p.handle,
              total: 0,
              fTotal: 0,
              rTotal: 0,
              sTotal: 0,
              languages: [],
              won: 0,
              fWon: 0,
              rWon: 0,
              sWon: 0,
              ranks: {fastest: [], reverse: [], shortest: []},
            });
            index--;
          }
          const pl = ret.players[index];
          pl.total++;
          if (f) {
            pl.fTotal++;
            pl.ranks.fastest.push(p.rank);
            if (p.rank === 1) pl.fWon++;
          } else if (r) {
            pl.rTotal++;
            pl.ranks.reverse.push(p.rank);
            if (p.rank === 1) pl.rWon++;
          } else if (s) {
            pl.sTotal++;
            pl.ranks.shortest.push(p.rank);
            if (p.rank === 1) pl.sWon++;
          }
          if (p.rank === 1) pl.won++;
          if (p.language === 'undefined' || p.language === null) continue;

          // Add Language
          // TODO: Improve Performance :
          // Use Dictionary and parse it to array at the end making complexcity O(2n) rather than O(n^2)
          let lanIndex = pl.languages.findIndex((v) => v.name === p.language);
          if (lanIndex === -1) {
            lanIndex = pl.languages.push({name: p.language, used: 0});
            lanIndex--;
          }
          pl.languages[lanIndex].used++;

          // Global languages
          let glanIndex = ret.languages.findIndex(
              (v) => v.name === p.language,
          );
          if (glanIndex === -1) {
            glanIndex = ret.languages.push({
              name: p.language,
              used: 0,
            });
            glanIndex--;
          }
          ret.languages[glanIndex].used++;
        }
      }
      console.timeEnd('create');
      console.log('Generating user friendly report...');
      writeFileSync(
          paths.prevMatches,
          JSON.stringify(ret, null, 2),
      );
      await this.database.setPrevMatchInfo(ret);
      res.json(ret);
    });
  }
}

module.exports = WebServer;
