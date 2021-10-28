const {db} = require('./utils');
const Keyv = require('keyv');
const database = new Keyv(`sqlite://${db}`, {namespace: 'internals'});
const matchesDatabase = new Keyv(`sqlite://${db}`, {namespace: 'matches'});

database.on('error', err => console.log('Connection Error with database', err));
/**
 * Internals : 
 * 
 * matchInfo -> Array of matchInformation
 * commands -> Array of commands
 * 
 */

const getAll = async () => {
  return await database.get('matchInfo') || [];
};

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
const removeCurrentMatch = async (channelName) => {
    const mInfo = await database.get('matchInfo');
    mInfo[channelName]?.currentMatch = null;
    return await database.set('matchInfo', mInfo);

};
const getChannelMatches = async (channelName) => {
  const mInfo = await database.get('matchInfo');
  return mInfo[channelName];
};

const getChannelCommands = async (channelName) => {
  const cInfo = await database.get('commands');
  return cInfo[channelName];
};

const addCommand = async (channelName, command, response) => {
    const cInfo = await database.get('commands');
    cInfo[channelName] = {
      [command]: response,
    };
    return await database.set('commands', cInfo);
};
// drk what author is trying to do here
const getCommands = async () => {
    return await database.get('commands');
};

const removeCommand = async (channelName, command) => {
  const cInfo = await database.get('commands');
  if (cInfo[channelName]?.[command]) cInfo[channelName][command] = null;
  return await database.set('commands', cInfo);
};

const getPrevMatchInfo = async () => {
  return await matchesDatabase.get('matches');
}
const setPrevMatchInfo = async (data) => {
  return await matchesDatabase.set('matches', data);
}

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
