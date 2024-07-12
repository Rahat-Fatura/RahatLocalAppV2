const httpStatus = require('http-status');
const { graphqlClient } = require('../../instances/backend.instance');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');

const getApps = async () => {
  try {
    const query = `
      query GetApps {
        getApps {
            id
            app
        }
      }
      `;
    const response = await graphqlClient.request(query);
    return response.getApps;
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error.response.errors[0].message);
  }
};

const getCompany = async (key) => {
  try {
    const query = `
      query getCompany {
        getCompany {
            id
            code
            key
            status
          }
        }`;
    const response = await graphqlClient.request(query, {}, { apikey: key });
    return response.getCompany;
  } catch (error) {
    if (error.response.errors[0].message === 'Şirket bulunamadı!') {
      return {};
    }
    throw new ApiError(httpStatus.BAD_REQUEST, error.response.errors[0].message);
  }
};

const getAppVariables = async ({ appId }) => {
  try {
    const query = `
      query getAppVariables {
        getAppVariables(id: ${appId})
      }`;
    const response = await graphqlClient.request(query);
    return response.getAppVariables;
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error.response.errors[0].message);
  }
};

const createCompany = async (mssql, appId, variables, key) => {
  try {
    const mutation = `
      mutation ($mssql: String!, $appId: Int, $variables: JSON!) {
          createCompany(mssql: $mssql, appId: $appId, variables: $variables) {
              id
              code
              key
              status
          }
      }
    `;
    const response = await graphqlClient.request(
      mutation,
      {
        mssql: String(mssql),
        appId: Number(appId),
        variables,
      },
      { apikey: key },
    );
    return response.createCompany;
  } catch (error) {
    logger.error(error);
    throw error.response.errors[0];
  }
};

const getCompanyQueries = async (key) => {
  try {
    const query = `
      query GetCompany {
        getCompany {
            Queries {
                queries
                type
            }
        }
      }`;
    const response = await graphqlClient.request(query, {}, { apikey: key });
    return response.getCompany;
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error.response.errors[0].message);
  }
};

const getCompanyConfig = async (key) => {
  try {
    const query = `
      query GetCompany {
        getCompany {
            Configs {
              config
            }
          }
        }`;
    const response = await graphqlClient.request(query, {}, { apikey: key });
    return response.getCompany.Configs[0].config;
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error.response.errors[0].message);
  }
};

const getEverythingForCompany = async (key) => {
  try {
    const query = `
      query GetCompany {
          getCompany {
            code
            key
            Configs {
              config
            }
            Queries {
              queries
              type
            }
          }
        }`;
    const response = await graphqlClient.request(query, {}, { apikey: key });
    return response.getCompany;
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error.response.errors[0].message);
  }
};

const updateInvoiceConfig = async (key, queries) => {
  try {
    const mutation = `
      mutation UpdateCompany($queries: JSON) {
        updateCompany(invoiceQueries: $queries) {
            id
        }
      }`;
    const response = await graphqlClient.request(mutation, { queries }, { apikey: key });
    return response.updateCompany;
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error.response.errors[0].message);
  }
};

const updateDespatchConfig = async (key, queries) => {
  try {
    const mutation = `
      mutation UpdateCompany($queries: JSON) {
        updateCompany(despatchQueries: $queries) {
            id
        }
      }`;
    const response = await graphqlClient.request(mutation, { queries }, { apikey: key });
    return response.updateCompany;
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error.response.errors[0].message);
  }
};

const updateCompanyConfig = async (key, config) => {
  try {
    const mutation = `
      mutation UpdateCompany($config: JSON) {
        updateCompany(config: $config) {
            id
        }
      }`;
    const response = await graphqlClient.request(mutation, { config }, { apikey: key });
    return response.updateCompany;
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error.response.errors[0].message);
  }
};

const createDocument = async (key, document) => {
  try {
    const mutation = `
      mutation CreateDocument($document: DocInput!) {
        createDocument(doc: $document) {
            id
        }
      }`;
    const response = await graphqlClient.request(mutation, { document }, { apikey: key });
    return response.createDocument;
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error.response.errors[0].message);
  }
};

const updateDocument = async (key, docId, document) => {
  try {
    const mutation = `
      mutation UpdateDocument($id: Int!, $document: DocInput!) {
        updateDocument(id:$id, doc: $document) {
            id
        }
      }`;
    const response = await graphqlClient.request(mutation, { id: docId, document }, { apikey: key });
    return response.updateDocument;
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error.response.errors[0].message);
  }
};

const getDocuments = async (key) => {
  try {
    const query = `
      query GetDocuments {
        getDocuments {
            id
            external_id
            external_code
            json
            status
            status_desc
            movement_type
            document_type
        }
      }`;
    const response = await graphqlClient.request(query, {}, { apikey: key });
    return response.getDocuments;
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error.response.errors[0].message);
  }
};

const getDocumentsById = async (key, id) => {
  try {
    const query = `
      query getDocumentsById {
        getDocuments (exId: ${id}){
            id
            external_id
            external_code
            json
            status
            status_desc
            movement_type
            document_type
        }
      }`;
    const response = await graphqlClient.request(query, {}, { apikey: key });
    return response.getDocuments;
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error.response.errors[0].message);
  }
};

module.exports = {
  getApps,
  getCompany,
  getAppVariables,
  createCompany,
  getCompanyQueries,
  getCompanyConfig,
  getEverythingForCompany,
  updateInvoiceConfig,
  updateDespatchConfig,
  updateCompanyConfig,
  createDocument,
  updateDocument,
  getDocuments,
  getDocumentsById,
};
