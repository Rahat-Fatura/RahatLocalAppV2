const { execSync } = require('child_process');
const {
  getInvoiceHttpActivateSql,
  getInvoiceHttpFunctionSql,
  getInvoiceTableTriggerSql,
  getDespatchHttpActivateSql,
  getDespatchHttpFunctionSql,
  getDespatchTableTriggerSql,
  getInvoiceQuerySql,
} = require('../helpers/query.helper');
const config = require('../config/config');

const getInvoiceHttpActivateQuery = async ({ companyId }) => {
  const result = await getInvoiceHttpActivateSql({ companyId });
  return result;
};

const getInvoiceHttpFunctionQuery = async ({ companyId }) => {
  const appUrl = execSync('hostname').toString().trim();
  const appPort = config.port;
  const result = await getInvoiceHttpFunctionSql({ companyId, appUrl, appPort });
  return result;
};

const getInvoiceTableTriggerQuery = async ({ companyId }) => {
  const result = await getInvoiceTableTriggerSql({ companyId });
  return result;
};

const getDespatchHttpActivateQuery = async ({ companyId }) => {
  const result = await getDespatchHttpActivateSql({ companyId });
  return result;
};

const getDespatchHttpFunctionQuery = async ({ companyId }) => {
  const result = await getDespatchHttpFunctionSql({ companyId });
  return result;
};

const getDespatchTableTriggerQuery = async ({ companyId }) => {
  const result = await getDespatchTableTriggerSql({ companyId });
  return result;
};

const getInvoiceQuery = async ({ companyId, query }) => {
  const result = await getInvoiceQuerySql({ companyId, query });
  return result;
};

module.exports = {
  getInvoiceHttpActivateQuery,
  getInvoiceHttpFunctionQuery,
  getInvoiceTableTriggerQuery,
  getDespatchHttpActivateQuery,
  getDespatchHttpFunctionQuery,
  getDespatchTableTriggerQuery,
  getInvoiceQuery,
};
