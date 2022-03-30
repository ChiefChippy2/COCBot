# Acknowledgements and credits

A major part of the code comes from [rozbrajaczpoziomow/COCBot](https://github.com/rozbrajaczpoziomow/COCBot) and originally [ChaitanyaLKulkarni/COCBot](https://github.com/ChaitanyaLKulkarni/COCBot). This is only a fork of the original repository that got accidentally pushed and merged (blame midnight commits) with a fork of the fork.

# Function of the bot

This repository contains the code for a twitch clash of code bot that also has other miscellaneous functions. Clash of code is a competitive, real-time, multiplayer programmaing game created by [CodinGame](https://codingame.com) where you have to solve a problem within 15 minutes. The API used to communicate with CodinGame is unofficial and is subject to break anytime. A website on localhost (http://localhost:PORT/web/channelName) is also provided for the user to see clash summary. Reports are generated in the data folder.
For command examples, check [EXAMPLE.md](EXAMPLE.md)

# Instructions & Prerequisities

### You will need : 
- Node.js (14 LTS or above)
- npm (comes bundled with node.js) in PATH
- Chrome (stable) for logging the bot into CodinGame (or, alternatively, there's a way to do it manually, see below). This should be a one-time procedure and the token validity should be up to 1 year.
- ...and other dependencies that will be installed (takes around 50 MB uncompressed)

### Setup :
1. Simply download the code, unzip if necessary. Open a terminal in the directory and run `npm i`. This should install everything.
2. Create a `.env` file, following the model given in `example.env`. If a value is surrounded by square brackets, they are not necessary.
3. Run the bot and let it do its thing. NOTE: If you are running this on a vps or any environment without a chrome installatation nor a display, you will need to set the cookies manually. See the steps below :

# Manually logging in the bot to CodinGame

Because of a change made in the end of october 2021, logins require Captcha which means human interaction. To solve this, there are three solutions : either 1) ask a human to input the username, password, and captcha, or 2) ask a human to login from a separate browser, then to provide the cookies, or 3) make a robot solve a im-not-a-robot challenge.

Of course, the third option was not feasible and I will not elaborate. The first option was more user-friendly and would be a lot faster, but I also didn't cut off the 2nd option. Here's how you can provide the cookies manually: 

1. Login to CodinGame with your bot account
2. Create a file in `data` called `.bottoken`
3. Paste this, replacing the values by the actual values of the cookies (you can see cookies by doing ctrl+shift+i and then going to the "Applications" tab and then selecting the sub-menu "Cookies")
```json
[
  {
    "key": "cgSession",
    "value": "...",
    "domain":"www.codingame.com",
    "path":"/",
    "secure":true,
    "httpOnly":true,
    "hostOnly":false,
  },
  {
    "key": "rememberMe",
    "value": "...",
    "domain":"www.codingame.com",
    "path":"/",
    "secure":true,
    "httpOnly":true,
    "hostOnly":false,
  }
]
```
4. Try launching the bot. It will update the file correctly if the credentials provided are valid.

NB. Please don't leak the rememberMe token as it may give other people access to your bot CG account.

# CLI Options

Do `node path/to/index.js help` to see a list of CLI Options.

# Using a custom database

## THIS IS STILL IN EXPERIMENTAL PHASE

You can use another database instead of sqlite. Simply add --use-db=type://path/to/db where type:// is the type of database, and path/to/db is the path to db. Prefer absolute paths. The code uses [Keyv](https://www.npmjs.com/package/keyv) as wrapper, and it supports Redis, MongoDB, SQLite, PostgreSQL, and MySQL. You'll need to install the sub-wrapper needed for the custom db: `@keyv/redis`, `@keyv/mongo`, `@keyv/sqlite`, `@keyv/postgres`, or `@keyv/mysql`.

# Potential Issues :

### Sorry, we can't find your chrome installation. Can you link us to your chrome installation ? Feel free to paste it below. It will be automatically added to your .env file

> It means your chrome installation is in a non-standard path and can't be found by the bot. You can simply copy the whole path and paste it, or manually add it to `.env` and restart the bot.

### [...] credentials are invalid... oof. Deleting saved cookies.

> It means the cookies saved (or the ones you manually entered) are invalid. You will be automatically prompted to login again.

### I get the above error and it never stops

> Create an issue here. I'd suspect an API change.

### The website is broken/doesn't respond

> Try going into `client` folder and running `npm install ; npm run build`. By default the pages should be built already in release.

### Other errors

> Feel free to Google the error if it is related to puppeteer, or create an issue here. Chrome detection isn't perfect and could error for some.

# Contributing

Feel free to contribute, but make sure you've linted your code with eslint following the rules config and pre-tested the code.
