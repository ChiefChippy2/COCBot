const {join} = require('path');
const paths = {
  'env': join(__dirname, '.env'),
  'botToken': join(__dirname, 'data/.bottoken'),
  'db': join(__dirname, 'data/botData.sqlite'),
  'build': join(__dirname, 'client/build/index.html'),
  'buildDir': join(__dirname, 'client/build/'),
  'prevMatches': join(__dirname, 'data/prevMatches.json'),
  'data': join(__dirname, 'data/'),
};
/**
 * Wrapper function to prevent promises from getting rejected
 * @param {Promise<any>} promise Promise
 * @return {*}
 */
async function noReject(promise) {
  try {
    return await promise;
  } catch (e) {
    return null;
  }
}

/**
 * Parses argv
 * @return {CliOptions} Options
 */
function parseArgv() {
  const args = process.argv.slice(2);
  if (/help\b/.test(args.join(' '))) {
    console.log(`COCBot Command Line Options : 
--no-login                   Disables pupeeteer login prompt and will use the credentials saved in data (if any). Can't be used with -force-login
--no-web                     Disables entire webserver
--no-api                     Disables all API endpoints
--no-store                  |
--test                      |
--no-db                     |Doesn't store any data in database
--force-login                Forces puppeteer login prompt, erasing previous credentials. Can't be used with --no-login
--use-db=type://path/to/db   Uses another database than sqlite. See necessary steps in README.md.
`);
    process.exit(0);
  }
  return {
    'noLoginPrompt': args.includes('--no-login'),
    'noWebServer': args.includes('--no-web'),
    'noAPI': args.includes('--no-api'),
    'noStore': args.includes('--no-store') || args.includes('--test') || args.includes('--no-db'),
    'forceLogin': args.includes('--force-login'),
    'customDB': args.join(' ').match(/--use-db=(?:'|")?(\S+)(?:'|")?/)?.[1],
  };
}
/**
 * @typedef {Object} CliOptions
 * @property {boolean} noLoginPrompt
 * @property {boolean} noWebServer
 * @property {boolean} noAPI
 * @property {boolean} noStore
 * @property {boolean} forceLogin
 * @property {string|null} customDB
 */
module.exports = {paths, noReject, parseArgv};
