const jwt = require('jsonwebtoken');
const wrapAsync = require('./src/util/wrapAsync');
exports.authenticate = (app, ad) => {
  app.post('/api/authenticate', async (req, res, next) => {
    user = req.body.username;
    pass = req.body.password;

    // Attempt to authenticate the user
    let [errorAuth, responseAuth] = await wrapAsync(
      ad.user(user).authenticate(pass)
    );
    if (errorAuth != null || responseAuth == false) {
      respond(
        res,
        JSON.stringify({ error: 'Could not authenticate user!' }),
        ''
      );
    }

    // Check if user is in Administrator group
    let [error, response] = await wrapAsync(ad.user(user).isMemberOf('WebDev'));
    if (error != null || response == false) {
      respond(
        res,
        JSON.stringify({ error: 'User is not part of the WebDev group@' }),
        ''
      );
    }

    token = jwt.sign({ username: user }, process.env.TOKEN_SECRET, {
      expiresIn: '1800s'
    });
    console.log('User: ' + user + ' generated auth token');
    res.json({ token: token });
  });

  app.post('/api/passwordreset', this.checkAuth, async (req, res, next) => {
    user = req.body.username;
    token = jwt.sign(
      { username: user, passwordchange: true },
      process.env.TOKEN_SECRET,
      { expiresIn: '1d' }
    );
    console.log('User: ' + user + ' generated password reset token');
    res.json({ token: token });
  });
};

exports.checkAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    console.log(err);

    if (err) return res.sendStatus(403);

    if (user.hasOwnProperty('passwordchange')) {
      if (req.url != String('/user/' + user.username + '/password')) {
        return res.sendStatus(403);
      }
    }
    req.user = user;

    next();
  });
};

function respond(res, err, data) {
  if (err && !err.httpStatus) {
    res.status(503);
  }
  if (err && err.httpStatus) {
    res.status(err.httpStatus);
    delete err.httpStatus;
  }
  if (err) {
    err.error = true;
  }
  if (!err && data !== undefined) {
    if (typeof data === 'boolean') {
      data = { data: data };
    }
  }
  let out = err !== undefined && err !== null ? err : data;
  out = out === undefined ? {} : out;
  res.send(out);
}
