const {langs} = require('../../utils');
/**
 * Banlist command
 */
class Banlist {
  /**
   * Constructor
   * @param {Commands} mainHandler Main handler
   */
  constructor(mainHandler) {
    this.bannedLangs = mainHandler.bannedLangs;
    this.db = mainHandler.db;
    /**
     * @type {CoCMetadata}
     */
    this.metadata = {requireMod: false};
  }
  /**
   * Executes command
   * @param {CocArgs} arg Coc Data
   * @return {string} String
   */
  async exec() {
    const banned = this.bannedLangs.map((lang)=>langs.find((formattedLang)=>formattedLang.toLowerCase() === lang));
    if (banned.length === 0) return 'No languages are banned';
    return `List of banned languages : ${banned.join(', ')}`;
  }
}

/**
 * @typedef {import('../commands')} Commands
 * @typedef {Object} CoCMetadata
 * @property {boolean} [requireMod=false] Requires mod perms
 * @typedef {Object} CocArgs
 * @property {string} channelName
 * @property {boolean} isMod
 * @property {string} cmd
 * @property {string[]} subOpts
 * @property {string} currentMatch
 */

module.exports = {
  name: 'banlist',
  aliases: ['blist', 'bl'],
  Func: Banlist,
};
