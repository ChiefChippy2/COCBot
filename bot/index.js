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
    this.explicitMods = process.env.EXPLICIT_MODS?.split(',').map((x)=>x.toLowerCase());
    this.client.connect().catch(console.error);
    this.client.on('connected', ()=>{
      console.log('Successfully connected to twitch! Logging messages below : ');
    });
    this.client.on('message', async (channel, user, message, self) => {
      if (self) return;
      if (message[0] !== prefix) return;
      message = message.slice(prefix.length);
      channel = channel.slice(1); // Removes #

      const isMod =
        user.mod || user['user-type'] === 'mod' || channel === user.username || this.explicitMods.includes(user.username.toLowerCase());

      channel = channel.toLowerCase();
      const opts = message.split(/ +/);
      const cmd = opts.shift();
      console.log(`[${new Date().toLocaleTimeString()}] ${user.username}: ${process.env.BOT_PREFIX}${message}`);
      let op = '';
      try {
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
            break;
          default:
            op = await this.onElseCmd(channel, cmd, isMod);
        }

        if (op && user['user-id'] === 'console-0') console.log(`[${new Date().toLocaleTimeString()}] ${process.env.BOT_NICK} via console: ${op}`);
        else if (op) await this.client.say('#'+channel, op);
      } catch (e) {
        console.log('An error happened whilst processing the command above!');
        if (process.env.DEV) console.error(e);
        await this.client.say(channel, 'Something went wrong, please try again later or ask the streamer to check logs.');
      }
    });
  }
}
module.exports = Bot;
