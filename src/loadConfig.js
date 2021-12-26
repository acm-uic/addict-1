module.exports = () => {
  let config;

  try {
    config = require('../config.json');
  } catch (e) {
    config = {};
  }

  config.user = process.env.ADDICT_USER;
  config.pass = process.env.ADDICT_PASS;
  config.url = process.env.ADDICT_URL;
  config.port = process.env.PORT || 3000;

  const missing = [];
  if (!config.user) {
    missing.push('user');
  }
  if (!config.user) {
    missing.push('pass');
  }
  if (!config.user) {
    missing.push('url');
  }

  if (missing.length > 0) {
    throw new Error(`No ${missing.join(', ')} specified in config.`);
  }

  return config;
};
