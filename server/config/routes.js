var auth = require('./auth');
var cache = require('./cache');
var config = require('./config');
var users = require('../controllers/usersController');
var groups = require('../controllers/groupsController');
var settings = require('../controllers/settingsController');

var indexRedirect = function(req, res) {
  res.render('index', {
    bootstrappedUser: req.user
  });
}

var secureRedirect = function() {
  return function(req, res, next) {
    if (process.env.NODE_ENV == 'production') {
      if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] === "http") {
        res.redirect('https://' + config.domain + ':' + config.https.port + req.originalUrl);
      } else {
        next();
      }
    } else {
      res.setHeader('Strict-Transport-Security', 'max-age=8640000; includeSubDomains');
      if (!req.secure) {
        res.redirect('https://' + config.domain + ':' + config.https.port + req.originalUrl);
      } else {
        next();
      }
    }
  }
};

module.exports = function(app) {
  app.get('/api/users/:id', cache.disableBrowserCache, auth.requiresRole('admin'), users.getUser);
  app.get('/api/users', cache.disableBrowserCache, users.getUsers);
  app.post('/api/users/:id', auth.requiresApiLogin, users.updateUser);
  app.delete('/api/users/:id', auth.requiresRole('admin'), users.deleteUser);

  app.get('/api/groups/:id', cache.disableBrowserCache, groups.getGroup);
  app.get('/api/groups', cache.disableBrowserCache, groups.getGroups);
  app.post('/api/groups/:id/add-member', settings.requiresGroupsEnabled, groups.addMember);

  app.post('/api/groups/emailGroupReportToSelf', cache.disableBrowserCache, auth.requiresRole('admin'), groups.emailGroupReportToSelf);
  app.post('/api/groups', cache.disableBrowserCache, auth.requiresApiLogin, groups.saveGroup);
  app.post('/api/groups/:id', cache.disableBrowserCache, auth.requiresApiLogin, groups.updateGroup);
  app.delete('/api/groups/:id', auth.requiresApiLogin, groups.deleteGroup);

  app.post('/api/users', cache.disableBrowserCache, users.saveUser, auth.loginUser);

  app.get('/api/settings', cache.disableBrowserCache, settings.getSettings);
  app.post('/api/settings', auth.requiresRole('admin'), settings.updateSettings);

  app.get('/partials/*', function(req, res) {
    res.render('../../public/app/views/' + req.params[0]);
  });

  app.post('/login', auth.login);

  app.post('/logout', auth.logout);

  // ensure that all requests to the login page get directed to the secure page instead
//  app.get('/login', secureRedirect(config), indexRedirect);

  app.get('/login', indexRedirect);

  // ensure that the client side application does ALL of the routing
  app.get('*', indexRedirect);
}