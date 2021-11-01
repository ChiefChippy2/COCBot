require('dotenv').config();
const {execSync} = require('child_process');
const Bot = require('./bot');
const WebServer = require('./webserver');
const Database = require('./db');
const {paths} = require('./utils');
const fs = require('fs');

/**
 * Starts everything
 */
async function start() {
  try {
    console.log('Initializing Controller and database...');
    const database = new Database();
    const bot = new Bot(database);
    await database.init();
    await bot.init();
    const server = new WebServer(bot, database);
    console.log('Finished Controller Initialization... Trying to launch webserver...');
    console.log('Checking if website is built...');
    if (fs.existsSync(paths.build)) console.log('False alarm!');
    else {
      console.log('Running react build');
      execSync(`cd ${__dirname} ; cd client ; npm install ; npm run build`);
    }
    server.app.listen(process.env.PORT || 5000, () => console.log('Server is running...'));
  } catch (e) {
    console.error('An error happened whilst initializing! Error Output : ', e);
    console.log('Process exiting...');
    process.exit(1);
  }
}


start();

