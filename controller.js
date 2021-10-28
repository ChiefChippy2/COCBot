// const bot = require("./bot");
const db = require("./db");
const {paths} = require('./utils');
const axios = require("axios").default;
const {execSync} = require('child_process');
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const tough = require("tough-cookie");
const puppet = require('puppeteer-core');
const {writeFileSync, readFileSync, existsSync, appendFileSync, unlinkSync} = require('fs');
const readline = require('readline');
const {join} = require('path');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
  });  

axiosCookieJarSupport(axios);

const cookieJar = new tough.CookieJar();
/**
 * Controller class
 */
class Controller {
  /**
   * Constructor. Please call init() to actually initiate Controller.
   */
    constructor() {
        this.bannedLangs = [];
        this.languages = [
            "Bash",
            "VB.NET",
            "C++",
            "C#",
            "C",
            "Clojure",
            "D",
            "Dart",
            "F#",
            "Go",
            "Groovy",
            "Haskell",
            "Java",
            "Javascript",
            "Kotlin",
            "Lua",
            "ObjectiveC",
            "OCaml",
            "Pascal",
            "Perl",
            "PHP",
            "Python3",
            "Ruby",
            "Rust",
            "Scala",
            "Swift",
            "TypeScript",
        ];
        this.email = process.env.EMAIL;
        this.password = process.env.PASSWORD;
        this.myId = null;
        this.db = db;
        //Setting callBack function
        // bot.on_cocCmd = this.onCocCmd.bind(this);
        // bot.on_linkCmd = this.onLinkCmd.bind(this);
        // bot.on_addCmd = this.onAddCmd.bind(this);
        // bot.on_removeCmd = this.onRemoveCmd.bind(this);
        // bot.on_elseCmd = this.onElseCmd.bind(this);
        // bot.on_helpCmd = this.onHelpCmd.bind(this);
    }
    /**
     * Init
     * @return {void}
     */
    async init() {
      // this.commands = await this.db.getCommands();
      if (existsSync(paths.botToken) && await this.verifyCreds(true, readFileSync(paths.botToken).toString())) return true;
      await this.login();
    }
    /**
     * Verifies credentials
     * @param {boolean} load Whether the function should load the json to cookieJar
     * @param {string} [json] String JSON
     * @return {boolean} Whether the credentials are valid
     */
    async verifyCreds(load, json){
      if(load) {
        const cookies = JSON.parse(json);
        this.myId = cookies.pop();
        for(let cookie of cookies){
          cookieJar.setCookieSync(new tough.Cookie({
            ...cookie,
            'key': cookie.name,
            'expires': new Date(cookie.expires*1000),
          }), 'https://www.codingame.com/settings');
        }
      }
        try{
          this.createPrivateMatch()
          console.log('All good!');
          return true;
        } catch {
          console.log(load ? 'Loaded' : 'Received', 'credentials are invalid... oof');
          unlinkSync(paths.botToken);
          return false;
        }
    }

