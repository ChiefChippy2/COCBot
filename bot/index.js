const tmi = require('tmi.js');

const prefix = process.env.BOT_PREFIX;

const CmdHandler = require('./commands');

/**
 * Bot class
 */
class Bot extends CmdHandler {
  /**
   * Constructor
   * @param {...any} args Args to passto CmdHandler
   */
  constructor(...args) {
    super(...args);
    this.client = new tmi.Client({
      options: {},
      connection: {
        reconnect: true,
        secure: true,
      },
      identity: {
        username: process.env.BOT_NICK,
        password: process.env.TMI_TOKEN,
      },
      channels: process.env.CHANNELS.split(','),
    });

    this.client.connect().catch(console.error);
    this.client.on('message', async (channel, user, message, self) => {
      if (self) return;
      if (message[0] !== prefix) return;
      message = message.slice(prefix.length);
      channel = channel.slice(1); // Removes #

      const isMod =
        user.mod || user['user-type'] === 'mod' || channel === user.username;

      channel = channel.toLowerCase();
      const opts = message.split(' ');
      const cmd = opts.shift();
      console.log(`[${new Date().toLocaleTimeString()}]${user.username}: ${process.env.BOT_PREFIX}${cmd}`);
      let op = '';
      switch (cmd) {
        case 'coc':
          op = await this.onCocCmd(channel, opts, isMod);
          break;

        case 'link':
        case 'l':
          op = await this.onLinkCmd(channel, opts, isMod);
          break;

        case 'add':
        case 'set':
          op = await this.onAddCmd(channel, opts, isMod);
          break;

        case 'remove':
        case 'reset':
          op = await this.onRemoveCmd(channel, opts, isMod);
          break;
        case 'help':
          op = await this.onHelpCmd(channel, opts, isMod);
          for (const o of op) {
            if (!o) continue;
            await this.client.say(channel, o);
          }
          return;
        default:
          op = await this.onElseCmd(channel, cmd, isMod);
      }

      if (op) await this.client.say(channel, op);
    });
  }
}
module.exports = Bot;
