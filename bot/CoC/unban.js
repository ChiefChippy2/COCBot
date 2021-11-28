const {langs} = require('../../utils');

/**
 * Example command
 */
class Unban {
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
    this.metadata = {requireMod: true};
  }
  /**
   * Executes command
   * @param {CocArgs} arg Coc Data
   * @return {string} String
   */
  async exec({subOpts}) {
    if (subOpts.includes('*')) {
      this.bannedLangs = [];
      return 'ALL LANGUAGES HAVE BEEN UNBANNED HALLELUJAH!';
    }
    const unbanList = subOpts.map((x)=>x.toLowerCase()).filter((lang)=>langs.map((formattedLang)=>formattedLang.toLowerCase()).includes(lang));
    if (unbanList.length === 0) return `No languages have been unbanned because none of the provided was valid. Do "${process.env.BOT_PREFIX}help for a list of langs"`;
    this.bannedLangs.splice(0, this.bannedLangs.length, ...this.bannedLangs.filter((x)=>!unbanList.includes(x)));
    return `These following languages have been unbanned : ${unbanList.join(', ')}`;
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
  name: 'unban',
  aliases: ['unblacklist', 'allow'],
  Func: Unban,
};
