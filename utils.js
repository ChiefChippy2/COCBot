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

module.exports = {paths};
