const database = require('../utils/database');

const getDocumentsById = async ({ documentId }) => {
  const document = await database.docs.findUnique({
    where: { id: Number(documentId) },
  });
  return document;
};

const getDocumentsByExternalId = async ({ externalId }) => {
  const documents = await database.docs.findMany({
    where: { external_id: { contains: String(externalId) } },
  });
  return documents;
};

const createDocumentForCompany = async ({ companyId, document }) => {
  const newDocument = await database.docs.create({
    data: {
      ...document,
      companyId: Number(companyId),
    },
  });
  return newDocument;
};

const updateDocumentById = async ({ documentId, document }) => {
  const updatedDocument = await database.docs.update({
    where: { id: Number(documentId) },
    data: document,
  });
  return updatedDocument;
};

const getDocumentListByCompanyId = async ({ companyId, query }) => {
  const { draw } = query;
  const skip = query.start;
  const take = query.length;
  if (!query || !query.fdate || !query.ldate) {
    return {
      draw,
      recordsTotal: 0,
      recordsFiltered: 0,
      data: [],
    };
  }
  const whereClause = {
    updated_at: {
      lte: new Date(query.ldate),
      gte: new Date(query.fdate),
    },
  };
  if (query.searchbox) {
    whereClause.OR = [
      { external_id: { contains: String(query.searchbox) } },
      { external_code: { contains: String(query.searchbox) } },
      { status_desc: { contains: String(query.searchbox) } },
    ];
  }
  if (query.status_codes && query.status_codes.length > 0) {
    whereClause.status = {
      in: query.status_codes.map((item) => Number(item)),
    };
  }
  if (query.type_filter && query.type_filter.length > 0) {
    whereClause.movement_type = {
      contains: query.type_filter,
    };
  }
  if (query.document_filter && query.document_filter.length > 0) {
    whereClause.document_type = {
      contains: query.document_filter,
    };
  }
  const recordsTotal = await database.docs.count({
    where: { deleted_at: null, companyId },
  });
  let recordsFiltered = recordsTotal;
  recordsFiltered = await database.docs.count({
    where: {
      deleted_at: null,
      companyId,
      ...whereClause,
    },
  });

  const records = await database.docs.findMany({
    where: {
      deleted_at: null,
      companyId,
      ...whereClause,
    },
    skip: Number(skip),
    take: Number(take),
    orderBy: {
      updated_at: 'desc',
    },
  });

  return {
    draw,
    recordsTotal,
    recordsFiltered,
    data: records,
  };
};

module.exports = {
  getDocumentsById,
  getDocumentsByExternalId,
  createDocumentForCompany,
  updateDocumentById,
  getDocumentListByCompanyId,
};
