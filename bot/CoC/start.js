/**
 * Example command
 */
class Start {
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
  async exec({currentMatch}) {
    const report = await this.mainHandler.getMatchReport(currentMatch);
    if (!report.started && !report.finished) {
      try {
        if (report.players.length < 2) return 'More players required...';
        if (await report.players.find((x)=>x.codingamerId === this.mainHandler.myId).status !== 'OWNER') return `Bot does not own clash.`;
        await this.mainHandler.startMatch(currentMatch);
        return `Starting with ${report.players.length - 1} players:`;
      } catch (e) {
        console.log(e);
        console.log('Error starting match!');
        return `Error starting match! Try canceling the current lobby and creating a new CoC`;
      }
    } else return `Clash either started already or finished already`;
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
  name: 'start',
  aliases: ['s', 'begin', 'clash'],
  Func: Start,
};
