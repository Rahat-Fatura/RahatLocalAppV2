const catchAsync = require('../utils/catchAsync');

const getDashboardPage = catchAsync(async (req, res) => {
  return res.render('pages/dashboard/dashboard', {
    page: {
      name: 'dashboard',
      display: 'Kontrol Paneli',
      menu: 'dashboard',
      uppermenu: 'dashboard',
    },
  });
});

module.exports = {
  getDashboardPage,
};
