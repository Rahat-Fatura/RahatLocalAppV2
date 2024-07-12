/* eslint-disable dot-notation */
module.exports = (request, response, next) => {
  const app = {
    name: 'Rahat Desktop',
    code: 'rahatdesktop',
    logo: '/img/logo/rd-logo/1x/rahatdesktop-logo.png',
    logo_light: 'logo/rd-logo-light/1x/rahatdesktop-logo-light.png',
    logo_dark: 'logo/rd-logo/1x/rahatdesktop-logo.png',
    favicon: '/img/favicon/favicon.ico',
  };
  response['locals']['app'] = app;
  response['locals']['user'] = {
    name: 'Rahat Desktop',
    email: 'info@rahatsistem.com.tr',
  };
  next();
};
