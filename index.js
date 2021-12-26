const AD = require('./CustomLibraries/ad/index.js');
const express = require('express');
const bodyParser = require('body-parser');
const swagpi = require('swagpi');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');

const swagpiConfig = require('./src/swagpi.config.js');
const loadConfig = require('./src/loadConfig');
const routes = require('./src/routes');
const middleware = require('./middleware');

const app = express();
app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

swagpi(app, {
  logo: './src/img/logo.png',
  config: swagpiConfig
});

const init = () => {
  try {
    dotenv.config();
    const config = loadConfig();
    const ad = new AD(config).cache(false);
    middleware.authenticate(app, ad);
    app.listen(config.port);
    routes(app, config, ad);
    console.log(
      `Addict Active Directory API\nListening on port ${config.port || 3000}`
    );
  } catch (err) {
    console.log(err.message);
    process.exit();
  }
};

init();
