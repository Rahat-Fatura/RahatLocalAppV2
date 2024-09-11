$(document).ready(function () {
  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: 'toast-bottom-full-width',
  };
  $('#nbs-einvoice-serie').inputmask({ mask: 'AAA' });
  $('#nbs-earchive-serie').inputmask({ mask: 'AAA' });
  $('#nbs-edespatch-serie').inputmask({ mask: 'AAA' });

  $('#cron-checkbox').change(function () {
    if (this.checked) {
      $.ajax({
        url: 'settings/cron/activate',
        type: 'PUT',
        success: function (data) {
          if (data.success) {
            Swal.fire({
              icon: 'success',
              title: 'Başarılı',
              text: 'Düzenli veritabanı sorgusu aktif edildi. Uygulamayı yeniden başlatınız.',
            });
          }
        },
        error: function (err) {
          Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Düzenli veritabanı sorgusu aktif edilemedi.' + err,
          });
          console.log(err);
          $('#cron-checkbox').prop('checked', false);
        },
      });
    } else {
      $.ajax({
        url: 'settings/cron/deactivate',
        type: 'PUT',
        success: function (data) {
          if (data.success) {
            Swal.fire({
              icon: 'success',
              title: 'Başarılı',
              text: 'Düzenli veritabanı sorgusu kaldırıldı. Uygulamayı yeniden başlatınız.',
            });
          }
        },
        error: function (err) {
          Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Düzenli veritabanı sorgusu kaldırılamadı.' + err,
          });
          console.log(err);
          $('#cron-checkbox').prop('checked', true);
        },
      });
    }
  });
  $('#rmq-checkbox').change(function () {
    if (this.checked) {
      $.ajax({
        url: 'settings/rmq/activate',
        type: 'PUT',
        success: function (data) {
          if (data.success) {
            Swal.fire({
              icon: 'success',
              title: 'Başarılı',
              text: 'Uzak sistem dinleme aktif edildi. Uygulamayı yeniden başlatınız.',
            });
          }
        },
        error: function (err) {
          Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Uzak sistem dinleme aktif edilemedi.' + err,
          });
          console.log(err);
          $('#rmq-checkbox').prop('checked', false);
        },
      });
    } else {
      $.ajax({
        url: 'settings/rmq/deactivate',
        type: 'PUT',
        success: function (data) {
          if (data.success) {
            Swal.fire({
              icon: 'success',
              title: 'Başarılı',
              text: 'Uzak sistem dinleme kaldırıldı. Uygulamayı yeniden başlatınız.',
            });
          }
        },
        error: function (err) {
          Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Uzak sistem dinleme kaldırılamadı.' + err,
          });
          console.log(err);
          $('#rmq-checkbox').prop('checked', true);
        },
      });
    }
  });
  $('#numberBeforeSend-checkbox').change(function () {
    if (this.checked) {
      $.ajax({
        url: 'settings/general.nbs/activate',
        type: 'PUT',
        success: function (data) {
          if (data.success) {
            toastr.success('Gönderimden önce numaralama <b>aktif</b> edildi.');
            $('#nbs-invoices-settings').slideDown(250);
          }
        },
        error: function (err) {
          toastr.error('Gönderimden önce numaralama aktif <b>edilemedi</b>.' + JSON.stringify(err.responseJSON));
          $('#nbs-invoices-settings').slideUp(250);
          console.log(err);
          $('#numberBeforeSend-checkbox').prop('checked', false);
        },
      });
    } else {
      $.ajax({
        url: 'settings/general.nbs/deactivate',
        type: 'PUT',
        success: function (data) {
          if (data.success) {
            toastr.success('Gönderimden önce numaralama <b>kaldırıldı</b>.');
            $('#nbs-invoices-settings').slideUp(250);
          }
        },
        error: function (err) {
          toastr.error('Gönderimden önce numaralama <b>kaldırılamadı</b>.' + JSON.stringify(err.responseJSON));
          $('#nbs-invoices-settings').slideDown(250);
          console.log(err);
          $('#numberBeforeSend-checkbox').prop('checked', true);
        },
      });
    }
  });
  $('#nbs-einvoice-checkbox').change(function () {
    if (this.checked) {
      $.ajax({
        url: 'settings/document.nbs/einvoice/activate',
        type: 'PUT',
        success: function (data) {
          if (data.success) {
            toastr.success('e-Fatura gönderimden önce numaralama <b>aktif</b> edildi.');
            $('#nbs-einvoice-serie-div').slideDown(250);
          }
        },
        error: function (err) {
          toastr.error('e-Fatura gönderimden önce numaralama aktif <b>edilemedi</b>.' + JSON.stringify(err.responseJSON));
          $('#nbs-einvoice-serie-div').slideUp(250);
          console.log(err);
          $('#nbs-einvoice-checkbox').prop('checked', false);
        },
      });
    } else {
      $.ajax({
        url: 'settings/document.nbs/einvoice/deactivate',
        type: 'PUT',
        success: function (data) {
          if (data.success) {
            toastr.success('e-Fatura gönderimden önce numaralama <b>kaldırıldı</b>.');
            $('#nbs-einvoice-serie-div').slideUp(250);
          }
        },
        error: function (err) {
          toastr.error('e-Fatura gönderimden önce numaralama <b>kaldırılamadı</b>.' + JSON.stringify(err.responseJSON));
          $('#nbs-einvoice-serie-div').slideDown(250);
          console.log(err);
          $('#nbs-einvoice-checkbox').prop('checked', true);
        },
      });
    }
  });
  $('#nbs-earchive-checkbox').change(function () {
    if (this.checked) {
      $.ajax({
        url: 'settings/document.nbs/earchive/activate',
        type: 'PUT',
        success: function (data) {
          if (data.success) {
            toastr.success('e-Arşiv gönderimden önce numaralama <b>aktif</b> edildi.');
            $('#nbs-earchive-serie-div').slideDown(250);
          }
        },
        error: function (err) {
          toastr.error('e-Arşiv gönderimden önce numaralama aktif <b>edilemedi</b>.' + JSON.stringify(err.responseJSON));
          $('#nbs-earchive-serie-div').slideUp(250);
          console.log(err);
          $('#nbs-earchive-checkbox').prop('checked', false);
        },
      });
    } else {
      $.ajax({
        url: 'settings/document.nbs/earchive/deactivate',
        type: 'PUT',
        success: function (data) {
          if (data.success) {
            toastr.success('e-Arşiv gönderimden önce numaralama <b>kaldırıldı</b>.');
            $('#nbs-earchive-serie-div').slideUp(250);
          }
        },
        error: function (err) {
          toastr.error('e-Arşiv gönderimden önce numaralama <b>kaldırılamadı</b>.' + JSON.stringify(err.responseJSON));
          $('#nbs-earchive-serie-div').slideDown(250);
          console.log(err);
          $('#nbs-earchive-checkbox').prop('checked', true);
        },
      });
    }
  });
  $('#nbs-edespatch-checkbox').change(function () {
    if (this.checked) {
      $.ajax({
        url: 'settings/document.nbs/edespatch/activate',
        type: 'PUT',
        success: function (data) {
          if (data.success) {
            toastr.success('e-İrsaliye gönderimden önce numaralama <b>aktif</b> edildi.');
            $('#nbs-edespatch-serie-div').slideDown(250);
          }
        },
        error: function (err) {
          toastr.error('e-İrsaliye gönderimden önce numaralama aktif <b>edilemedi</b>.' + JSON.stringify(err.responseJSON));
          $('#nbs-edespatch-serie-div').slideUp(250);
          console.log(err);
          $('#nbs-edespatch-checkbox').prop('checked', false);
        },
      });
    } else {
      $.ajax({
        url: 'settings/document.nbs/edespatch/deactivate',
        type: 'PUT',
        success: function (data) {
          if (data.success) {
            toastr.success('e-İrsaliye gönderimden önce numaralama <b>kaldırıldı</b>.');
            $('#nbs-edespatch-serie-div').slideUp(250);
          }
        },
        error: function (err) {
          toastr.error('e-İrsaliye gönderimden önce numaralama <b>kaldırılamadı</b>.' + JSON.stringify(err.responseJSON));
          $('#nbs-edespatch-serie-div').slideDown(250);
          console.log(err);
          $('#nbs-edespatch-checkbox').prop('checked', true);
        },
      });
    }
  });
  $('#nbs-einvoice-serie').on('focusout', function () {
    if (!$('#nbs-einvoice-serie').inputmask('isComplete')) {
      return;
    }
    $.ajax({
      url: 'settings/document.nbs/document/serie',
      type: 'PUT',
      data: { docType: 'einvoice', serie: $('#nbs-einvoice-serie').val() },
      success: function (data) {
        if (data.success) {
          toastr.success('e-Fatura numaralama serisi <b>güncellendi</b>.');
        }
      },
      error: function (err) {
        toastr.error('e-Fatura numaralama serisi <b>güncellenemedi</b>.' + JSON.stringify(err.responseJSON));
        console.log(err);
      },
    });
  });
  $('#nbs-earchive-serie').on('focusout', function () {
    if (!$('#nbs-earchive-serie').inputmask('isComplete')) {
      return;
    }
    $.ajax({
      url: 'settings/document.nbs/document/serie',
      type: 'PUT',
      data: { docType: 'earchive', serie: $('#nbs-earchive-serie').val() },
      success: function (data) {
        if (data.success) {
          toastr.success('e-Arşiv numaralama serisi <b>güncellendi</b>.');
        }
      },
      error: function (err) {
        toastr.error('e-Arşiv numaralama serisi <b>güncellenemedi</b>.' + JSON.stringify(err.responseJSON));
        console.log(err);
      },
    });
  });
  $('#nbs-edespatch-serie').on('focusout', function () {
    if (!$('#nbs-edespatch-serie').inputmask('isComplete')) {
      return;
    }
    $.ajax({
      url: 'settings/document.nbs/document/serie',
      type: 'PUT',
      data: { docType: 'edespatch', serie: $('#nbs-edespatch-serie').val() },
      success: function (data) {
        if (data.success) {
          toastr.success('e-İrsaliye numaralama serisi <b>güncellendi</b>.');
        }
      },
      error: function (err) {
        toastr.error('e-İrsaliye numaralama serisi <b>güncellenemedi</b>.' + JSON.stringify(err.responseJSON));
        console.log(err);
      },
    });
  });
});
