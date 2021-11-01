const {paths} = require('./utils');
const Keyv = require('keyv');
const {existsSync, mkdirSync} = require('fs');
if(!existsSync(paths.data)) mkdirSync(paths.data);
const database = new Keyv(`sqlite://${paths.db}`, {namespace: 'internals'});
const matchesDatabase = new Keyv(`sqlite://${paths.db}`, {namespace: 'matches'});

database.on('error', err => console.log('Connection Error with database', err));
/**
 * Internals : 
 * 
 * matchInfo -> Array of matchInformation
 * commands -> Array of commands
 * 
 */
/**
 * Initializes db
 * @return {boolean}
 */
const init = async () => {
  const mInfo = await database.get('matchInfo') || {};
  await database.set('matchInfo', mInfo);

  const cInfo = await database.get('commands') || {};
  await database.set('commands', cInfo);
};

const getAll = async () => {
  return await database.get('matchInfo') || {};
};
/**
 * Adds a match
 * @param {string} channelName Channel Name
 * @param {string} matchId Match ID
 * @param {boolean} [removeCurrent=false] Remove current Match
 * @return {boolean}
 */
const addMatch = async (channelName, matchId, removeCurrent = false) => {
    const chobj = await getChannelMatches(channelName);
    let prev = [];
    if (chobj) {
        prev = chobj["prevMatches"];
        if (chobj["currentMatch"] !== "" && !removeCurrent) {
            prev.unshift(chobj["currentMatch"]);
        }
    }
    const mInfo = await database.get('matchInfo');
    mInfo[channelName] = {
      currentMatch: matchId,
      prevMatches: prev,
    };
    return await database.set('matchInfo', mInfo);
};
/**
 * Removes the current match
 * @param {string} channelName Channel Name
 * @return {boolean}
 */
const removeCurrentMatch = async (channelName) => {
    const mInfo = await database.get('matchInfo');
    mInfo[channelName].currentMatch = null;
    return await database.set('matchInfo', mInfo);

};
/**
 * Gets Channel matches
 * @param {string} channelName Gets all matches for channel
 * @return {MatchObject}
 */
const getChannelMatches = async (channelName) => {
  const mInfo = await database.get('matchInfo');
  return mInfo[channelName];
};

/**
 * Gets Channel Commands
 * @param {string} channelName Gets all commands for channel
 * @return {Record<string, string>}
 */
const getChannelCommands = async (channelName) => {
  const cInfo = await database.get('commands');
  return cInfo[channelName] || {};
};

/**
 * Adds channel command
 * @param {string} channelName Channel name
 * @param {string} command Command
 * @param {string} response Response
 * @return {boolean}
 */
const addCommand = async (channelName, command, response) => {
    const cInfo = await database.get('commands');
    cInfo[channelName] = {
      [command]: response,
    };
    return await database.set('commands', cInfo);
};

/**
 * Gets all commands
 * @return {Record<string, Record<string, string>>}
 */
const getCommands = async () => {
    return await database.get('commands');
};

/**
 * Removes a command
 * @param {string} channelName Gets all matches for channel
 * @param {string} command Command
 * @return {boolean}
 */
const removeCommand = async (channelName, command) => {
  const cInfo = await database.get('commands');
  if (cInfo[channelName]?.[command]) cInfo[channelName][command] = null;
  return await database.set('commands', cInfo);
};

/**
 * Gets previous match info
 * @return {Record<string, any>|null}
 */
const getPrevMatchInfo = async () => {
  return await matchesDatabase.get('matches');
}
/**
 * Sets prev. match info
 * @param {Record<string, any>} data Data
 * @return {boolean}
 */
const setPrevMatchInfo = async (data) => {
  return await matchesDatabase.set('matches', data);
}

/**
 * @typedef {Object} MatchObject
 * @property {string|null} currentMatch Current Match
 * @property {string[]|null} prevMatches Previous Matches
 */
module.exports = {
    init,
    getAll,
    addMatch,
    removeCurrentMatch,
    getChannelMatches,
    getChannelCommands,
    addCommand,
    getCommands,
    removeCommand,
    getPrevMatchInfo,
    setPrevMatchInfo,
};
