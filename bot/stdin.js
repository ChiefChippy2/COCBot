const {readline} = require('../utils');
/**
 * @typedef {import('tmi.js').Client} Client
 */
/**
 * Allows you to send commands to the bot through STDIN
 */
class BotConsole {
  /**
   * Constructor
   * @param {Client} client Client
   */
  constructor(client) {
    this.interface = readline;
    this.client = client;
  }
  /**
   * Attaches to console
   */
  captureInput() {
    this.interface.addListener('line', this.injectToClient.bind(this));
  }
  /**
   * Injects input to bot client
   * @param {string} input String input
   */
  injectToClient(input) {
    if (input[0] != process.env.BOT_PREFIX) input = process.env.BOT_PREFIX + input;
    // input = input.replace(/\\n/g, '\n'); // Replace fake newlines by actual ones
    this.client.emit('message', 'console', {'user-id': 'console-0', 'mod': true, 'user-type': 'mod', 'username': 'Console (you)'}, input, false);
  }
}

module.exports = BotConsole;
