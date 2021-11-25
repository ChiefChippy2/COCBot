require('dotenv').config();
const {execSync} = require('child_process');
const Bot = require('./bot');
const WebServer = require('./webserver');
const Database = require('./db');
const {paths, parseArgv} = require('./utils');
const fs = require('fs');
const BotConsole = require('./bot/stdin');

/**
 * Starts everything
 */
async function start() {
  try {
    const options = parseArgv();
    if (options.forceLogin && options.noLoginPrompt) {
      console.log('--no-login AND --force-login detected at the same time');
      process.exit(1);
    }
    console.log('Initializing Controller and database...');
    const database = new Database(options);
    const bot = new Bot(database, options);
    await database.init();
    await bot.init();
    console.log('Finished Controller Initialization... Trying to launch webserver...');
    if (!options.noWebServer) {
      const server = new WebServer(bot, database, options);
      console.log('Checking if website is built...');
      if (fs.existsSync(paths.build)) console.log('False alarm!');
      else {
        console.log('Running react build... this might take a while');
        execSync(`cd ${__dirname} ; cd client ; npm install ; npm run build`);
      }
      server.app.listen(process.env.PORT || 5000, () => console.log(`Webserver is running on port ${process.env.PORT || 5000}`));
    } else console.log('Skipped.');
    if (!options.noInput) {
      const consoleUI = new BotConsole(bot.client);
      consoleUI.captureInput();
    }
  } catch (e) {
    console.error('An error happened whilst initializing! Error Output : ', e);
    console.log('Process exiting...');
    process.exit(1);
  }
}


start();

