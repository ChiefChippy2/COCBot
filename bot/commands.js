const helpTxt = require('./helpTxt.json');
const Controller = require('../controller');

/**
 * @typedef {import('../db.js')} Database
 */

/**
 * Commands
 */
class Commands extends Controller {
  /**
   * Constructor
   * @param {Database} database
   * @param  {...any} args Args to pass to Controller
   */
  constructor(database, ...args) {
    super(...args);
    this.db = database;
  }

  /**
   * Handles CoC
   * @param {string} channelName String channel name, lower case
   * @param {Array<string>} opts Options (Arguments)
   * @param {boolean} isMod Whether author is mod
   * @return {Promise<string>}
   */
  async onCocCmd(channelName, opts, isMod) {
    if (!isMod) {
      return 'Only Mods are allowed!';
    }
    const info = await this.db.getChannelMatches(channelName);
    const currentMatch = !info ? '' : info.currentMatch;
    // No Current Match
    if (opts[0] === 'ban') {
      const willBeBanned = opts.slice(1).filter((x)=>this.languages.map((x)=>x.toLowerCase()).includes(x.toLowerCase()));
      this.bannedLangs.push(willBeBanned.map((x)=>x.toLowerCase()));
      if (this.bannedLangs.length === this.languages.length) {
        return 'Every langugage is now banned! No more clashes?';
      }
      return `${willBeBanned.join(', ')} are now banned!`;
    }
    if (opts[0] === 'banlist') {
      return `${this.bannedLangs.join(', ')} are banned.`;
    }
    if (opts[0] === 'unban') {
      if (opts[1] === '*') {
        this.bannedLangs = [];
        return 'ALL LANGUAGES HAVE BEEN UNBANNED HALLELUJAH!';
      }
      this.bannedLangs = this.bannedLangs.filter((x)=>!opts.slice(1).map((x)=>x.toLowerCase()).includes(x));
      return `${opts.slice(1).join(', ')} have been unbanned!`;
    }
    if (currentMatch) {
      if (opts[0] === 'cancel') {
        await this.db.removeCurrentMatch(channelName);
        return 'Cancelled Current Match!';
      }
      const report = await this.getMatchReport(currentMatch);
      if (!report.started) {
        try {
          if (await report.players.find((x)=>x.codingamerId === this.myId).status !== 'OWNER') return `Bot does not own clash.`;
          this.startMatch(currentMatch);
          return `Starting with ${report.players.length - 1} players:`;
        } catch (e) {
          console.log('Error starting match!');
          return `Error starting match! Try canceling the current lobby and creating a new CoC`;
        }
      }
    }
    const modes = ['FASTEST', 'SHORTEST', 'REVERSE'];
    let selectedModes = [];
    const selectedLang = this.languages.filter((x)=>!this.bannedLangs.includes(x.toLowerCase()));

    if (opts.length > 0) {
      for (const opt of opts) {
        // Check for Mode
        if (['f', 'fast', 'fastest'].includes(opt)) {
          selectedModes.push('FASTEST');
        } else if (['s', 'short', 'shortest'].includes(opt)) {
          selectedModes.push('SHORTEST');
        } else if (['r', 'reverse'].includes(opt)) {
          selectedModes.push('REVERSE');
        } else {
          for (const lang of this.languages) {
            if (lang.toLowerCase() === opt.toLowerCase()) {
              selectedLang.push(lang);
              break;
            }
          }
        }
      }
    }
    if (selectedModes.length === 0) selectedModes = [...modes];
    else selectedModes = [...new Set(selectedModes)]; // Gets unique only
    const res = await this.createPrivateMatch(selectedModes, [...new Set(selectedLang)]);
    const newMatchId = res.split('/').slice(-1)[0];
    await this.db.addMatch(channelName, newMatchId);
    return `New clash : ${res}`;
  }

