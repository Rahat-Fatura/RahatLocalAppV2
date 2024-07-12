const database = require('../utils/database');

const getAllDatabasesList = async () => {
  const result =
    await database.$queryRaw`SELECT name FROM master.sys.databases WHERE name NOT IN ('master', 'model', 'tempdb', 'msdb', 'Resource')`;
  return result;
};

module.exports = {
  getAllDatabasesList,
};
