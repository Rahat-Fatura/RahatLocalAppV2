const catchAsync = require('../utils/catchAsync');
const { documentService } = require('../services');

const insertInvoice = catchAsync(async (req, res) => {
  res.send(true);
  const { exId, companyId } = req.params;
  await documentService.upsertDocument({ externalId: exId, movementType: 'insert', documentType: 'invoice', companyId });
});

const updateInvoice = catchAsync(async (req, res) => {
  res.send(true);
  const { exId, companyId } = req.params;
  await documentService.upsertDocument({ externalId: exId, movementType: 'update', documentType: 'invoice', companyId });
});

const deleteInvoice = catchAsync(async (req, res) => {
  res.send(true);
  const { exId, companyId } = req.params;
  await documentService.deleteDocument({ externalId: exId, documentType: 'invoice', companyId });
});

const insertDespatch = catchAsync(async (req, res) => {
  res.send(true);
  const { exId, companyId } = req.params;
  await documentService.upsertDocument({ externalId: exId, movementType: 'insert', documentType: 'despatch', companyId });
});

const updateDespatch = catchAsync(async (req, res) => {
  res.send(true);
  const { exId, companyId } = req.params;
  await documentService.upsertDocument({ externalId: exId, movementType: 'update', documentType: 'despatch', companyId });
});

const deleteDespatch = catchAsync(async (req, res) => {
  res.send(true);
  const { exId, companyId } = req.params;
  await documentService.deleteDocument({ externalId: exId, documentType: 'despatch', companyId });
});

module.exports = {
  insertInvoice,
  updateInvoice,
  deleteInvoice,
  insertDespatch,
  updateDespatch,
  deleteDespatch,
};
