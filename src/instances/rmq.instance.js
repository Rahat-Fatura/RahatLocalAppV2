const amqp = require('amqp-connection-manager');
const { settingsService } = require('../services');
// const logger = require('../config/logger');

let connection;

const instance = async ({ host, companyId }) => {
  if (!connection) {
    const url = (await settingsService.getCompanyConfig({ companyId })).services.rabbitmq[host];
    connection = amqp.connect(url);
  }
  return connection;
};

module.exports = { instance };
