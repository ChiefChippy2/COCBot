const {readdirSync} = require('fs');
const {join} = require('path');

/**
 * @typedef {import('../commands')} Commands
 * @typedef {import('./example')} CommandExport
 * @typedef {import('./example').Func} Command
 */

/**
 * Handles all CoC commands
 */
class CoC {
  /**
   * Constructor
   * @param {Commands} commands Commands
   */
  constructor(commands) {
    this.mainHandler = commands;
    /**
     * @type {Record<string, Command>}
     */
    this.commands = readdirSync(__dirname).filter((name)=>{
      return !(name.startsWith('_') || name === 'index.js' || name === 'example.js');
    }).map((name)=>{
      /**
       * @type {CommandExport}
       */
      const cmd = require(join(__dirname, name));
      const command = new cmd.Func(this.mainHandler);
      return [cmd.name, ...(cmd.aliases||[])].map((name)=>({name, value: command}));
    }).flat().reduce((pV, cV)=>{
      if (pV[cV.name]) throw new Error('Repeating command names'+cV.name);
      return {...pV, [cV.name]: cV.value};
    }, {});
  }
  /**
   * Handles inc. commands
   * @param {string} channelName String Channel Name
   * @param {Array<string>} opts String options
   * @param {boolean} isMod Is mod or not
   * @return {Promise<string>}
   */
  async onCommand(channelName, [cmd, ...subOpts], isMod) {
    let generalMessage = '';
    const info = await this.mainHandler.db.getChannelMatches(channelName);
    const currentMatch = !info ? '' : info.currentMatch;
    let command = this.commands[cmd?.toLowerCase?.()];
    // Some wacky code to allow !coc despite it being @deprecated starting this version.
    if (!cmd) {
      command = this.commands[currentMatch ? 'start' : 'new'];
      generalMessage = `
Deprecation Warning : "${process.env.BOT_PREFIX}coc" will be deprecated soon. Please do "!coc start" or "!coc new"`;
    }
    if (!command) return `Not a valid subcommand${generalMessage}`;
    if (command.metadata.requireMod && !isMod) return `Only mods are allowed!${generalMessage}`;
    const response = await command.exec({
      channelName,
      isMod,
      cmd,
      subOpts,
      currentMatch,
    });
    return `${response}${generalMessage}`;
  }
}
module.exports = CoC;

