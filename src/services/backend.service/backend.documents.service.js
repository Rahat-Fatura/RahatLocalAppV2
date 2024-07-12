const { backend } = require('../../instances/backend.instance');

const getDocumentsList = async (query) => {
  const { data } = await backend.get(`/documents`, { params: query });
  return data;
};

module.exports = { getDocumentsList };
