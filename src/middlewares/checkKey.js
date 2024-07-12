const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');
const isAppActive = require('../utils/appIsActive');

module.exports = catchAsync(async (req, res, next) => {
  const key = config.get('apikey');
  if (!key) {
    return res.redirect('/activate');
  }
  if (!isAppActive()) {
    return res.redirect('/activate/setup');
  }
  return next();
});
