const mssql = require('mssql');
const { settingsService } = require('../services');

let sqlConnection = null;

const connect = async () => {
  const companyConfig = await settingsService.getCompanyConfig();
  if (sqlConnection) {
    return sqlConnection.request();
  }
  sqlConnection = await mssql.connect(companyConfig.local.mssql.url);
  return sqlConnection.request();
};

module.exports = {
  connect,
};
