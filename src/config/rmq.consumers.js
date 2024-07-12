// const { Notification } = require('electron');
const { rahatsistem, documentService, companyService, settingsService } = require('../services');
const queryHelper = require('../helpers/query.helper');
const { instance } = require('../instances/rmq.instance');
const logger = require('./logger');

const consumeTunnel = async ({ companyId }) => {
  const company = await settingsService.getCompanyById({ companyId });
  let rmqCode;
  try {
    rmqCode = (await rahatsistem.getRMQCode({ apiKey: company.apikey, companyId })).rmq_code;
  } catch (error) {
    logger.error(error);
    return;
  }
  const connection = await instance({ host: 'localapp_coms', companyId });
  const queue = `localApp.tunnel.${rmqCode}.edoc`;
  const channel = connection.createChannel({
    json: true,
    setup: (cha) => {
      cha.prefetch(1);
      return cha.assertQueue(queue, { durable: true });
    },
  });
  channel.consume(queue, async (data) => {
    const msg = JSON.parse(data.content.toString());
    const moveLog = await documentService.createDocumentRecord({
      externalId: msg.data.erpId,
      externalCode: '0',
      json: null,
      status: 'notify',
      moveType: 'notify.main',
      documentType: 'notify',
      companyId,
    });
    if (msg.type === 'status.update') {
      await documentService.updateDocumentRecord({
        documentId: moveLog.id,
        externalId: msg.data.erpId,
        externalCode: msg.data.new.ref_no,
        json: msg,
        status: `${msg.code}.statusUpdate.notify`,
        moveType: `notify.${msg.code}.statusUpdate`,
        documentType: 'notify',
      });
      if (msg.data.edoc_status === 202) {
        let success = true;
        try {
          // TODO: Update document number in local database
          const { erpId } = msg.data;
          const newDocumentNumber = msg.data.new.document_number;
          if (msg.code === 'invoice') {
            await queryHelper.runUpdateInvoiceNumberQuery({ erpId, newNumber: newDocumentNumber, companyId });
          } else if (msg.code === 'despatch') {
            await queryHelper.runUpdateDespatchNumberQuery({ erpId, newNumber: newDocumentNumber, companyId });
          }
        } catch (error) {
          logger.error(error);
          await documentService.updateDocumentRecord({
            documentId: moveLog.id,
            externalId: msg.data.erpId,
            externalCode: msg.data.new.ref_no,
            json: msg,
            status: `${msg.code}.statusUpdate.error`,
            moveType: `notify.${msg.code}.statusUpdate`,
            documentType: 'notify',
            error,
          });
          success = false;
        }
        if (success) {
          await documentService.updateDocumentRecord({
            documentId: moveLog.id,
            externalId: msg.data.erpId,
            externalCode: msg.data.new.ref_no,
            json: msg,
            status: `${msg.code}.statusUpdate.successful`,
            moveType: `notify.${msg.code}.statusUpdate`,
            documentType: 'notify',
          });
        }
      } else {
        await documentService.updateDocumentRecord({
          documentId: moveLog.id,
          externalId: msg.data.erpId,
          externalCode: msg.data.new.ref_no,
          json: msg,
          status: `${msg.code}.statusUpdate.successful`,
          moveType: `notify.${msg.code}.statusUpdate`,
          documentType: 'notify',
        });
      }
    } else if (msg.type === 'data.refresh') {
      await documentService.updateDocumentRecord({
        documentId: moveLog.id,
        externalId: msg.data.erpId,
        externalCode: msg.data.ref_no,
        json: msg,
        status: `${msg.code}.dataRefresh.notify`,
        moveType: `notify.${msg.code}.dataRefresh`,
        documentType: 'notify',
      });
      const updatedDoc = await documentService.upsertDocument({
        externalId: msg.data.erpId,
        movementType: 'checked',
        documentType: msg.code,
        companyId,
      });
      if (!updatedDoc.success) {
        await documentService.updateDocumentRecord({
          documentId: moveLog.id,
          externalId: msg.data.erpId,
          externalCode: msg.data.ref_no,
          json: msg,
          status: `${msg.code}.dataRefresh.error`,
          moveType: `notify.${msg.code}.dataRefresh`,
          documentType: 'notify',
          error: updatedDoc.error,
        });
      } else {
        await documentService.updateDocumentRecord({
          documentId: moveLog.id,
          externalId: msg.data.erpId,
          externalCode: msg.data.ref_no,
          json: msg,
          status: `${msg.code}.dataRefresh.successful`,
          moveType: `notify.${msg.code}.dataRefresh`,
          documentType: 'notify',
        });
      }
    }
    channel.ack(data);
  });
};

const initConsumers = async () => {
  const companies = await companyService.getCompaniesList();
  // eslint-disable-next-line no-restricted-syntax
  for (const company of companies) {
    // eslint-disable-next-line no-continue
    if (!company.rmq) continue;
    logger.info(`Consuming tunnel for company: ${company.id}`);
    consumeTunnel({ companyId: company.id });
  }
};

module.exports = initConsumers;
