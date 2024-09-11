const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { settingsService, operationalService } = require('../services');

const getSettingsPage = catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const company = await settingsService.getCompanyById({ companyId });
  const series = JSON.parse(company.series);
  const companyConfig = JSON.parse(company.Configs[0].config);
  return res.render('pages/settings/settings', {
    page: {
      name: 'settings',
      display: 'Ayarlar',
      menu: 'settings',
      uppermenu: 'settings',
    },
    data: {
      cron: company.cron,
      rmq: company.rmq,
      numberBeforeSending: companyConfig.settings.numberBeforeSending,
      nbs: {
        einvoice:
          companyConfig.settings.nbsDocuments?.einvoice.numbering === true ||
          companyConfig.settings.nbsDocuments?.einvoice.numbering === 'true',
        earchive:
          companyConfig.settings.nbsDocuments?.earchive.numbering === true ||
          companyConfig.settings.nbsDocuments?.earchive.numbering === 'true',
        edespatch:
          companyConfig.settings.nbsDocuments?.edespatch.numbering === true ||
          companyConfig.settings.nbsDocuments?.edespatch.numbering === 'true',
        series: {
          einvoice: series.einvoice,
          earchive: series.earchive,
          edespatch: series.edespatch,
        },
      },
    },
  });
});

const getInvoiceConfig = catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const invoiceConfig = await settingsService.getInvoiceConfig({ companyId });
  return res.send(invoiceConfig);
});

const getDespatchConfig = catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const despatchConfig = await settingsService.getDespatchConfig({ companyId });
  return res.send(despatchConfig);
});

const getCompanyConfig = catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const companyConfig = await settingsService.getCompanyConfig({ companyId });
  return res.send(companyConfig);
});

const updateInvoiceConfig = catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const { queries } = req.body;
  const invoiceConfig = await settingsService.updateInvoiceConfig({ companyId, queries });
  return res.send(invoiceConfig);
});

const updateDespatchConfig = catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const { queries } = req.body;
  const despatchConfig = await settingsService.updateDespatchConfig({ companyId, queries });
  return res.send(despatchConfig);
});

const updateCompanyConfig = catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const { companyConfig } = req.body;
  const updatedCompany = await settingsService.updateCompanyConfig({ companyId, companyConfig, updateOnService: true });
  return res.send(updatedCompany);
});

const toggleNumberBeforeSend = catchAsync(async (req, res) => {
  const { status, companyId } = req.params;
  const companyConfig = await settingsService.getCompanyConfig({ companyId });
  companyConfig.settings.numberBeforeSending = status === 'activate';
  await settingsService.updateCompanyConfig({ companyId, companyConfig, updateOnService: true });
  return res.send({ success: true });
});

const toggleDocumentNumberBeforeSend = catchAsync(async (req, res) => {
  const { status, docType, companyId } = req.params;
  const companyConfig = await settingsService.getCompanyConfig({ companyId });
  companyConfig.settings.nbsDocuments[docType].numbering = status === 'activate';
  await settingsService.updateCompanyConfig({ companyId, companyConfig, updateOnService: true });
  return res.send({ success: true });
});

const updateDocumentSerie = catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const { docType, serie } = req.body;
  if (['einvoice', 'earchive', 'edespatch'].indexOf(docType) === -1) {
    return res.status(httpStatus.BAD_REQUEST).send({ success: false });
  }
  await settingsService.updateCompanySeries({ companyId, docType, serie });
  return res.send({ success: true });
});

const toggleCronStatus = catchAsync(async (req, res) => {
  const { status, companyId } = req.params;
  await settingsService.updateCompanyCron({ companyId, status: status === 'activate' });
  return res.send({ success: true });
});

const toggleRmqStatus = catchAsync(async (req, res) => {
  const { status, companyId } = req.params;
  await settingsService.updateCompanyRmq({ companyId, status: status === 'activate' });
  return res.send({ success: true });
});

const getInvoiceHttpActivateSql = catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const query = await operationalService.getInvoiceHttpActivateQuery({ companyId });
  return res.send({ query });
});

const getInvoiceHttpFunctionSql = catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const query = await operationalService.getInvoiceHttpFunctionQuery({ companyId });
  return res.send({ query });
});

const getInvoiceTableTriggerSql = catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const query = await operationalService.getInvoiceTableTriggerQuery({ companyId });
  return res.send({ query });
});

const getDespatchHttpActivateSql = catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const query = await operationalService.getDespatchHttpActivateQuery({ companyId });
  return res.send({ query });
});

const getDespatchHttpFunctionSql = catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const query = await operationalService.getDespatchHttpFunctionQuery({ companyId });
  return res.send({ query });
});

const getDespatchTableTriggerSql = catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const query = await operationalService.getDespatchTableTriggerQuery({ companyId });
  return res.send({ query });
});

const getInvoiceCopySql = catchAsync(async (req, res) => {
  const { companyId, query } = req.params;
  const result = await operationalService.getInvoiceQuery({ companyId, query });
  return res.send({ query: result });
});

const getDespatchCopySql = catchAsync(async (req, res) => {
  const { companyId, query } = req.params;
  const result = await operationalService.getDespatchQuery({ companyId, query });
  return res.send({ query: result });
});

module.exports = {
  getSettingsPage,
  getInvoiceConfig,
  getDespatchConfig,
  getCompanyConfig,
  updateInvoiceConfig,
  updateDespatchConfig,
  updateCompanyConfig,
  toggleNumberBeforeSend,
  toggleDocumentNumberBeforeSend,
  updateDocumentSerie,
  toggleCronStatus,
  toggleRmqStatus,
  getInvoiceHttpActivateSql,
  getInvoiceHttpFunctionSql,
  getInvoiceTableTriggerSql,
  getDespatchHttpActivateSql,
  getDespatchHttpFunctionSql,
  getDespatchTableTriggerSql,
  getInvoiceCopySql,
  getDespatchCopySql,
};
