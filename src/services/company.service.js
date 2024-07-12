const httpStatus = require('http-status');
const { mssqlModel, companyModel, documentModel } = require('../models');
const ApiError = require('../utils/ApiError');
const backendService = require('./backend.service');

const getDatabasesList = async () => {
  const databases = await mssqlModel.getAllDatabasesList();
  return databases;
};

const getErpsList = async () => {
  const erps = await backendService.graphql.getApps();
  return erps;
};

const getErpVariables = async ({ erpId }) => {
  const erpVariables = await backendService.graphql.getAppVariables({ appId: erpId });
  return erpVariables;
};

const checkApiKey = async ({ apiKey }) => {
  const result = await backendService.ping(apiKey);
  const checkedFromDatabase = await companyModel.checkCompanyByKey({ apiKey });
  if (checkedFromDatabase) throw new ApiError(httpStatus.BAD_REQUEST, 'Firma zaten kayıtlı.');
  return result;
};

const createCompany = async ({ mssql, appId, variables, key }) => {
  await checkApiKey({ apiKey: key });
  try {
    await backendService.graphql.createCompany(mssql, appId, variables, key);
  } catch (error) {
    if (
      error.extensions?.originalError?.message &&
      error.extensions?.originalError?.message?.includes('Unique constraint failed on the fields')
    )
      throw new ApiError(httpStatus.BAD_REQUEST, 'Firma daha önce sisteme kaydedilmiş.');
    else throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
  const companyResult = await backendService.graphql.getEverythingForCompany(key);
  const dataForDatabase = {
    company: {
      app: String(appId),
      code: companyResult.code,
      key: companyResult.key,
    },
    configs: companyResult.Configs.map((config) => {
      return {
        config: JSON.stringify(config.config),
      };
    }),
    queries: companyResult.Queries.map((query) => {
      return {
        queries: JSON.stringify(query.queries),
        type: query.type,
      };
    }),
  };
  const companyOnDatabase = await companyModel.createCompany(dataForDatabase);
  return companyOnDatabase;
};

const recoverCompany = async ({ key, taxNumber }) => {
  const companyFromKey = await checkApiKey({ apiKey: key });
  if (companyFromKey && companyFromKey.detail.company.tax_number !== taxNumber)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Girilen key ile vergi/tc kimlik numarası uyuşmuyor.');
  const companyResult = await backendService.graphql.getEverythingForCompany(key);
  const dataForDatabase = {
    company: {
      app: String(0),
      code: companyResult.code,
      key: companyResult.key,
    },
    configs: companyResult.Configs.map((config) => {
      return {
        config: JSON.stringify(config.config),
      };
    }),
    queries: companyResult.Queries.map((query) => {
      return {
        queries: JSON.stringify(query.queries),
        type: query.type,
      };
    }),
  };
  const companyOnDatabase = await companyModel.createCompany(dataForDatabase);
  return companyOnDatabase;
};

const getCompaniesList = async () => {
  const companies = await companyModel.getCompaniesList();
  return companies;
};

const getDocumentListByCompanyId = async ({ companyId, query }) => {
  const documents = await documentModel.getDocumentListByCompanyId({ companyId: Number(companyId), query });
  return documents;
};

module.exports = {
  getDatabasesList,
  getErpsList,
  getErpVariables,
  checkApiKey,
  createCompany,
  recoverCompany,
  getCompaniesList,
  getDocumentListByCompanyId,
};
