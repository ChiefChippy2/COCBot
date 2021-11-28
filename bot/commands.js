const Controller = require('../controller');
const CoC = require('./CoC');

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
    /**
      * Banned Languages, if any
      * @type {string[]}
      */
    this.bannedLangs = [];
    this.db = database;
    this.cocHandler = new CoC(this);
    this.onCocCmd = (...args) => this.cocHandler.onCommand(...args);
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
      const matchId = opts.shift()?.toLowerCase?.()?.trim?.()?.replace?.('https://www.codingame.com/clashofcode/clash/', '');
      if (!matchId || !/^[\dabcdef]{36,}$/.test(matchId)) return 'Invalid Match ID';
      await this.db.addMatch(channelName, matchId);
      return 'Ok, match has been successfully set. Remember however that the bot may not be able to start it.';
    }
    if (action === 'last') {
      const howMany = parseInt(opts.shift()) ?? 1;
      if (isNaN(howMany) || howMany < 1) return 'Provide a valid number (last match is 1)';
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
    return 'We have migrated our command help page to : https://github.com/ChiefChippy2/COCBot/blob/main/docs/commands.md';
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
