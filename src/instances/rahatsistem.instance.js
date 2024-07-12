const axios = require('axios');
const { settingsService } = require('../services');

const backends = {};
const instance = async ({ companyId }) => {
  if (!backends[companyId]) {
    const { url } = (await settingsService.getCompanyConfig({ companyId })).services.apiGateway;
    backends[companyId] = axios.create({
      baseURL: url,
    });

    backends[companyId].interceptors.request.use((request) => {
      request.headers['Content-Type'] = 'application/json';
      return request;
    });

    backends[companyId].interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Servise erişilemiyor.');
        }
        throw new Error(JSON.stringify(error.response.data));
      },
    );
    return backends[companyId];
  }
  return backends[companyId];
};

module.exports = { instance };
