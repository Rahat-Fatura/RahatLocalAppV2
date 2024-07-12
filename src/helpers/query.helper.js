/* eslint-disable no-param-reassign */
/* eslint-disable dot-notation */
/* eslint-disable no-await-in-loop */
const dateAndTime = require('date-and-time');
const addZero = require('add-zero');
const {
  getInvoiceConfig,
  getDespatchConfig,
  getCompanyConfig,
  updateCompanyConfig,
} = require('../services/settings.service');
const { companyModel } = require('../models');
const rahatsistem = require('../services/rahatsistem.service');
const database = require('../utils/database');

const normalizeQueries = async ({ config, variables, mssqlDatabaseName, erpId }) => {
  const { queries } = config;
  const variableKeys = Object.keys(variables);
  const configKeys = Object.keys(queries);
  for (let i = 0; i < configKeys.length; i += 1) {
    const configKey = configKeys[i];
    for (let j = 0; j < variableKeys.length; j += 1) {
      const variableKey = variableKeys[j];
      const variableValue = variables[variableKey];
      queries[configKey] = queries[configKey].replaceAll(`{{${variableKey}}}`, variableValue);
    }
    queries[configKey] = queries[configKey]
      .replaceAll('@erpId', `'${erpId}'`)
      .replaceAll('[[mssqlDatabaseName]]', `[${mssqlDatabaseName}]`)
      .replaceAll('\\n', '\n');
  }
  return queries;
};

const runUpdateInvoiceNumberQuery = async ({ erpId, newNumber, companyId }) => {
  const invoiceConfig = await getInvoiceConfig({ companyId });
  const companyConfig = await getCompanyConfig({ companyId });
  const queries = await normalizeQueries({
    config: invoiceConfig,
    variables: companyConfig.variables,
    mssqlDatabaseName: companyConfig.local.mssql.url,
    erpId,
  });
  let updateInvoiceNumberQuery = queries.update_number;
  if (!updateInvoiceNumberQuery) throw new Error('Fatura numarası güncelleme sorgusu bulunamadı.');
  updateInvoiceNumberQuery = updateInvoiceNumberQuery.replaceAll('@invNo', `'${newNumber}'`);
  await database.$queryRawUnsafe(updateInvoiceNumberQuery);
  return true;
};

const runUpdateDespatchNumberQuery = async ({ erpId, newNumber, companyId }) => {
  const despatchConfig = await getDespatchConfig({ companyId });
  const companyConfig = await getCompanyConfig({ companyId });
  const queries = await normalizeQueries({
    config: despatchConfig,
    variables: companyConfig.variables,
    mssqlDatabaseName: companyConfig.local.mssql.url,
    erpId,
  });
  let updateDespatchNumberQuery = queries.update_number;
  if (!updateDespatchNumberQuery) throw new Error('İrsaliye numarası güncelleme sorgusu bulunamadı.');
  updateDespatchNumberQuery = updateDespatchNumberQuery.replaceAll('@dspNo', `'${newNumber}'`);
  await database.$queryRawUnsafe(updateDespatchNumberQuery);
  return true;
};

const checkLiability = async ({ taxNumber, apiKey, companyId }) => {
  let liability;
  try {
    await rahatsistem.checkLiability({ taxNumber, apiKey, companyId });
    liability = 'einvoice';
  } catch (error) {
    if (JSON.parse(error.message).code === 404) {
      liability = 'earchive';
    } else {
      throw new Error(error);
    }
  }
  return liability;
};

