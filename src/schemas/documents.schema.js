const invoice = {
  'upsert.notify': {
    code: 100,
    desc: 'Fatura kaydı bildirimi geldi. Fatura hazırlanıyor!',
  },
  'upsert.create': {
    code: 101,
    desc: 'Fatura oluşturuldu. Sisteme gönderilmeye hazırlanılıyor!',
  },
  'upsert.successful': {
    code: 200,
    desc: 'Fatura başarıyla sisteme gönderildi!',
  },
  'upsert.error': {
    code: 400,
  },
  'delete.notify': {
    code: 100,
    desc: 'Fatura silme bildirimi geldi. Fatura siliniyor!',
  },
  'delete.successful': {
    code: 200,
    desc: 'Fatura başarıyla silindi!',
  },
  'delete.error': {
    code: 400,
  },
};

const despatch = {
  'upsert.notify': {
    code: 100,
    desc: 'İrsaliye kaydı bildirimi geldi. İrsaliye hazırlanıyor!',
  },
  'upsert.create': {
    code: 101,
    desc: 'İrsaliye oluşturuldu. Sisteme gönderilmeye hazırlanılıyor!',
  },
  'upsert.successful': {
    code: 200,
    desc: 'İrsaliye başarıyla sisteme gönderildi!',
  },
  'upsert.error': {
    code: 400,
  },
  'delete.notify': {
    code: 100,
    desc: 'İrsaliye silme bildirimi geldi. İrsaliye siliniyor!',
  },
  'delete.successful': {
    code: 200,
    desc: 'İrsaliye başarıyla silindi!',
  },
  'delete.error': {
    code: 400,
  },
};

const notify = {
  notify: {
    code: 100,
    desc: 'Bildirim geldi. İşleme hazırlanılıyor!',
  },
  'invoice.statusUpdate.notify': {
    code: 101,
    desc: 'Fatura durum güncelleme bildirimi!',
  },
  'invoice.statusUpdate.successful': {
    code: 200,
    desc: 'Fatura numarası başarıyla güncellendi.',
  },
  'invoice.statusUpdate.error': {
    code: 400,
    desc: 'Fatura numarası güncellenirken hata oluştu!',
  },
  'invoice.dataRefresh.notify': {
    code: 101,
    desc: 'Fatura verisi yenileme bildirimi!',
  },
  'invoice.dataRefresh.successful': {
    code: 200,
    desc: 'Fatura verisi başarıyla yenilendi.',
  },
  'invoice.dataRefresh.error': {
    code: 400,
    desc: 'Fatura verisi güncellenirken hata oluştu!',
  },
  'despatch.statusUpdate.notify': {
    code: 101,
    desc: 'İrsaliye durum güncelleme bildirimi!',
  },
  'despatch.statusUpdate.successful': {
    code: 200,
    desc: 'İrsaliye numarası başarıyla güncellendi.',
  },
  'despatch.statusUpdate.error': {
    code: 400,
    desc: 'İrsaliye numarası güncellenirken hata oluştu!',
  },
  'despatch.dataRefresh.notify': {
    code: 101,
    desc: 'İrsaliye verisi yenileme bildirimi!',
  },
  'despatch.dataRefresh.successful': {
    code: 200,
    desc: 'İrsaliye verisi başarıyla yenilendi.',
  },
  'despatch.dataRefresh.error': {
    code: 400,
    desc: 'İrsaliye verisi güncellenirken hata oluştu!',
  },
};

const movementTypes = {
  insert: 'INSERT',
  update: 'UPDATE',
  delete: 'DELETE',
  manual: 'MANUAL',
  checked: 'CHECKED',
  'notify.main': 'NOTIFY',
  'notify.invoice.statusUpdate': 'NOTIFY_INV_UPD',
  'notify.invoice.dataRefresh': 'NOTIFY_INV_RFR',
  'notify.despatch.statusUpdate': 'NOTIFY_DSP_UPD',
  'notify.despatch.dataRefresh': 'NOTIFY_DSP_RFR',
};

const documentTypes = {
  invoice: 'INVOICE',
  despatch: 'DESPATCH',
};

module.exports = {
  invoice,
  despatch,
  notify,
  movementTypes,
  documentTypes,
};
