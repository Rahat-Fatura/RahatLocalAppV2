/* eslint-disable no-await-in-loop */
const datetime = require('date-and-time');
const _ = require('lodash');
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
      const additionalNames = {
        AdditionalNames: {
          Note: line.Note,
          Description: line.Description,
          Brand: line.Brand,
          Model: line.Model,
          BuyerCode: line.BuyerCode,
          SellerCode: line.SellerCode,
          ManufacturerCode: line.ManufacturerCode,
          Origin: line.Origin,
        },
      };
      const addIsAvailable = Object.values(additionalNames.AdditionalNames).some((value) => value);
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
        ...(addIsAvailable ? additionalNames : {}),
      };
    }
    if (queryResults.customer.Identifications) {
      queryResults.customer = {
        ..._.omit(queryResults.customer, 'Identifications'),
        Identifications: queryResults.customer.Identifications.split(',').map((item) => {
          const [type, value] = item.split(':');
          return { SchemeID: type, Value: value };
        }),
      };
    }
    const type = queryResults.main.Type ? { Type: queryResults.main.Type } : null;
    const profile = queryResults.main.Profile ? { Profile: queryResults.main.Profile } : null;
    const despatchObject = queryResults.despatches.length ? { Despatches: queryResults.despatches } : null;
    const orderObject = queryResults.order?.Value ? { Order: queryResults.order } : null;
    const numberOrSerie = queryResults.main.NumberOrSerie ? { NumberOrSerie: queryResults.main.NumberOrSerie } : null;
    const additionals = queryResults.additionals.length ? { Additionals: queryResults.additionals } : null;
    const taxExemptionObject = queryResults.main.KDVTaxExemption
      ? { TaxExemptions: { KDV: queryResults.main.TaxExemption } }
      : null;
    const currencyCode = queryResults.main.CurrencyCode ? { CurrencyCode: queryResults.main.CurrencyCode } : null;
    const exhangeRate = queryResults.main.ExchangeRate ? { ExchangeRate: queryResults.main.ExchangeRate } : null;
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
        ...additionals,
        ...taxExemptionObject,
        ...currencyCode,
        ...exhangeRate,
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
    for (let j = 0; j < queryResults.lines.length; j += 1) {
      const line = queryResults.lines[j];
      const additionalNames = {
        AdditionalNames: {
          Note: line.Note,
          Description: line.Description,
          Brand: line.Brand,
          Model: line.Model,
          BuyerCode: line.BuyerCode,
          SellerCode: line.SellerCode,
          ManufacturerCode: line.ManufacturerCode,
          Origin: line.Origin,
        },
      };
      const addIsAvailable = Object.values(additionalNames.AdditionalNames).some((value) => value);
      queryResults.lines[j] = {
        Name: line.Name,
        Quantity: line.Quantity,
        UnitCode: line.UnitCode,
        ...(addIsAvailable ? additionalNames : {}),
      };
    }
    if (queryResults.customer.Identifications) {
      queryResults.customer = {
        ..._.omit(queryResults.customer, 'Identifications'),
        Identifications: queryResults.customer.Identifications.split(',').map((item) => {
          const [type, value] = item.split(':');
          return { SchemeID: type, Value: value };
        }),
      };
    }
    if (queryResults.buyer_customer?.Identifications) {
      queryResults.buyer_customer = {
        ..._.omit(queryResults.buyer_customer, 'Identifications'),
        Identifications: queryResults.buyer_customer.Identifications.split(',').map((item) => {
          const [type, value] = item.split(':');
          return { SchemeID: type, Value: value };
        }),
      };
    }
    if (queryResults.seller_supplier?.Identifications) {
      queryResults.seller_supplier = {
        ..._.omit(queryResults.seller_supplier, 'Identifications'),
        Identifications: queryResults.seller_supplier.Identifications.split(',').map((item) => {
          const [type, value] = item.split(':');
          return { SchemeID: type, Value: value };
        }),
      };
    }
    const type = queryResults.main.Type ? { Type: queryResults.main.Type } : null;
    const profile = queryResults.main.Profile ? { Profile: queryResults.main.Profile } : null;
    const numberOrSerie = queryResults.main.NumberOrSerie ? { NumberOrSerie: queryResults.main.NumberOrSerie } : null;
    const additionals = queryResults.additionals.length ? { Additionals: queryResults.additionals } : null;
    const buyerCustomer = queryResults.buyer_customer ? { BuyerCustomer: queryResults.buyer_customer } : null;
    const sellerSupplier = queryResults.seller_supplier ? { SellerSupplier: queryResults.seller_supplier } : null;
    const orderObject = queryResults.order?.Value ? { Order: queryResults.order } : null;
    const shipmentObject =
      queryResults.shipment_carrier || queryResults.shipment_delivery || queryResults.shipment_driver
        ? {
            Shipment: {
              ...queryResults.shipment_carrier,
              ...(queryResults.shipment_delivery ? { Delivery: { Address: { ...queryResults.shipment_delivery } } } : {}),
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
        ...orderObject,
        ...additionals,
        Notes: queryResults.notes,
        Customer: queryResults.customer,
        ...buyerCustomer,
        ...sellerSupplier,
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
