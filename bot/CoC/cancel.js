/**
 * Cancel command
 */
class Cancel {
  /**
   * Constructor
   * @param {Commands} mainHandler Main handler
   */
  constructor(mainHandler) {
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
  async exec({currentMatch, channelName}) {
    if (currentMatch) {
      await this.db.removeCurrentMatch(channelName);
      return 'Cancelled Current Match!';
    }
    return 'No match running!';
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
  name: 'cancel',
  aliases: ['delete', 'c'],
  Func: Cancel,
};