const updateNewInvoiceNumber = async ({ companyConfig, erpId, taxNumber, datetime, companyId, apiKey, series }) => {
  const liability = await checkLiability({ taxNumber, apiKey, companyId });
  const userSerie = series[liability];
  if (!userSerie) throw new Error('Önceden numaralandırma aktif edilmiş ancak seri tanımlanmamış!');
  const isActiveByLiability = companyConfig.settings.nbsDocuments[liability].numbering;
  if (isActiveByLiability) {
    const invoiceYear = dateAndTime.format(new Date(datetime), 'YYYY', true);
    if (!companyConfig.settings.nbsDocuments[liability]['series'])
      companyConfig.settings.nbsDocuments[liability]['series'] = {};
    if (!companyConfig.settings.nbsDocuments[liability]['series'][userSerie])
      companyConfig.settings.nbsDocuments[liability]['series'][userSerie] = {};
    if (!companyConfig.settings.nbsDocuments[liability]['series'][userSerie][invoiceYear])
      companyConfig.settings.nbsDocuments[liability]['series'][userSerie][invoiceYear] = 0;
    const lastNumber = Number(companyConfig.settings.nbsDocuments[liability]['series'][userSerie][invoiceYear]);
    const newNumber = lastNumber + 1;
    const newInvoiceNumber = `${userSerie}${invoiceYear}${addZero(newNumber, 9)}`;
    if (newInvoiceNumber.length !== 16)
      throw new Error(`Oluşturulan fatura numarası 16 haneden farklı oluştu! Numara: ${newInvoiceNumber}`);
    await runUpdateInvoiceNumberQuery({ erpId, newNumber: newInvoiceNumber, companyId });
    companyConfig.settings.nbsDocuments[liability]['series'][userSerie][invoiceYear] = newNumber;
    await updateCompanyConfig({ companyId, companyConfig });
  }
  return true;
};

const runAllInvoiceQuery = async ({ id, companyId }) => {
  const company = await companyModel.getCompanyById({ companyId });
  const invoiceConfig = await getInvoiceConfig({ companyId });
  let companyConfig = await getCompanyConfig({ companyId });
  const queries = await normalizeQueries({
    config: invoiceConfig,
    variables: companyConfig.variables,
    mssqlDatabaseName: companyConfig.local.mssql.url,
    erpId: id,
  });
  const results = {
    main: {},
    customer: {},
    lines: [],
    notes: [],
    despatches: [],
    order: {},
  };
  [results.main] = await database.$queryRawUnsafe(queries.main);
  if (!results.main) {
    throw new Error('Fatura, ilgili SQL sorgusunda bulunamadı.');
  }
  [results.customer] = await database.$queryRawUnsafe(queries.customer);
  if (companyConfig.settings.numberBeforeSending && results.main.NumberOrSerie && results.main.NumberOrSerie.length !== 16) {
    await updateNewInvoiceNumber({
      companyConfig,
      erpId: id,
      taxNumber: results.customer.TaxNumber,
      datetime: results.main.IssueDateTime,
      companyId,
      apiKey: company.apikey,
      series: JSON.parse(company.series),
    });
    companyConfig = await getCompanyConfig({ companyId });
    [results.main] = await database.$queryRawUnsafe(queries.main);
  }
  results.lines = await database.$queryRawUnsafe(queries.lines);
  if (queries.notes) {
    results.notes = await database.$queryRawUnsafe(queries.notes);
  }
  if (queries.despatches) {
    results.despatches = await database.$queryRawUnsafe(queries.despatches);
  }
  if (queries.order) {
    [results.order] = await database.$queryRawUnsafe(queries.order);
  }
  for (let i = 0; i < results.lines.length; i += 1) {
    if (results.lines[i].ID) {
      const updatedQuery = queries.line_taxes.replaceAll('@lineId', results.lines[i].ID);
      results.lines[i]['Taxes'] = await database.$queryRawUnsafe(updatedQuery);
    }
  }
  return results;
};

const runAllDespatchQuery = async ({ id, companyId }) => {
  const despatchConfig = await getDespatchConfig({ companyId });
  const companyConfig = await getCompanyConfig({ companyId });
  const queries = await normalizeQueries({
    config: despatchConfig,
    variables: companyConfig.variables,
    mssqlDatabaseName: companyConfig.local.mssql.url,
    erpId: id,
  });
  const results = {
    main: {},
    customer: {},
    lines: [],
    notes: [],
    shipment_driver: {},
    shipment_carrier: {},
    shipment_delivery: {},
  };
  [results.main] = await database.$queryRawUnsafe(queries.main);
  if (!results.main) {
    throw new Error('İrsaliye, ilgili SQL sorgusunda bulunamadı.');
  }
  [results.customer] = await database.$queryRawUnsafe(queries.customer);
  results.lines = await database.$queryRawUnsafe(queries.lines);
  if (queries.notes) {
    results.notes = await database.$queryRawUnsafe(queries.notes);
  }
  if (queries.shipment_driver) {
    [results.shipment_driver] = await database.$queryRawUnsafe(queries.shipment_driver);
  }
  if (queries.shipment_carrier) {
    [results.shipment_carrier] = await database.$queryRawUnsafe(queries.shipment_carrier);
  }
  if (queries.shipment_delivery) {
    [results.shipment_delivery] = await database.$queryRawUnsafe(queries.shipment_delivery);
  }
  return results;
};

