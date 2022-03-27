const {langs} = require('../../utils');
const modeAliases = ['f', 'fastest', 's', 'shortest', 'r', 'reverse', 'fast', 'sh', 'rev', 'short'];
const aliasToMode = {
  f: 'FASTEST',
  fastest: 'FASTEST',
  fast: 'FASTEST',
  s: 'SHORTEST',
  shortest: 'SHORTEST',
  sh: 'SHORTEST',
  short: 'SHORTEST',
  r: 'REVERSE',
  rev: 'REVERSE',
  reverse: 'REVERSE',
};
/**
 * Example command
 */
class NewClash {
  /**
   * Constructor
   * @param {Commands} mainHandler Main handler
   */
  constructor(mainHandler) {
    this.mainHandler = mainHandler;
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
  async exec({subOpts, channelName}) {
    const args = subOpts.map((x)=>x.toLowerCase());
    const keyword = args[0];
    const availModes = ['FASTEST', 'SHORTEST', 'REVERSE'];
    const chosenModes = args ? args.filter((arg)=>modeAliases.includes(arg)).map((malias)=>aliasToMode[malias]) : [];
    const chosenLangs = args ? args.filter((arg)=>langs.map((x)=>x.toLowerCase()).includes(arg)).map((lang)=>langs.find((x)=>x.toLowerCase() === lang)) : [];
    let availLangs = [...langs.filter((x)=>!this.mainHandler.bannedLangs.includes(x.toLowerCase()))];
    if (!chosenLangs.length && (keyword === 'only' || keyword === 'ban')) return `No valid langs provided for "${keyword}".`;
    if (keyword === 'ban') availLangs = [...availLangs.filter((x)=>!chosenLangs.includes(x))];
    else availLangs = [...new Set(chosenLangs)];
    const match = await this.mainHandler.createPrivateMatch(
      chosenModes.length > 0 ? chosenModes : availModes,
      availLangs);
    await this.mainHandler.db.addMatch(channelName, match.split('/').slice(-1)[0]);
    return `New clash : ${match}`;
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
  name: 'new',
  aliases: ['create', 'n', 'setup', 'init', '+'],
  Func: NewClash,
};