    /**
     * Tries to detect chrome path on linux
     * @return {string|null}
     */
    #linuxChromeDetection(){
      const loc = execSync('whereis google-chrome').toString();
      return loc.split(' ').find(path=>path.endsWith('google-chrome'));
    }

    /**
     * Tries to detect chrome path on Windows (XP+)
     * @return {string|null}
     */
    #windowsChromeDetection(){
      const resp = execSync('%SystemRoot%\\System32\\reg.exe query "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe"').toString();
      if (!resp) return '';
      return resp.match(/\(Default\)\s+REG_SZ\s+(.+)$/m)?.[1] || '';
    }

    /**
     * Tries to detect chrome path on mac
     * @return {string|null}
     */
    #macChromeDetection(){
      const resp = execSync('/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister -dump | grep -i "google chrome"').toString();
      if(!resp) return '';
      return resp.match(/executable:\s+(.+?)(?<!Helper)$/m)?.[1] || '';
    }
    /**
     * Gets chrome location
     * @return {string}
     */
    async #detectChrome(){
      console.log('Checking for chrome distribution... hold on for a sec or two...');
      let chromeLoc = '';
      switch (process.platform){
        // TODO better support
        case 'win32': chromeLoc = this.#windowsChromeDetection();break;
        case 'darwin': chromeLoc = this.#macChromeDetection();break;
        default: chromeLoc = this.#linuxChromeDetection();break;
      };
      const sry = 'Sorry, we can\'t find your chrome installation. Can you link us to your chrome installation ? Feel free to paste it below. It will be automatically added to your .env file'
      if (!chromeLoc) await new Promise((resolve)=>{
          rl.question(sry, (answer)=>{
          chromeLoc = answer.trim();
          resolve();
        })
      }); 
      if (!chromeLoc) throw new Error('No chrome installation provided! Can\'t proceed!');
      appendFileSync(paths.env, `\nCHROME_PATH=${chromeLoc}`);
      console.log('Gotcha!');
      return chromeLoc;
    }
    /**
     * Logs in
     */
    async login() {
      console.log('Trying to log in...')
      const browser = await puppet.launch({
        executablePath: process.env.CHROME_PATH || await this.#detectChrome(),
        headless: false
      });
      const page = await browser.newPage();
      await page.goto('https://codingame.com/settings');
      await page.waitForNetworkIdle({timeout: 10000});
      await page.evaluate((email, password)=>{
        window.addEventListener('DOMContentLoaded', inject);
        if (document.readyState === 'complete') inject();
        function inject(){
          const title = document.querySelector('.title-0-1-55');
          if (title) title.innerHTML = 'SIGN IN TO YOUR BOT ACCOUNT (COCBot)';
          const [emailField, passwordField] = document.querySelector('form').querySelectorAll('input');
          if (email) emailField.value = email;
          if (password) passwordField.value = password;
        }
      }, this.email, this.password).catch(e=>{ /* Void cuz not important */ });
      console.log('A login page should be launched. If you don\'t see anything, something went wrong.');
      const filter = (response)=>response.url() === 'https://www.codingame.com/services/CodinGamer/loginSite' && response.status() === 200
      const resp = await page.waitForResponse(filter, {timeout: 1000*60*5});
      const data = await resp.json();
      this.myId = data["codinGamer"]["userId"];
      const cookies = await page.cookies();
      for(let cookie of cookies){
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

    async createPrivateMatch(
        modes = ["FASTEST", "SHORTEST", "REVERSE"],
        languages = [],
        silent = false
    ) {
        if (!this.myId) {
            console.log("ERROR Not logged in");
            return "Not Logged In!!!";
        }
        const url =
            "https://www.codingame.com/services/ClashOfCode/createPrivateClash";
        const jsonData = [this.myId, { SHORT: "true" }, languages, modes];
        const data = await axios
            .post(url, jsonData, {
                jar: cookieJar, // tough.CookieJar or boolean
                withCredentials: true, // If true, send cookie stored in jar
            })
            .then((d) => d.data)
            .catch((err) => {
                if(!silent) console.log("Error while creating Match", err);
                else throw new Error('Death');
            });
        const matchId = data["publicHandle"];
        return `Join Clash: https://www.codingame.com/clashofcode/clash/${matchId}`;
    }

    async startMatch(matchId) {
        if (!this.myId) {
            console.log("Not Logged In!");
            return "ERROR Not Logged In!";
        }
        const url =
            "https://www.codingame.com/services/ClashOfCode/startClashByHandle";
        const jsonData = [this.myId, matchId];
        const res = await axios.post(url, jsonData, {
            jar: cookieJar, // tough.CookieJar or boolean
            withCredentials: true, // If true, send cookie stored in jar
        });
        const op = await this.getMatchReport(matchId);
        return op.players.length - 1;
    }

    async getMatchReport(matchId) {
        if (!this.myId) {
            console.log("ERROR While getting Report!!");
            return;
        }

        const url =
            "https://www.codingame.com/services/ClashOfCode/findClashReportInfoByHandle";
        const jsonData = [matchId];
        const res = await axios.post(url, jsonData, {
            jar: cookieJar, // tough.CookieJar or boolean
            withCredentials: true, // If true, send cookie stored in jar
        });
        return res.data;
    }

    //BOt COMMMANDS:

    async onCocCmd(channelName, opts, isMod) {
        if (!isMod) {
            return "Only Mods are allowed!";
        }
        const info = await this.db.getChannelMatches(channelName);
        const currentMatch = !info ? "" : info.currentMatch;
        //No Current Match
        if (opts[0] === "ban") {
            const willBeBanned = opts.slice(1).filter(x=>this.languages.map(x=>x.toLowerCase()).includes(x.toLowerCase()));
            this.bannedLangs.push(willBeBanned.map(x=>x.toLowerCase()));
            if (this.bannedLangs.length === this.languages.length) {
                return "Every langugage is now banned! No more clashes?";
            }
            return `${willBeBanned.join(', ')} are now banned!`;
        }
        if (opts[0] === "banlist") {
            return `${this.bannedLangs.join(', ')} are banned.`;
        }
        if (opts[0] === "unban") {
            if (opts[1] === '*') {
                this.bannedLangs = [];
                return "ALL LANGUAGES HAVE BEEN UNBANNED HALLELUJAH!"
            }
            this.bannedLangs = this.bannedLangs.filter(x=>!opts.slice(1).map(x=>x.toLowerCase()).includes(x));
            return `${opts.slice(1).join(', ')} have been unbanned!`;
        }
        if (currentMatch) {
            if (opts[0] === "cancel") {
                await this.db.removeCurrentMatch(channelName);
                return "Cancelled Current Match!";
            }
            const report = await this.getMatchReport(currentMatch);
            if (!report.started) {
                this.startMatch(currentMatch);
                return `Starting with ${report.players.length - 1} players:`;
            }
        }
        const modes = ["FASTEST", "SHORTEST", "REVERSE"];
        let selectedModes = [];
        let selectedLang = this.languages.filter(x=>!this.bannedLangs.includes(x.toLowerCase()));

        if (opts.length > 0) {
            for (const opt of opts) {
                //Check for Mode
                if (["f", "fast", "fastest"].includes(opt)) {
                    selectedModes.push("FASTEST");
                } else if (["s", "short", "shortest"].includes(opt)) {
                    selectedModes.push("SHORTEST");
                } else if (["r", "reverse"].includes(opt)) {
                    selectedModes.push("REVERSE");
                } else {
                    for (const lang of this.languages) {
                        if (lang.toLowerCase() === opt.toLowerCase()) {
                            selectedLang.push(lang);
                            break;
                        }
                    }
                }
            }
        }
        if (selectedModes.length === 0) selectedModes = [...modes];
        else selectedModes = [...new Set(selectedModes)]; //Gets unique only
        const res = await this.createPrivateMatch(selectedModes, [...new Set(selectedLang)]);
        const newMatchId = res.split("/").slice(-1)[0];
        const op = await this.db.addMatch(channelName, newMatchId);
        return res;
    }

    async onLinkCmd(channelName, opts, isMod) {
        const op = await this.db.getChannelMatches(channelName);
        const matchId = op ? op.currentMatch : "";
        if (!matchId) return "No Clash Running!";
        return `Join Clash: https://www.codingame.com/clashofcode/clash/${matchId}  ${Math.floor(
            Math.random() * 10
        )}`;
    }

    onHelpCmd(channelName, opts, isMod) {
        const op = [];
        if (isMod) {
            op.push(
                "Manage Commands:|| !add | !set <command> <response> : After that !<command> will send back <response> ||    !remove | !reset <command> : deletes the <command></command>"
            );
        }
        op.push(
            "COC Bot:  !coc : reset | c[ancel] Cancels current Lobby ||   !coc : Create new lobby, optional parameters to set Mode: f[astest] s[hortest] r[everse] ||  !coc : Start current lobby if any and has not been Started ||  !l[ink] : gives link of current lobby"
        );
        const cust = Object.keys(this.commands[channelName] || {}).reduce(
            (p, a) => p + "   ||   !" + a,
            ""
        );
        if (cust) op.push("Other Commands: " + cust);
        return op;
    }

    async onAddCmd(channelName, opts, isMod) {
        if (!isMod) return;
        if (!this.commands[channelName]) this.commands[channelName] = {};

        if (opts.length < 2) {
            return "Wrong! Usage: !add <command> <response>";
        }
        const cmd = opts.shift().toLowerCase();
        const response = opts.join(" ");
        this.commands[channelName][cmd] = response;
        const op = await this.db.addCommand(channelName, cmd, response);
        return "Successfully added command: " + cmd;
    }

    async onRemoveCmd(channelName, cmd, isMod) {
        if (!isMod) return;
        cmd = cmd[0].toLowerCase();
        console.log(channelName, cmd, this.commands);
        if (!this.commands[channelName] || !this.commands[channelName][cmd])
            return "Not Found!";

        delete this.commands[channelName][cmd];
        const op = await db.removeCommand(channelName, cmd);
        return "Successfully removed command: " + cmd;
    }

    async onElseCmd(channelName, cmd, isMod) {
        if (!this.commands[channelName] || !this.commands[channelName][cmd])
            return;
        return this.commands[channelName][cmd];
    }
}

module.exports = Controller;