const runCheckUnsendedInvoiceQuery = async ({ companyId }) => {
  const invoiceConfig = await getInvoiceConfig({ companyId });
  const companyConfig = await getCompanyConfig({ companyId });
  const queries = await normalizeQueries({
    config: invoiceConfig,
    variables: companyConfig.variables,
    mssqlDatabaseName: companyConfig.local.mssql.url,
    erpId: null,
  });
  let unsendedInvoiceQuery = queries.check_unsended;
  if (!unsendedInvoiceQuery) throw new Error('Gönderilmemiş fatura sorgusu bulunamadı.');
  const d = new Date() - 1000 * 60 * 60 * 24 * Number(companyConfig.settings.checkUnsendedInvoice.daysAgo);
  const dateTime = dateAndTime.format(new Date(d), companyConfig.settings.checkUnsendedInvoice.dateFormat, true);
  unsendedInvoiceQuery = unsendedInvoiceQuery.replaceAll('@dateTime', `'${dateTime}'`);
  const results = await database.$queryRawUnsafe(unsendedInvoiceQuery);
  return results;
};

const runCheckUnsendedDespatchQuery = async ({ companyId }) => {
  const despatchConfig = await getDespatchConfig({ companyId });
  const companyConfig = await getCompanyConfig({ companyId });
  const queries = await normalizeQueries({
    config: despatchConfig,
    variables: companyConfig.variables,
    mssqlDatabaseName: companyConfig.local.mssql.url,
    erpId: null,
  });
  let unsendedDespatchQuery = queries.check_unsended;
  if (!unsendedDespatchQuery) throw new Error('Gönderilmemiş irsaliye sorgusu bulunamadı.');
  const d = new Date() - 1000 * 60 * 60 * 24 * Number(companyConfig.settings.checkUnsendedDespatch.daysAgo);
  const dateTime = dateAndTime.format(new Date(d), companyConfig.settings.checkUnsendedDespatch.dateFormat, true);
  unsendedDespatchQuery = unsendedDespatchQuery.replaceAll('@dateTime', `'${dateTime}'`);
  const results = await database.$queryRawUnsafe(unsendedDespatchQuery);
  return results;
};

const getInvoiceHttpActivateSql = async ({ companyId }) => {
  const invoiceConfig = await getInvoiceConfig({ companyId });
  const companyConfig = await getCompanyConfig({ companyId });
  const queries = await normalizeQueries({
    config: invoiceConfig,
    variables: companyConfig.variables,
    mssqlDatabaseName: companyConfig.local.mssql.url,
    erpId: null,
  });
  const httpActivateQuery = queries.activate_http;
  if (!httpActivateQuery) throw new Error('HTTP aktifleştirme sorgusu bulunamadı.');
  return httpActivateQuery;
};

const getInvoiceHttpFunctionSql = async ({ companyId, appUrl, appPort }) => {
  const invoiceConfig = await getInvoiceConfig({ companyId });
  const companyConfig = await getCompanyConfig({ companyId });
  const queries = await normalizeQueries({
    config: invoiceConfig,
    variables: companyConfig.variables,
    mssqlDatabaseName: companyConfig.local.mssql.url,
    erpId: null,
  });
  let httpFunctionQuery = queries.set_api_request;
  if (!httpFunctionQuery) throw new Error('HTTP fonksiyonu sorgusu bulunamadı.');
  httpFunctionQuery = httpFunctionQuery
    .replaceAll('[[appUrl]]', appUrl)
    .replaceAll('[[appPort]]', appPort)
    .replaceAll('[[companyId]]', companyId);
  return httpFunctionQuery;
};

