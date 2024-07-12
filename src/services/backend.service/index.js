const { backend } = require('../../instances/backend.instance');

module.exports.graphql = require('./backend.graphql.service');
module.exports.documents = require('./backend.documents.service');

module.exports.ping = async (apikey) => {
  const { data } = await backend.post(`/ping`, { apikey });
  return data;
};
