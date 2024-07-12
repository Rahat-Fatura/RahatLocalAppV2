const catchAsync = require('../utils/catchAsync');
const { companyService } = require('../services');

const getCreateCompanyPage = catchAsync(async (req, res) => {
  return res.render('pages/company/create', {
    page: {
      name: 'setup',
      display: 'Kurulum',
      menu: 'setup',
      uppermenu: '',
    },
  });
});

const getDatabasesList = catchAsync(async (req, res) => {
  const databases = await companyService.getDatabasesList();
  return res.send(databases);
});

const getErpsList = catchAsync(async (req, res) => {
  const erps = await companyService.getErpsList();
  return res.send(erps);
});

const getErpVariables = catchAsync(async (req, res) => {
  const { id: erpId } = req.params;
  const erpVariables = await companyService.getErpVariables({ erpId });
  return res.send(erpVariables);
});

const checkApiKey = catchAsync(async (req, res) => {
  const { apikey } = req.body;
  await companyService.checkApiKey({ apiKey: apikey });
  return res.send({ success: true });
});

const createCompany = catchAsync(async (req, res) => {
  const { mssql, appId, variables, key } = req.body;
  const company = await companyService.createCompany({ mssql, appId, variables, key });
  return res.send(company);
});

const getCompaniesList = catchAsync(async (req, res) => {
  const companies = await companyService.getCompaniesList();
  return res.send(companies);
});

const getCompanyDashboard = catchAsync(async (req, res) => {
  return res.render('pages/company/dashboard', {
    page: {
      name: 'dashboard',
      display: 'Dashboard',
      menu: 'dashboard',
      uppermenu: '',
    },
  });
});

const getRecoverPage = catchAsync(async (req, res) => {
  return res.render('pages/company/recover', {
    page: {
      name: 'recover',
      display: 'Recover',
      menu: 'recover',
      uppermenu: '',
    },
  });
});

const recoverFromApiKeyAndTaxNumber = catchAsync(async (req, res) => {
  const { key, taxNumber } = req.body;
  const company = await companyService.recoverCompany({ key, taxNumber });
  return res.send(company);
});

module.exports = {
  getCreateCompanyPage,
  getDatabasesList,
  getErpsList,
  getErpVariables,
  checkApiKey,
  createCompany,
  getCompaniesList,
  getCompanyDashboard,
  recoverFromApiKeyAndTaxNumber,
  getRecoverPage,
};
