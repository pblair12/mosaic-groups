var cache;

exports.disableBrowserCache = function(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate');
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  return next();
};
