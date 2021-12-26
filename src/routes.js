const api = require('./util/api');
const wrapAsync = require('./util/wrapAsync');
const middleware = require('../middleware');

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

const parseBody = body => {
  let out;
  try {
    if (typeof body === 'string') {
      return JSON.parse(body);
    }

    let booleans = ['passwordExpires', 'enabled'];
    for (const name in body) {
      if (booleans.indexOf(name) > -1) {
        body[name] =
          body[name] === 'true'
            ? true
            : body[name] === 'false'
            ? false
            : body[name];
      }
    }
    return body;
  } catch (e) {
    return body;
  }
};

module.exports = (app, config, ad) => {
  app.get('/user', middleware.checkAuth, async (req, res) => {
    const filter = api.parseQuery(req.query);
    let [error, response] = await wrapAsync(ad.user().get(filter));
    respond(res, error, response);
  });

  app.post('/user', middleware.checkAuth, async (req, res) => {
    let [error, response] = await wrapAsync(ad.user().add(req.body));
    respond(res, error, response);
  });

  app.get('/user/:user', middleware.checkAuth, async (req, res) => {
    const user = req.params.user;
    const config = api.parseQuery(req.query);
    let [error, response] = await wrapAsync(ad.user(user).get(config));
    respond(res, error, response);
  });

  app.get('/user/:user/exists', middleware.checkAuth, async (req, res) => {
    const user = req.params.user;
    let [error, response] = await wrapAsync(ad.user(user).exists());
    respond(res, error, response);
  });

  app.get(
    '/user/:user/member-of/:group',
    middleware.checkAuth,
    async (req, res) => {
      const user = req.params.user;
      const group = req.params.group;
      let [error, response] = await wrapAsync(ad.user(user).isMemberOf(group));
      respond(res, error, response);
    }
  );

  app.post('/user/:user/authenticate', async (req, res) => {
    req.body = parseBody(req.body);
    const user = req.params.user;
    const pass = req.body.pass || req.body.password;
    let [error, response] = await wrapAsync(ad.user(user).authenticate(pass));
    respond(res, error, response);
  });

  app.put('/user/:user', middleware.checkAuth, async (req, res) => {
    req.body = parseBody(req.body);
    const user = req.params.user;
    let [error, response] = await wrapAsync(ad.user(user).update(req.body));
    response = !error ? { success: true } : response;
    error = error ? Object.assign({ success: false }, error) : error;
    respond(res, error, response);
  });

  app.put('/user/:user/password', middleware.checkAuth, async (req, res) => {
    req.body = parseBody(req.body);
    const user = req.params.user;
    const pass = req.body.pass || req.body.password;
    let [error, response] = await wrapAsync(ad.user(user).password(pass));
    response = !error ? { success: true } : response;
    error = error ? Object.assign({ success: false }, error) : error;
    respond(res, error, response);
  });

  app.put(
    '/user/:user/password-never-expires',
    middleware.checkAuth,
    async (req, res) => {
      req.body = parseBody(req.body);
      const user = req.params.user;
      let [error, response] = await wrapAsync(
        ad.user(user).passwordNeverExpires()
      );
      response = !error ? { success: true } : response;
      error = error ? Object.assign({ success: false }, error) : error;
      respond(res, error, response);
    }
  );

  app.put(
    '/user/:user/password-expires',
    middleware.checkAuth,
    async (req, res) => {
      req.body = parseBody(req.body);
      const user = req.params.user;
      let [error, data] = await wrapAsync(ad.user(user).passwordExpires());
      let response = !error ? { success: true } : undefined;
      respond(res, error, response);
    }
  );

  app.put('/user/:user/enable', middleware.checkAuth, async (req, res) => {
    req.body = parseBody(req.body);
    const user = req.params.user;
    let [error, data] = await wrapAsync(ad.user(user).enable());
    let response = !error ? { success: true } : undefined;
    respond(res, error, response);
  });

  app.put('/user/:user/disable', middleware.checkAuth, async (req, res) => {
    req.body = parseBody(req.body);
    const user = req.params.user;
    let [error, data] = await wrapAsync(ad.user(user).disable());
    let response = !error ? { success: true } : undefined;
    respond(res, error, response);
  });

  app.put('/user/:user/move', middleware.checkAuth, async (req, res) => {
    req.body = parseBody(req.body);
    const user = req.params.user;
    const location = req.body.location;
    let [error, response] = await wrapAsync(ad.user(user).move(location));
    respond(res, error, response);
  });

  app.put('/user/:user/unlock', middleware.checkAuth, async (req, res) => {
    req.body = parseBody(req.body);
    const user = req.params.user;
    let [error, data] = await wrapAsync(ad.unlockUser(user));
    let response = !error ? { success: true } : undefined;
    respond(res, error, response);
  });

  app.delete('/user/:user', middleware.checkAuth, async (req, res) => {
    const user = req.params.user;
    let [error, response] = await wrapAsync(ad.user(user).remove());
    respond(res, error, response);
  });

  app.get('/group', middleware.checkAuth, async (req, res) => {
    const config = api.parseQuery(req.query);
    let [error, response] = await wrapAsync(ad.group().get(config));
    respond(res, error, response);
  });

  // Disabled
  // app.post('/group', async (req, res) => {
  //   let [error, response] = await wrapAsync(ad.group().add(req.body));
  //   respond(res, error, response);
  // });

  app.get('/group/:group', middleware.checkAuth, async (req, res) => {
    const group = req.params.group;
    const config = api.parseQuery(req.query);
    let [error, response] = await wrapAsync(ad.group(group).get(config));
    respond(res, error, response);
  });

  app.get('/group/:group/exists', middleware.checkAuth, async (req, res) => {
    const group = req.params.group;
    let [error, response] = await wrapAsync(ad.group(group).exists());
    respond(res, error, response);
  });

  app.post(
    '/group/:group/user/:user',
    middleware.checkAuth,
    async (req, res) => {
      const group = req.params.group;
      const user = req.params.user;
      let [error, response] = await wrapAsync(ad.user(user).addToGroup(group));
      response = !error ? { success: true } : response;
      respond(res, error, response);
    }
  );

  app.delete(
    '/group/:group/user/:user',
    middleware.checkAuth,
    async (req, res) => {
      const group = req.params.group;
      const user = req.params.user;
      let [error, response] = await wrapAsync(
        ad.user(user).removeFromGroup(group)
      );
      response = !error ? { success: true } : response;
      respond(res, error, response);
    }
  );

  // Disabled
  // app.delete('/group/:group', async (req, res) => {
  //   const group = req.params.group;
  //   let [error, response] = await wrapAsync(ad.group(group).remove());
  //   respond(res, error, response);
  // });

  app.get('/ou', middleware.checkAuth, async (req, res) => {
    const filters = api.parseQuery(req.query);
    let [error, response] = await wrapAsync(ad.ou().get(filters));
    respond(res, error, response);
  });

  app.post('/ou', middleware.checkAuth, async (req, res) => {
    let [error, response] = await wrapAsync(ad.ou().add(req.body));
    respond(res, error, response);
  });

  app.get('/ou/:ou', middleware.checkAuth, async (req, res) => {
    let ou = req.params.ou;
    const filters = api.parseQuery(req.query);
    let [error, response] = await wrapAsync(ad.ou(ou).get(filters));
    respond(res, error, response);
  });

  app.get('/ou/:ou/exists', middleware.checkAuth, async (req, res) => {
    const ou = req.params.ou;
    let [error, response] = await wrapAsync(ad.ou(ou).exists());
    respond(res, error, response);
  });

  app.delete('/ou/:ou', middleware.checkAuth, async (req, res) => {
    const ou = req.params.ou;
    let [error, response] = await wrapAsync(ad.ou(ou).remove());
    respond(res, error, response);
  });

  app.get('/other', middleware.checkAuth, async (req, res) => {
    const config = api.parseQuery(req.query);
    let [error, response] = await wrapAsync(ad.other().get(config));
    respond(res, error, response);
  });

  app.get('/all', middleware.checkAuth, async (req, res) => {
    const config = api.parseQuery(req.query);
    let [error, response] = await wrapAsync(ad.all().get(config));
    respond(res, error, response);
  });

  app.get('/find/:filter', middleware.checkAuth, async (req, res) => {
    const filter = req.params.filter;
    const config = api.parseQuery(req.query);
    let [error, response] = await wrapAsync(ad.find(filter, config));
    respond(res, error, response);
  });

  const start = new Date();
  app.get('/status', async (req, res) => {
    let uptime = new Date() - start;
    res.send({ online: true, uptime });
  });
};
