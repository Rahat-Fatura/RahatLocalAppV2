/* eslint-disable no-await-in-loop */
const datetime = require('date-and-time');
const query = require('./query.helper');
const { settingsService } = require('../services');
const Queue = require('../utils/queue');

const sleep = async (ms) => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const createInvoiceJson = async ({ erpId, companyId }) => {
  const companyConfig = await settingsService.getCompanyConfig({ companyId });
  const queue = new Queue(companyConfig.settings.queueLength);
  let invoiceJson = null;
  for (let i = 0; i < Number(companyConfig.settings.numberOfRetries); i += 1) {
    const queryResults = await query.runAllInvoiceQuery({ id: erpId, companyId });
    for (let j = 0; j < queryResults.lines.length; j += 1) {
      const line = queryResults.lines[j];
      const allowance = line.AllowancePercent ? { Allowance: { Percent: line.AllowancePercent } } : null;
      const withholding = line.WithholdingTaxCode ? { WithholdingTax: { Code: line.WithholdingTaxCode } } : null;
      queryResults.lines[j] = {
        Name: line.Name,
        Quantity: line.Quantity,
        UnitCode: line.UnitCode,
        Price: line.Price,
        KDV: {
          Percent: line.KDVPercent,
        },
        ...allowance,
        ...withholding,
      };
    }
    const type = queryResults.main.Type ? { Type: queryResults.main.Type } : null;
    const profile = queryResults.main.Profile ? { Profile: queryResults.main.Profile } : null;
    const despatchObject = queryResults.despatches.length ? { Despatches: queryResults.despatches } : null;
    const orderObject = queryResults.order.Value ? { Order: queryResults.order } : null;
    const numberOrSerie = queryResults.main.NumberOrSerie ? { NumberOrSerie: queryResults.main.NumberOrSerie } : null;
    const queueJson = {
      integrator: companyConfig.integrator.name,
      document: {
        External: {
          ID: queryResults.main.external_id,
          RefNo: queryResults.main.external_refno,
          Type: queryResults.main.external_type,
        },
        IssueDateTime: datetime.format(queryResults.main.IssueDateTime, 'YYYY-MM-DDTHH:mm:ss', true),
        ...despatchObject,
        ...orderObject,
        ...type,
        ...profile,
        ...numberOrSerie,
        Notes: queryResults.notes,
        Customer: queryResults.customer,
        Lines: queryResults.lines,
      },
    };
    queue.push(queueJson);
    if (await queue.isValid()) {
      invoiceJson = queueJson;
      break;
    } else {
      await sleep(Number(companyConfig.settings.queueCreatorWaitingMs));
    }
  }
  if (!invoiceJson) {
    throw new Error('Fatura doğrulanamadı!');
  }
  return invoiceJson;
};

const createDespatchJson = async ({ erpId, companyId }) => {
  const companyConfig = await settingsService.getCompanyConfig({ companyId });
  const queue = new Queue(companyConfig.settings.queueLength);
  let despatchJson = null;
  for (let i = 0; i < Number(companyConfig.settings.numberOfRetries); i += 1) {
    const queryResults = await query.runAllDespatchQuery({ id: erpId, companyId });
    const type = queryResults.main.Type ? { Type: queryResults.main.Type } : null;
    const profile = queryResults.main.Profile ? { Profile: queryResults.main.Profile } : null;
    const numberOrSerie = queryResults.main.NumberOrSerie ? { NumberOrSerie: queryResults.main.NumberOrSerie } : null;
    const shipmentObject =
      queryResults.shipment_carrier || queryResults.shipment_delivery || queryResults.shipment_driver
        ? {
            Shipment: {
              ...queryResults.shipment_carrier,
              ...queryResults.shipment_delivery,
              ...queryResults.shipment_driver,
            },
          }
        : null;
    const queueJson = {
      integrator: companyConfig.integrator.name,
      document: {
        External: {
          ID: queryResults.main.external_id,
          RefNo: queryResults.main.external_refno,
          Type: queryResults.main.external_type,
        },
        IssueDateTime: datetime.format(queryResults.main.IssueDateTime, 'YYYY-MM-DDTHH:mm:ss', true),
        ...type,
        ...profile,
        ...numberOrSerie,
        ...shipmentObject,
        Notes: queryResults.notes,
        Customer: queryResults.customer,
        Lines: queryResults.lines,
      },
    };
    queue.push(queueJson);
    if (await queue.isValid()) {
      despatchJson = queueJson;
      break;
    } else {
      await sleep(Number(companyConfig.settings.queueCreatorWaitingMs));
    }
  }
  if (!despatchJson) {
    throw new Error('Fatura doğrulanamadı!');
  }
  return despatchJson;
};

module.exports = {
  createInvoiceJson,
  createDespatchJson,
};
