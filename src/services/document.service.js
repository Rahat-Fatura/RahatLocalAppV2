const rahatsistem = require('./rahatsistem.service');
const documentsSchema = require('../schemas/documents.schema');
const { createInvoiceJson } = require('../helpers/json.helper');
const logger = require('../config/logger');
const { documentModel, companyModel } = require('../models');

const documentCreator = ({ externalId, externalCode, json, status, moveType, documentType, error }) => {
  const document = {
    external_id: String(externalId),
    external_code: String(externalCode),
    json: JSON.stringify(json) || null,
    status: documentsSchema[documentType][status].code,
    status_desc: documentsSchema[documentType][status].desc || JSON.stringify(error, Object.getOwnPropertyNames(error)),
    movement_type: documentsSchema.movementTypes[moveType],
    document_type: documentsSchema.documentTypes[documentType] || 'INVOICE',
  };
  return document;
};

const createDocumentRecord = async ({ externalId, externalCode, json, status, moveType, documentType, companyId }) => {
  const documentBody = documentCreator({ externalId, externalCode, json, status, moveType, documentType });
  const document = await documentModel.createDocumentForCompany({ companyId, document: documentBody });
  return document;
};

const updateDocumentRecord = async ({
  documentId,
  externalId,
  externalCode,
  json,
  status,
  moveType,
  documentType,
  error,
}) => {
  const documentBody = documentCreator({ externalId, externalCode, json, status, moveType, documentType, error });
  const document = await documentModel.updateDocumentById({ documentId, document: documentBody });
  return document;
};

const upsertDocument = async ({ externalId, movementType, documentType, companyId }) => {
  const company = await companyModel.getCompanyById({ companyId });
  const doc = await createDocumentRecord({
    externalId,
    externalCode: '0',
    json: null,
    status: 'upsert.notify',
    moveType: movementType,
    documentType,
    companyId,
  });
  let docJson;
  try {
    if (documentType === 'invoice') {
      docJson = await createInvoiceJson({ erpId: externalId, companyId });
    } else if (documentType === 'despatch') {
      // TODO: Create document JSON from local database
      throw new Error('Despatch not implemented yet.');
      // docJson = await createDespatchJson(id);
    }
  } catch (error) {
    logger.error(error);
    await updateDocumentRecord({
      documentId: doc.id,
      externalId,
      externalCode: '0',
      json: null,
      status: 'upsert.error',
      moveType: movementType,
      documentType,
      error,
    });
    return { success: false, error };
  }
  const exRefNo = docJson.document.External.RefNo;
  await updateDocumentRecord({
    documentId: doc.id,
    externalId,
    externalCode: exRefNo,
    json: docJson,
    status: 'upsert.create',
    moveType: movementType,
    documentType,
  });
  try {
    if (documentType === 'invoice') {
      await rahatsistem.upsertInvoice({ invoice: docJson, apiKey: company.apikey, companyId });
    } else if (documentType === 'despatch') {
      await rahatsistem.upsertDespatch({ despatch: docJson, apiKey: company.apikey, companyId });
    }
  } catch (error) {
    logger.error(error);
    await updateDocumentRecord({
      documentId: doc.id,
      externalId,
      externalCode: exRefNo,
      json: docJson,
      status: 'upsert.error',
      moveType: movementType,
      documentType,
      error,
    });
    return { success: false, error };
  }
  await updateDocumentRecord({
    documentId: doc.id,
    externalId,
    externalCode: exRefNo,
    json: docJson,
    status: 'upsert.successful',
    moveType: movementType,
    documentType,
  });
  return { success: true };
};

const deleteDocument = async ({ externalId, documentType, companyId }) => {
  const company = await companyModel.getCompanyById({ companyId });
  const doc = await createDocumentRecord({
    externalId,
    externalCode: '0',
    json: null,
    status: 'delete.notify',
    moveType: 'delete',
    documentType,
    companyId,
  });
  try {
    if (documentType === 'invoice') {
      await rahatsistem.deleteInvoice({ id: externalId, apiKey: company.apikey, companyId });
    } else if (documentType === 'despatch') {
      await rahatsistem.deleteDespatch({ id: externalId, apiKey: company.apikey, companyId });
    }
  } catch (error) {
    await updateDocumentRecord({
      documentId: doc.id,
      externalId,
      externalCode: '0',
      json: null,
      status: 'delete.error',
      moveType: 'delete',
      documentType,
      error,
    });
    return { success: false, error };
  }
  await updateDocumentRecord({
    documentId: doc.id,
    externalId,
    externalCode: '0',
    json: null,
    status: 'delete.successful',
    moveType: 'delete',
    documentType,
  });
  return { success: true };
};

const getDocumentsByExternalId = async ({ externalId }) => {
  const documents = await documentModel.getDocumentsByExternalId({ externalId });
  return documents;
};

module.exports = {
  createDocumentRecord,
  updateDocumentRecord,
  upsertDocument,
  deleteDocument,
  getDocumentsByExternalId,
};