const getInvoiceTableTriggerSql = async ({ companyId }) => {
  const invoiceConfig = await getInvoiceConfig({ companyId });
  const companyConfig = await getCompanyConfig({ companyId });
  const queries = await normalizeQueries({
    config: invoiceConfig,
    variables: companyConfig.variables,
    mssqlDatabaseName: companyConfig.local.mssql.url,
    erpId: null,
  });
  const tableTriggerQuery = queries.table_trigger;
  if (!tableTriggerQuery) throw new Error('Tablo trigger sorgusu bulunamadı.');
  return tableTriggerQuery;
};

const getDespatchHttpActivateSql = async ({ companyId }) => {
  const despatchConfig = await getDespatchConfig({ companyId });
  const companyConfig = await getCompanyConfig({ companyId });
  const queries = await normalizeQueries({
    config: despatchConfig,
    variables: companyConfig.variables,
    mssqlDatabaseName: companyConfig.local.mssql.url,
    erpId: null,
  });
  const httpActivateQuery = queries.activate_http;
  if (!httpActivateQuery) throw new Error('HTTP aktifleştirme sorgusu bulunamadı.');
  return httpActivateQuery;
};

const getDespatchHttpFunctionSql = async ({ companyId, appUrl, appPort }) => {
  const despatchConfig = await getDespatchConfig({ companyId });
  const companyConfig = await getCompanyConfig({ companyId });
  const queries = await normalizeQueries({
    config: despatchConfig,
    variables: companyConfig.variables,
    mssqlDatabaseName: companyConfig.local.mssql.url,
    erpId: null,
  });
  let httpFunctionQuery = queries.set_api_request;
  if (!httpFunctionQuery) throw new Error('HTTP fonksiyonu sorgusu bulunamadı.');
  httpFunctionQuery = httpFunctionQuery
    .replaceAll('[[appUrl]]', appUrl)
    .replaceAll('[[appPort]]', appPort)
    .replaceAll('[[companyId]]', companyId);
  return httpFunctionQuery;
};

const getDespatchTableTriggerSql = async ({ companyId }) => {
  const despatchConfig = await getDespatchConfig({ companyId });
  const companyConfig = await getCompanyConfig({ companyId });
  const queries = await normalizeQueries({
    config: despatchConfig,
    variables: companyConfig.variables,
    mssqlDatabaseName: companyConfig.local.mssql.url,
    erpId: null,
  });
  const tableTriggerQuery = queries.table_trigger;
  if (!tableTriggerQuery) throw new Error('Tablo trigger sorgusu bulunamadı.');
  return tableTriggerQuery;
};

const getInvoiceQuerySql = async ({ companyId, query }) => {
  const invoiceConfig = await getInvoiceConfig({ companyId });
  const companyConfig = await getCompanyConfig({ companyId });
  const queries = await normalizeQueries({
    config: invoiceConfig,
    variables: companyConfig.variables,
    mssqlDatabaseName: companyConfig.local.mssql.url,
    erpId: 'erpId',
  });
  const result = queries[query];
  return result;
};

const getDespatchQuerySql = async ({ companyId, query }) => {
  const despatchConfig = await getDespatchConfig({ companyId });
  const companyConfig = await getCompanyConfig({ companyId });
  const queries = await normalizeQueries({
    config: despatchConfig,
    variables: companyConfig.variables,
    mssqlDatabaseName: companyConfig.local.mssql.url,
    erpId: 'erpId',
  });
  const result = queries[query];
  return result;
};

module.exports = {
  runAllInvoiceQuery,
  runAllDespatchQuery,
  runCheckUnsendedInvoiceQuery,
  runCheckUnsendedDespatchQuery,
  runUpdateInvoiceNumberQuery,
  runUpdateDespatchNumberQuery,
  getInvoiceHttpActivateSql,
  getInvoiceHttpFunctionSql,
  getInvoiceTableTriggerSql,
  getDespatchHttpActivateSql,
  getDespatchHttpFunctionSql,
  getDespatchTableTriggerSql,
  getInvoiceQuerySql,
  getDespatchQuerySql,
};
