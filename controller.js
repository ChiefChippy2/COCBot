const {paths} = require('./utils');
const axios = require('axios').default;
const {execSync} = require('child_process');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const puppet = require('puppeteer-core');
const {writeFileSync, readFileSync, existsSync, appendFileSync, unlinkSync} = require('fs');
const rl = require('./utils').readline;

axiosCookieJarSupport(axios);

const cookieJar = new tough.CookieJar();

/**
 * @typedef {import('./utils').CliOptions} CliOptions
 */

/**
 * Controller class
 */
class Controller {
  /**
   * Constructor. Please call init() to actually initiate Controller.
   * @param {CliOptions} options Options
   */
  constructor({noLoginPrompt, forceLogin}) {
    this.noLogin = noLoginPrompt;
    this.forceLogin = forceLogin;

    /**
      * Email for login
      * @type {string|null}
      */
    this.email = process.env.EMAIL;
    /**
      * Password for login
      * @type {string|null}
      */
    this.password = process.env.PASSWORD;
    /**
      * Bot's CodinGame ID
      * @type {string}
      */
    this.myId = null;
    // Setting callBack function
  }
  /**
    * Init
    * @return {Promise<void>}
    */
  async init() {
    if (this.noLogin) {
      if (!existsSync(paths.botToken)) {
        console.log('No saved credentials found!');
        throw new Error('LoginError');
      }
      if (!await this.verifyCreds(true, readFileSync(paths.botToken).toString())) {
        console.log('Bad Credentials!');
        throw new Error('LoginError');
      };
      return true;
    }
    if (!this.forceLogin && existsSync(paths.botToken) && await this.verifyCreds(true, readFileSync(paths.botToken).toString())) return true;
    await this.login();
  }
  /**
    * Verifies credentials
    * @param {boolean} load Whether the function should load the json to cookieJar
    * @param {string} [json] String JSON
    * @return {Promise<boolean>} Whether the credentials are valid
    */
  async verifyCreds(load, json) {
    if (load) {
      console.log('There seems to have been cookies from a previous session that were saved in data/.bottoken ... No login necessary.');
      const cookies = JSON.parse(json);
      this.myId = cookies.pop();
      for (const cookie of cookies) {
        cookieJar.setCookieSync(new tough.Cookie({
          ...cookie,
          'key': cookie.name,
          'expires': new Date(cookie.expires*1000),
        }), 'https://www.codingame.com/settings');
      }
    }
    try {
      await this.createPrivateMatch();
      const biscuits = cookieJar.getCookiesSync('https://www.codingame.com/settings');
      const cookies = [];
      for (const biscuit of biscuits) {
        cookies.push({
          ...biscuit,
          'name': biscuit.key,
          'expires': (biscuit.expires?.getTime?.() ?? 0)/1000,
        });
      }
      if (load && cookies.find((x)=>x.name === 'cgSession') !== JSON.parse(json).find((x)=>x.name === 'cgSession')) {
        console.log('New cookies look different... Updating session token in data/.bottoken...');
        writeFileSync(paths.botToken, JSON.stringify([...cookies, this.myId]));
      }
      console.log('All good!');
      return true;
    } catch (e) {
      console.log(e);
      console.log(load ? 'Loaded' : 'Received', 'credentials are invalid... oof. Deleting saved cookies.');
      unlinkSync(paths.botToken);
      return false;
    }
  }


  /**
    * Tries to detect chrome path on linux
    * @private
    * @return {string|null}
    */
  linuxChromeDetection() {
    const loc = execSync('whereis google-chrome').toString();
    return loc.split(' ').find((path)=>path.endsWith('google-chrome'));
  }


  /**
    * Tries to detect chrome path on Windows (XP+)
    * @private
    * @return {string|null}
    */
  windowsChromeDetection() {
    const resp = execSync('%SystemRoot%\\System32\\reg.exe query "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe"').toString();
    if (!resp) return '';
    return resp.match(/\(Default\)\s+REG_SZ\s+(.+)$/m)?.[1] || '';
  }