  /**
   * Handles link
   * @param {string} channelName String channel name, lower case
   * @param {Array<string>} opts Options (Arguments)
   * @param {boolean} isMod Whether author is mod
   * @return {Promise<string>}
   */
  async onLinkCmd(channelName, opts, isMod) {
    const action = opts.shift();
    if (!action || action === 'current') {
      const op = await this.db.getChannelMatches(channelName);
      const matchId = op ? op.currentMatch : '';
      if (!matchId) return 'No Clash Running!';
      const stars = '*'.repeat(Math.floor(Math.random()*10));
      return `${stars} Join Clash: https://www.codingame.com/clashofcode/clash/${matchId} ${stars}`;
    }
    if (action === 'add' && isMod) {
      const matchId = opts.shift()?.toLowerCase?.();
      if (!matchId || !/^[\dabcdef]{36,}$/.test(matchId)) return 'Invalid Match ID';
      await this.db.addMatch();
      return 'Ok, match has been successfully set. Remember however that the bot may not be able to start it.';
    }
    if (action === 'last') {
      const howMany = parseInt(opts.shift()) ?? 1;
      if (isNaN(howMany)) return 'Provide a valid number (last match is 1)';
      const matches = await this.db.getChannelMatches(channelName);
      const id = matches.prevMatches[howMany - 1];
      if (!id) return 'Not found...';
      return `${howMany} match[es] ago, you were playing this clash: https://www.codingame.com/clashofcode/clash/${id}`;
    }
  }
  /**
   * Handles help
   * @param {string} channelName String channel name, lower case
   * @param {Array<string>} opts Options (Arguments)
   * @param {boolean} isMod Whether author is mod
   * @return {Promise<string[]>}
   */
  async onHelpCmd(channelName, opts, isMod) {
    this.commands = await this.db.getChannelCommands(channelName);
    const op = [];
    if (isMod) {
      op.push(helpTxt.mods.replace(/%PREFIX/g, process.env.BOT_PREFIX));
    }
    op.push(helpTxt.all.replace(/%PREFIX/g, process.env.BOT_PREFIX));
    const cust = Object.keys(this.commands[channelName] || {}).map((name)=>`${process.env.BOT_PREFIX}${name}`).join(' ||  ');
    if (cust) op.push('Other Commands: ' + cust);
    return op;
  }
  /**
   * Adds custom command
   * @param {string} channelName String channel name, lower case
   * @param {Array<string>} opts Options (Arguments)
   * @param {boolean} isMod Whether author is mod
   * @return {Promise<string>}
   */
  async onAddCmd(channelName, opts, isMod) {
    if (!isMod) return;
    this.commands = await this.db.getChannelCommands(channelName);
    if (!this.commands[channelName]) this.commands[channelName] = {};

    if (opts.length < 2) {
      return 'Wrong! Usage: !add <command> <response>';
    }
    const cmd = opts.shift().toLowerCase();
    const response = opts.join(' ');
    this.commands[channelName][cmd] = response;
    await this.db.addCommand(channelName, cmd, response);
    return 'Successfully added command: ' + cmd;
  }
  /**
   * Removes custom command
   * @param {string} channelName String channel name, lower case
   * @param {string} cmd Arg
   * @param {boolean} isMod Whether author is mod
   * @return {Promise<string>}
   */
  async onRemoveCmd(channelName, cmd, isMod) {
    if (!isMod) return;
    cmd = cmd[0].toLowerCase();
    this.commands = await this.db.getChannelCommands(channelName);
    if (!this.commands[cmd]) {
      return 'Not Found!';
    }

    delete this.commands[cmd];
    await this.db.removeCommand(channelName, cmd);
    return 'Successfully removed command: ' + cmd;
  }

  /**
   * Handles CoC
   * @param {string} channelName String channel name, lower case
   * @param {string} cmd Arg
   * @param {boolean} isMod Whether author is mod
   * @return {Promise<string>}
   */
  async onElseCmd(channelName, cmd, isMod) {
    this.commands = await this.db.getChannelCommands(channelName);
    if (!this.commands[cmd]) {
      return;
    }
    return this.commands[cmd];
  }
}

module.exports = Commands;
