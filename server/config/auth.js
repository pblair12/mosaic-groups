var passport = require('passport');

// contains all the controllers for the authencication mechanisms

exports.login = function (req, res, next) {
    var auth = passport.authenticate('local', function (err, user) {
        if (err) { return next(err); }
        if (!user) { res.send({ success: false }); }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            res.send({ success: true, user: user });
        });
    });
    auth(req, res, next);
};

exports.loginUser = function (req, res, next) {
    var auth = passport.authenticate('local', function (err, user) {
        if (err) { return next(err); }
        if (!user) { res.send({ success: false }); }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            res.send(user);
        });
    });
    auth(req, res, next);
};

// logs a user out of the system
exports.logout = function (req, res) {
    req.logout();
    res.redirect('/');
};

// if an endpoint requires login and the user is not authenticated, send HTTP 403 error, else next()
exports.requiresApiLogin = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.status(403);
        res.end();
    } else {
        next();
    }
};

// role checks current user against the required role
exports.requiresRole = function (role) {
    return function (req, res, next) {
        if (!req.isAuthenticated() || req.user.roles.indexOf(role) === -1) {
            res.status(403);
            res.end();
        } else {
            next();
        }
    };
};
