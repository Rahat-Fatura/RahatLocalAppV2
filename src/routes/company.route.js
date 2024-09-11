const express = require('express');
const { companyController, movementsController, streamController, erpController } = require('../controllers');
const { settingsController } = require('../controllers');

const router = express.Router();

router.get('/list', companyController.getCompaniesList);

router.get('/create', companyController.getCreateCompanyPage);
router.post('/create', companyController.createCompany);
router.get('/create/databases', companyController.getDatabasesList);
router.get('/create/erps', companyController.getErpsList);
router.get('/create/erps/:id', companyController.getErpVariables);
router.post('/create/check/api-key', companyController.checkApiKey);

router.get('/recover', companyController.getRecoverPage);
router.post('/recover', companyController.recoverFromApiKeyAndTaxNumber);

router.get('/:companyId/settings', settingsController.getSettingsPage);
router.get('/:companyId/settings/config/invoice', settingsController.getInvoiceConfig);
router.post('/:companyId/settings/config/invoice', settingsController.updateInvoiceConfig);
router.get('/:companyId/settings/config/despatch', settingsController.getDespatchConfig);
router.post('/:companyId/settings/config/despatch', settingsController.updateDespatchConfig);
router.get('/:companyId/settings/config/company', settingsController.getCompanyConfig);
router.post('/:companyId/settings/config/company', settingsController.updateCompanyConfig);
router.put('/:companyId/settings/general.nbs/:status', settingsController.toggleNumberBeforeSend);
router.put('/:companyId/settings/document.nbs/document/serie', settingsController.updateDocumentSerie);
router.put('/:companyId/settings/document.nbs/:docType/:status', settingsController.toggleDocumentNumberBeforeSend);
router.put('/:companyId/settings/cron/:status', settingsController.toggleCronStatus);
router.put('/:companyId/settings/rmq/:status', settingsController.toggleRmqStatus);
router.get('/:companyId/settings/sql/invoice/http-activate', settingsController.getInvoiceHttpActivateSql);
router.get('/:companyId/settings/sql/invoice/http-function', settingsController.getInvoiceHttpFunctionSql);
router.get('/:companyId/settings/sql/invoice/table-trigger', settingsController.getInvoiceTableTriggerSql);
router.get('/:companyId/settings/sql/invoice/copy/:query', settingsController.getInvoiceCopySql);
router.get('/:companyId/settings/sql/despatch/http-activate', settingsController.getDespatchHttpActivateSql);
router.get('/:companyId/settings/sql/despatch/http-function', settingsController.getDespatchHttpFunctionSql);
router.get('/:companyId/settings/sql/despatch/table-trigger', settingsController.getDespatchTableTriggerSql);
router.get('/:companyId/settings/sql/despatch/copy/:query', settingsController.getDespatchCopySql);

router.get('/:companyId/movements', movementsController.getDocumentsMovementPage);
router.get('/:companyId/movements/dt-list', movementsController.getDocumentsList);

router.get('/:companyId/stream/invoice/insert/:exId', streamController.insertInvoice);
router.get('/:companyId/stream/invoice/update/:exId', streamController.updateInvoice);
router.get('/:companyId/stream/invoice/delete/:exId', streamController.deleteInvoice);
router.get('/:companyId/stream/despatch/insert/:exId', streamController.insertDespatch);
router.get('/:companyId/stream/despatch/update/:exId', streamController.updateDespatch);
router.get('/:companyId/stream/despatch/delete/:exId', streamController.deleteDespatch);

router.get('/:companyId/invoices', erpController.getERPInvoicesPage);
router.get('/:companyId/invoice/send/:exId', erpController.sendInvoice);
router.get('/:companyId/despatches', erpController.getERPDespatchesPage);
router.get('/:companyId/despatch/send/:exId', erpController.sendDespatch);

router.get('/:companyId/dashboard', companyController.getCompanyDashboard);

module.exports = router;
