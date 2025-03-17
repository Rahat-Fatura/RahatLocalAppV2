/* eslint-disable dot-notation */
module.exports = (request, response, next) => {
  const app = {
    name: 'Rahat Desktop',
    code: 'rahatdesktop',
    logo: '/img/logo/rd-logo/rahatdesktop-mini.ico',
    logo_light: 'logo/rd-logo/rahatdesktop-mini.ico',
    logo_dark: 'logo/rd-logo/rahatdesktop-mini.ico',
    favicon: '/img/favicon/favicon.ico',
  };
  response['locals']['app'] = app;
  response['locals']['user'] = {
    name: 'Rahat Desktop',
    email: 'info@rahatsistem.com.tr',
  };
  next();
};