  /**
    * Tries to detect chrome path on mac
    * @private
    * @return {string|null}
    */
  macChromeDetection() {
    const resp = execSync('/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister -dump | grep -i "google chrome"').toString();
    if (!resp) return '';
    return resp.match(/executable:\s+(.+?)(?<!Helper)$/m)?.[1] || '';
  }
  /**
    * Gets chrome location
    * @private
    * @return {Promise<string>}
    */
  async detectChrome() {
    console.log('Checking for chrome distribution... hold on for a sec or two...');
    let chromeLoc = '';
    switch (process.platform) {
      // TODO better support
      case 'win32': chromeLoc = this.windowsChromeDetection(); break;
      case 'darwin': chromeLoc = this.macChromeDetection(); break;
      default: chromeLoc = this.linuxChromeDetection(); break;
    };
    const sry = 'Sorry, we can\'t find your chrome installation. Can you link us to your chrome installation ? Feel free to paste it below. It will be automatically added to your .env file';
    if (!chromeLoc) {
      await new Promise((resolve)=>{
        rl.question(sry, (answer)=>{
          chromeLoc = answer.trim();
          resolve();
        });
      });
    }
    if (!chromeLoc) throw new Error('No chrome installation provided! Can\'t proceed!');
    appendFileSync(paths.env, `\nCHROME_PATH=${chromeLoc}`);
    console.log('Gotcha!');
    return chromeLoc;
  }
  /**
     * Logs in
     */
  async login() {
    console.log('Trying to log in...');
    const browser = await puppet.launch({
      executablePath: process.env.CHROME_PATH || await this.detectChrome(),
      headless: false,
    });
    const page = await browser.newPage();
    await page.goto('https://codingame.com/settings');
    await page.waitForNetworkIdle({timeout: 10000});
    await page.evaluate((email, password)=>{
      /* global window, document */
      window.addEventListener('DOMContentLoaded', inject);
      if (document.readyState === 'complete') inject();
      /**
       * Injection
       */
      function inject() {
        const title = document.querySelector('.title-0-1-55');
        if (title) title.innerHTML = 'SIGN IN TO YOUR BOT ACCOUNT (COCBot)';
        const [emailField, passwordField] = document.querySelector('form').querySelectorAll('input');
        if (email) emailField.value = email;
        if (password) passwordField.value = password;
      }
    }, this.email, this.password).catch((e)=>{/* Void cuz not important */});
    console.log('A login page should be launched. If you don\'t see anything, something went wrong.');
    const filter = (response)=>response.url() === 'https://www.codingame.com/services/CodinGamer/loginSite' && response.status() === 200;
    const resp = await page.waitForResponse(filter, {timeout: 1000*60*5});
    const data = await resp.json();
    this.myId = data['codinGamer']['userId'];
    const cookies = await page.cookies();
    for (const cookie of cookies) {
      cookieJar.setCookieSync(new tough.Cookie({
        ...cookie,
        'key': cookie.name,
        'expires': new Date(cookie.expires*1000),
      }), 'https://www.codingame.com/settings');
    }
    writeFileSync(paths.botToken, JSON.stringify([...cookies, this.myId]));

    await browser.close();
    console.log('Login successful... hopefully. Let me check real quick!');
    return await this.verifyCreds(false);
  }
  /**
    *
    * @param {["FASTEST", "SHORTEST", "REVERSE"]} modes Modes that should be available
    * @param {Array<string>} languages Languages
    * @param {boolean} [silent=false] Don't throw error explicitly
    * @return {Promise<string>} Link
    */
  async createPrivateMatch(
      modes = ['FASTEST', 'SHORTEST', 'REVERSE'],
      languages = [],
      silent = false,
  ) {
    if (!this.myId) {
      console.log('ERROR Not logged in');
      return 'Not Logged In!!!';
    }
    const url =
            'https://www.codingame.com/services/ClashOfCode/createPrivateClash';
    const jsonData = [this.myId, languages, modes];
    const data = await axios
        .post(url, jsonData, {
          headers: {'Content-Type': 'application/json;charset=UTF-8'},
          jar: cookieJar, // tough.CookieJar or boolean
          withCredentials: true, // If true, send cookie stored in jar
        })
        .then((d) => d.data)
        .catch((err) => {
          if (!silent) console.log('Error while creating Match', err);
          else throw new Error('Death');
        });
    const matchId = data['publicHandle'];
    return `https://www.codingame.com/clashofcode/clash/${matchId}`;
  }

  /**
   * Starts the match
   * @param {string} matchId Match ID
   * @return {Promise<number>} Number of players present
   */
  async startMatch(matchId) {
    if (!this.myId) {
      console.log('Not Logged In!');
      return 'ERROR Not Logged In!';
    }
    const url =
            'https://www.codingame.com/services/ClashOfCode/startClashByHandle';
    const jsonData = [this.myId, matchId];
    await axios.post(url, jsonData, {
      headers: {'Content-Type': 'application/json;charset=UTF-8'},
      jar: cookieJar, // tough.CookieJar or boolean
      withCredentials: true, // If true, send cookie stored in jar
    });
    const op = await this.getMatchReport(matchId);
    return op.players.length - 1;
  }
  /**
   * Gets report of match
   * @param {string} matchId Match ID
   * @return {Promise<Record<string, any>>}
   */
  async getMatchReport(matchId) {
    if (!this.myId) {
      throw new Error('Missing CodinGamer ID');
    }

    const url =
            'https://www.codingame.com/services/ClashOfCode/findClashReportInfoByHandle';
    const jsonData = [matchId];
    const res = await axios.post(url, jsonData, {
      headers: {'Content-Type': 'application/json;charset=UTF-8'},
      jar: cookieJar, // tough.CookieJar or boolean
      withCredentials: true, // If true, send cookie stored in jar
    });
    return res.data;
  }
}

module.exports = Controller;
