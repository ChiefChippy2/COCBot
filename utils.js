const {join} = require('path');
const paths = {
  'env': join(__dirname, '.env'),
  'botToken': join(__dirname, 'data/.bottoken'),
  'db': join(__dirname, 'data/botData.sqlite'),
};

module.exports = {paths};
