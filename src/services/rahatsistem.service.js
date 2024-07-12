const { instance } = require('../instances/rahatsistem.instance');

const upsertInvoice = async ({ invoice, apiKey, companyId }) => {
  const { data } = await (
    await instance({ companyId })
  ).put('/connect/invoice', invoice, { headers: { 'api-key': apiKey } });
  return data;
};

const deleteInvoice = async ({ id, apiKey, companyId }) => {
  const { data } = await (
    await instance({ companyId })
  ).delete(`/connect/invoice/${id}`, { headers: { 'api-key': apiKey } });
  return data;
};

const upsertDespatch = async ({ despatch, apiKey, companyId }) => {
  const { data } = await (
    await instance({ companyId })
  ).put('/connect/despatch', despatch, { headers: { 'api-key': apiKey } });
  return data;
};

const deleteDespatch = async ({ id, apiKey, companyId }) => {
  const { data } = await (
    await instance({ companyId })
  ).delete(`/connect/despatch/${id}`, { headers: { 'api-key': apiKey } });
  return data;
};

const getRMQCode = async ({ apiKey, companyId }) => {
  const { data } = await (await instance({ companyId })).get('/connect/ping', { headers: { 'api-key': apiKey } });
  return data;
};

const checkLiability = async ({ taxNumber, apiKey, companyId }) => {
  const { data } = await (
    await instance({ companyId })
  ).get(`/connect/check/liability/${taxNumber}`, { headers: { 'api-key': apiKey } });
  return data;
};

module.exports = {
  upsertInvoice,
  deleteInvoice,
  upsertDespatch,
  deleteDespatch,
  getRMQCode,
  checkLiability,
};
