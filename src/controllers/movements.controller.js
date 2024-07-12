const { companyService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const getDocumentsMovementPage = async (req, res) => {
  return res.render('pages/movements/movements', {
    page: {
      name: 'movements',
      display: 'Belgeler',
      menu: 'movements',
      uppermenu: 'movements',
    },
  });
};

const getDocumentsList = catchAsync(async (req, res) => {
  const { query, params } = req;
  const { companyId } = params;
  const docs = await companyService.getDocumentListByCompanyId({ companyId, query });
  return res.json(docs);
});

module.exports = {
  getDocumentsMovementPage,
  getDocumentsList,
};
