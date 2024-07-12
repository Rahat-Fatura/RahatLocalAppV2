const database = require('../utils/database');

const createCompany = async ({ company, queries, configs }) => {
  const result = await database.companies.create({
    data: {
      app: company.app,
      code: company.code,
      apikey: company.key,
      Configs: {
        create: configs,
      },
      Queries: {
        createMany: {
          data: queries,
        },
      },
    },
  });
  return result;
};

const getCompanyById = async ({ companyId }) => {
  const company = await database.companies.findUnique({
    where: {
      id: Number(companyId),
    },
    include: {
      Configs: true,
      Queries: true,
    },
  });
  return company;
};

const getCompaniesList = async () => {
  const companies = await database.companies.findMany({
    select: {
      id: true,
      app: true,
      code: true,
      cron: true,
      rmq: true,
    },
  });
  return companies;
};

const updateInvoiceConfig = async ({ companyId, queries }) => {
  const updatedInvoiceConfig = await database.companies.update({
    where: {
      id: Number(companyId),
    },
    data: {
      Queries: {
        updateMany: {
          where: {
            type: 'INVOICE',
          },
          data: {
            queries: JSON.stringify(queries),
          },
        },
      },
    },
  });
  return updatedInvoiceConfig;
};

const updateDespatchConfig = async ({ companyId, queries }) => {
  const updatedDespatchConfig = await database.companies.update({
    where: {
      id: Number(companyId),
    },
    data: {
      Queries: {
        updateMany: {
          where: {
            type: 'DESPATCH',
          },
          data: {
            queries: JSON.stringify(queries),
          },
        },
      },
    },
  });
  return updatedDespatchConfig;
};

const updateCompanyConfig = async ({ companyId, companyConfig }) => {
  const updatedCompanyConfig = await database.companies.update({
    where: {
      id: Number(companyId),
    },
    data: {
      Configs: {
        updateMany: {
          where: {
            companyId: Number(companyId),
          },
          data: {
            config: JSON.stringify(companyConfig),
          },
        },
      },
    },
  });
  return updatedCompanyConfig;
};

const updateCompanySeries = async ({ companyId, docType, serie }) => {
  const company = await getCompanyById({ companyId });
  const series = JSON.parse(company.series);
  series[docType] = serie;
  const updatedCompany = await database.companies.update({
    where: {
      id: Number(companyId),
    },
    data: {
      series: JSON.stringify(series),
    },
  });
  return updatedCompany;
};

const updateCompanyCron = async ({ companyId, status }) => {
  const updatedCompany = await database.companies.update({
    where: {
      id: Number(companyId),
    },
    data: {
      cron: status,
    },
  });
  return updatedCompany;
};

const updateCompanyRmq = async ({ companyId, status }) => {
  const updatedCompany = await database.companies.update({
    where: {
      id: Number(companyId),
    },
    data: {
      rmq: status,
    },
  });
  return updatedCompany;
};

const checkCompanyByKey = async ({ apiKey }) => {
  const company = await database.companies.findFirst({
    where: {
      apikey: apiKey,
    },
  });
  return company;
};

module.exports = {
  createCompany,
  getCompanyById,
  getCompaniesList,
  updateInvoiceConfig,
  updateDespatchConfig,
  updateCompanyConfig,
  updateCompanySeries,
  updateCompanyCron,
  updateCompanyRmq,
  checkCompanyByKey,
};
