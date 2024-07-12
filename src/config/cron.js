/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const cron = require('node-cron');
const { companyService, documentService, settingsService } = require('../services');
const queryHelper = require('../helpers/query.helper');
const logger = require('./logger');

const running = {};

const checkUnsededInvoices = async ({ companyId }) => {
  if (running[companyId]) return;
  running[companyId] = true;
  let invoices;
  try {
    invoices = await queryHelper.runCheckUnsendedInvoiceQuery({ companyId });
  } catch (error) {
    logger.error(`Error on checkUnsededInvoices: ${error}`);
    running[companyId] = false;
    return;
  }
  if (!invoices || invoices.length === 0) {
    running[companyId] = false;
    return;
  }
  const companyConfig = await settingsService.getCompanyConfig({ companyId });
  const tryCount = companyConfig.settings.checkUnsendedInvoice.failedTryCount;
  logger.info(`${companyId} ID'li firma için ${invoices.length} adet gönderilmemiş fatura bulundu.`);
  for (const invoice of invoices) {
    let willSend = false;
    try {
      const invoicesInDatabase = await documentService.getDocumentsByExternalId({ externalId: invoice.external_id });
      if (!invoicesInDatabase || invoicesInDatabase.length === 0) {
        willSend = true;
      } else {
        const successful = invoicesInDatabase.filter((i) => i.status === 200);
        const failed = invoicesInDatabase.filter((i) => i.status !== 200);
        if (successful.length === 0 && failed.length <= tryCount) {
          willSend = true;
        }
      }
      if (willSend) {
        await documentService.upsertDocument({
          externalId: invoice.external_id,
          movementType: 'checked',
          documentType: 'invoice',
          companyId,
        });
      }
    } catch (error) {
      logger.error(`Error on checkUnsededInvoices: ${error}`);
    }
  }
  running[companyId] = false;
};

const checkUnsededDespatches = async ({ companyId }) => {
  if (running[companyId]) return;
  running[companyId] = true;
  let despatches;
  try {
    despatches = await queryHelper.runCheckUnsendedDespatchQuery({ companyId });
  } catch (error) {
    logger.error(`Error on checkUnsededDespatches: ${error}`);
    running[companyId] = false;
    return;
  }
  if (!despatches || despatches.length === 0) {
    running[companyId] = false;
    return;
  }
  const companyConfig = await settingsService.getCompanyConfig({ companyId });
  const tryCount = companyConfig.settings.checkUnsendedDespatch.failedTryCount;
  for (const despatch of despatches) {
    let willSend = false;
    try {
      const despatchesInDatabase = await documentService.getDocumentsByExternalId({ externalId: despatch.external_id });
      if (!despatchesInDatabase || despatchesInDatabase.length === 0) willSend = true;
      else {
        const successful = despatchesInDatabase.filter((i) => i.status === 200);
        const failed = despatchesInDatabase.filter((i) => i.status !== 200);
        if (successful.length === 0 && failed.length <= tryCount) willSend = true;
      }
      if (willSend)
        await documentService.upsertDocument({
          externalId: despatch.external_id,
          movementType: 'checked',
          documentType: 'despatch',
          companyId,
        });
    } catch (error) {
      logger.error(`Error on checkUnsededDespatches: ${error}`);
    }
  }
  running[companyId] = false;
};

const initCron = async () => {
  const companies = await companyService.getCompaniesList();
  for (const company of companies) {
    // eslint-disable-next-line no-continue
    if (!company.cron) continue;
    logger.info(`Cron started for company: ${company.id}`);
    const companyConfig = await settingsService.getCompanyConfig({ companyId: company.id });
    const checkUnsendedInvoicePeriod = companyConfig.settings.checkUnsendedInvoice.workingPeriod;
    const checkUnsendedDespatchPeriod = companyConfig.settings.checkUnsendedDespatch.workingPeriod;
    logger.info(`CheckUnsendedInvoicePeriod: ${checkUnsendedInvoicePeriod}`);
    logger.info(`CheckUnsendedDespatchPeriod: ${checkUnsendedDespatchPeriod}`);
    cron.schedule(checkUnsendedInvoicePeriod, () => {
      checkUnsededInvoices({ companyId: company.id });
    });
    cron.schedule(checkUnsendedDespatchPeriod, () => {
      checkUnsededDespatches({ companyId: company.id });
    });
  }
};

module.exports = initCron;
