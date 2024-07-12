const backendService = require('./backend.service');
const { companyModel } = require('../models');
const logger = require('../config/logger');

const getCompanyById = async ({ companyId }) => {
  const company = await companyModel.getCompanyById({ companyId });
  return company;
};

const getInvoiceConfig = async ({ companyId }) => {
  const companyWithQueries = await companyModel.getCompanyById({ companyId });
  const invoiceQuery = companyWithQueries.Queries.find((query) => query.type === 'INVOICE');
  invoiceQuery.queries = JSON.parse(invoiceQuery.queries);
  return invoiceQuery;
};

const getDespatchConfig = async ({ companyId }) => {
  const companyWithQueries = await companyModel.getCompanyById({ companyId });
  const despatchQuery = companyWithQueries.Queries.find((query) => query.type === 'DESPATCH');
  despatchQuery.queries = JSON.parse(despatchQuery.queries);
  return despatchQuery;
};

const getCompanyConfig = async ({ companyId }) => {
  const companyConfig = await companyModel.getCompanyById({ companyId });
  return JSON.parse(companyConfig.Configs[0].config);
};

const updateInvoiceConfig = async ({ companyId, queries }) => {
  const company = await companyModel.getCompanyById({ companyId });
  const updateOnDB = await companyModel.updateInvoiceConfig({ companyId, queries });
  try {
    await backendService.graphql.updateInvoiceConfig(company.apikey, queries);
  } catch (error) {
    logger.error(error);
  }
  return updateOnDB;
};

const updateDespatchConfig = async ({ companyId, queries }) => {
  const company = await companyModel.getCompanyById({ companyId });
  const updateOnDB = await companyModel.updateDespatchConfig({ companyId, queries });
  try {
    await backendService.graphql.updateDespatchConfig(company.apikey, queries);
  } catch (error) {
    logger.error(error);
  }
  return updateOnDB;
};

const updateCompanyConfig = async ({ companyId, companyConfig, updateOnService = false }) => {
  const company = await companyModel.getCompanyById({ companyId });
  const updateOnDB = await companyModel.updateCompanyConfig({ companyId, companyConfig });
  if (updateOnService) {
    try {
      await backendService.graphql.updateCompanyConfig(company.apikey, companyConfig);
    } catch (error) {
      logger.error(error);
    }
  }
  return updateOnDB;
};

const updateCompanySeries = async ({ companyId, docType, serie }) => {
  const company = await companyModel.updateCompanySeries({ companyId, docType, serie });
  return company;
};

const updateCompanyCron = async ({ companyId, status }) => {
  const company = await companyModel.updateCompanyCron({ companyId, status });
  return company;
};

const updateCompanyRmq = async ({ companyId, status }) => {
  const company = await companyModel.updateCompanyRmq({ companyId, status });
  return company;
};

module.exports = {
  getCompanyById,
  getInvoiceConfig,
  getDespatchConfig,
  getCompanyConfig,
  updateInvoiceConfig,
  updateDespatchConfig,
  updateCompanyConfig,
  updateCompanySeries,
  updateCompanyCron,
  updateCompanyRmq,
};
