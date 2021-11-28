const {langs} = require('../../utils');

/**
 * Example command
 */
class Ban {
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
    const willBeBanned = subOpts.map((x)=>x.toLowerCase()).filter((x)=>{
      return langs.map((formattedLang)=>formattedLang.toLowerCase()).includes(x) && !this.bannedLangs.includes(x);
    });
    this.bannedLangs.push(...willBeBanned);
    if (this.bannedLangs.length === langs.length) {
      return 'Every langugage is now banned! No more clashes?';
    }
    if (this.bannedLangs.length === 0) {
      return `No valid languages given... Do "${process.env.BOT_PREFIX}help" for a list of langs (case insensitive)`;
    }
    return `These following languages are being banned : ${willBeBanned.join(', ')}`;
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
  name: 'ban',
  aliases: ['blacklist', 'disallow'],
  Func: Ban,
};
