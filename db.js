const {paths} = require('./utils');
const Keyv = require('keyv');
const {existsSync, mkdirSync} = require('fs');

/**
 * @typedef {import('./utils').CliOptions} CliOptions
 */

/**
 * Internals :
 *
 * matchInfo -> Array of matchInformation
 * commands -> Array of commands
 *
 */
class Database {
  /**
   * Constructor
   * @param {CliOptions} options Options
   */
  constructor({customDB, noStore}) {
    if (!existsSync(paths.data)) mkdirSync(paths.data);
    /**
     * @type {string}
     * @private
     */
    this.dbPath = `sqlite://${paths.db}`;
    if (noStore) {
      this.dbPath = '';
    }
    if (customDB) {
      this.dbPath = customDB;
    }
    this.database = new Keyv(this.dbPath, {namespace: 'internals'});
    this.matchesDdatabase = new Keyv(this.dbPath, {namespace: 'matches'});
    this.database.on('error', (err) => console.log('Connection Error with database', err));
  }
  /**
 * Initializes db
 * @return {Promise<boolean>}
 */
  async init() {
    const mInfo = await this.database.get('matchInfo') || {};
    await this.database.set('matchInfo', mInfo);

    const cInfo = await this.database.get('commands') || {};
    await this.database.set('commands', cInfo);
  };
  /**
   * Get all match info
   * @return {Record<MatchObject>}
   */
  async getAll() {
    return await this.database.get('matchInfo') || {};
  };
  /**
 * Adds a match
 * @param {string} channelName Channel Name
 * @param {string} matchId Match ID
 * @param {boolean} [removeCurrent=false] Remove current Match
 * @return {Promise<boolean>}
 */
  async addMatch(channelName, matchId, removeCurrent = false) {
    const chobj = await this.getChannelMatches(channelName);
    let prev = [];
    if (chobj) {
      prev = chobj['prevMatches'];
      if (chobj['currentMatch'] !== '' && !removeCurrent) {
        prev.unshift(chobj['currentMatch']);
      }
    }
    const mInfo = await this.database.get('matchInfo');
    mInfo[channelName] = {
      currentMatch: matchId,
      prevMatches: prev,
    };
    return await this.database.set('matchInfo', mInfo);
  };
  /**
 * Removes the current match
 * @param {string} channelName Channel Name
 * @return {Promise<boolean>}
 */
  async removeCurrentMatch(channelName) {
    const mInfo = await this.database.get('matchInfo');
    mInfo[channelName].currentMatch = null;
    return await this.database.set('matchInfo', mInfo);
  };
  /**
 * Gets Channel matches
 * @param {string} channelName Gets all matches for channel
 * @return {Promise<MatchObject>}
 */
  async getChannelMatches(channelName) {
    const mInfo = await this.database.get('matchInfo');
    return mInfo[channelName];
  };

  /**
 * Gets Channel Commands
 * @param {string} channelName Gets all commands for channel
 * @return {Promise<Record<string, string>>}
 */
  async getChannelCommands(channelName) {
    const cInfo = await this.database.get('commands');
    return cInfo[channelName] || {};
  };

  /**
 * Adds channel command
 * @param {string} channelName Channel name
 * @param {string} command Command
 * @param {string} response Response
 * @return {Promise<boolean>}
 */
  async addCommand(channelName, command, response) {
    const cInfo = await this.database.get('commands');
    cInfo[channelName] = {
      ...cInfo[channelName] || {},
      [command]: response,
    };
    return await this.database.set('commands', cInfo);
  };

  /**
 * Gets all commands
 * @return {Promise<Record<string, Record<string, string>>>}
 */
  async getCommands() {
    return await this.database.get('commands');
  };

  /**
 * Removes a command
 * @param {string} channelName Gets all matches for channel
 * @param {string} command Command
 * @return {Promise<boolean>}
 */
  async removeCommand(channelName, command) {
    const cInfo = await this.database.get('commands');
    if (cInfo[channelName]?.[command]) cInfo[channelName][command] = null;
    return await this.database.set('commands', cInfo);
  };

  /**
 * Gets previous match info
 * @return {Promise<Record<string, any>|null>}
 */
  async getPrevMatchInfo() {
    return await this.matchesDdatabase.get('matches');
  };
  /**
 * Sets prev. match info
 * @param {Record<string, any>} data Data
 * @return {Promise<boolean>}
 */
  async setPrevMatchInfo(data) {
    return await this.matchesDdatabase.set('matches', data);
  };
}
/**
 * @typedef {Object} MatchObject
 * @property {string|null} currentMatch Current Match
 * @property {string[]|null} prevMatches Previous Matches
 */
module.exports = Database;
