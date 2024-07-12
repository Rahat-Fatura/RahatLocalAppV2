$(document).ready(function () {
  const wizardModern = document.querySelector('.wizard-modern-example'),
    wizardModernBtnNextList = [].slice.call(wizardModern.querySelectorAll('.btn-next')),
    wizardModernBtnPrevList = [].slice.call(wizardModern.querySelectorAll('.btn-prev')),
    wizardModernBtnSubmit = wizardModern.querySelector('.btn-submit');
  if (typeof wizardModern !== undefined && wizardModern !== null) {
    const modernStepper = new Stepper(wizardModern, {
      linear: false,
    });
    if (wizardModernBtnNextList) {
      wizardModernBtnNextList.forEach((wizardModernBtnNext) => {
        wizardModernBtnNext.addEventListener('click', (event) => {
          modernStepper.next();
        });
      });
    }
    if (wizardModernBtnPrevList) {
      wizardModernBtnPrevList.forEach((wizardModernBtnPrev) => {
        wizardModernBtnPrev.addEventListener('click', (event) => {
          modernStepper.previous();
        });
      });
    }
    if (wizardModernBtnSubmit) {
      wizardModernBtnSubmit.addEventListener('click', (event) => {
        $('.wizard-modern-example').block({
          message: `<div class="sk-wave sk-primary mx-auto">
              <div class="sk-rect sk-wave-rect">
              </div> <div class="sk-rect sk-wave-rect">
              </div> <div class="sk-rect sk-wave-rect">
              </div> <div class="sk-rect sk-wave-rect"></div>
              <div class="sk-rect sk-wave-rect"></div>
            </div>`,
          css: {
            backgroundColor: 'transparent',
            border: '0',
          },
          overlayCSS: {
            backgroundColor: '#fff',
            opacity: 0.8,
          },
        });
        let variables = {};
        $('[id^=params-input-]').map(function () {
          variables[this.id.replace('params-input-', '')] = $(this).val();
        });
        let data = {
          key: $('#company-api-key').val(),
          appId: $('#erp-app').val(),
          mssql: $('#database-list').val(),
          variables,
        };
        $.ajax({
          url: '/company/create',
          type: 'POST',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
          success: function (data) {
            $('.wizard-modern-example').unblock();
            Swal.fire({
              icon: 'success',
              title: 'Başarılı!',
              text: 'Firma başarıyla eklendi.',
              confirmButtonText: 'Tamam',
            }).then((result) => {
              window.location.href = '/';
            });
          },
          error: function (err) {
            $('.wizard-modern-example').unblock();
            if (err.responseJSON.message.includes('Firma daha önce sisteme kaydedilmiş')) {
              Swal.fire({
                icon: 'error',
                title: 'Hata!',
                text: 'Firma daha önce sisteme kaydedilmiş. Geri yüklemek ister misiniz?',
                confirmButtonText: 'Geri Yükle',
                showCancelButton: true,
                cancelButtonText: 'İptal',
              }).then((result) => {
                if (result.isConfirmed) {
                  window.location.href = '/company/recover';
                }
              });
            } else
              Swal.fire({
                icon: 'error',
                title: 'Hata!',
                text: err.responseJSON.message,
                confirmButtonText: 'Tamam',
              });
          },
        });
      });
    }
  }

  $('#check-company-api-key').click((e) => {
    e.preventDefault();
    const apikey = $('#company-api-key').val();
    $.ajax({
      url: '/company/create/check/api-key',
      type: 'POST',
      data: { apikey },
      success: function (data) {
        $('#company-api-key').removeClass('is-invalid');
        $('#company-api-key').addClass('is-valid');
        $('#company-api-key-feedback').addClass('valid-feedback');
        $('#company-api-key-feedback').removeClass('invalid-feedback');
        $('#company-api-key-feedback').html('Bağlantı başarılı.');
      },
      error: function (err) {
        $('#company-api-key').removeClass('is-valid');
        $('#company-api-key').addClass('is-invalid');
        $('#company-api-key-feedback').addClass('invalid-feedback');
        $('#company-api-key-feedback').removeClass('valid-feedback');
        $('#company-api-key-feedback').html(`Bağlantı başarısız! ${err.responseJSON.message}`);
      },
    });
  });

  $('#erp-app')
    .select2({
      placeholder: 'ERP Uygulaması Seçiniz',
      allowClear: true,
    })
    .on('select2:select', function (e) {
      const data = e.params.data;
      $.ajax({
        type: 'get',
        url: `/company/create/erps/${data.id}`,
        success: function (response) {
          if (response.length === 0)
            return $('#app-variables-inputs').html(`
            <div class="alert alert-success d-flex align-items-center" role="alert">
              <span class="alert-icon text-success me-2">
                <i class="ti ti-check ti-xs"></i>
              </span>
              Seçili ERP için girilmesi gereken bir parametre bulunmamaktadır. İşleminizi tamamlayabilirsiniz.
            </div>`);
          else {
            let inputs = '';
            response.forEach((variable) => {
              inputs += `
            <div class="col-md-6">
                <label class="form-label" for="params-input-${variable}">${variable}</label>
                <input type="text" id="params-input-${variable}" name="params-input-${variable}" class="form-control">
            </div>
            `;
            });
            $('#app-variables-inputs').html(`<div class="row">${inputs}</div>`);
          }
        },
        error: function (err) {
          $('#app-variables-inputs').html(`
          <div class="alert alert-info d-flex align-items-center btn-prev" role="alert">
              <span class="alert-icon text-info me-2">
                  <i class="ti ti-arrow-left"></i>
              </span>
              Lütfen ERP uygulaması seçiniz...
          </div>`);
        },
      });
    })
    .on('select2:unselect', function (e) {
      $('#app-variables-inputs').html(`
          <div class="alert alert-info d-flex align-items-center btn-prev" role="alert">
              <span class="alert-icon text-info me-2">
                  <i class="ti ti-arrow-left"></i>
              </span>
              Lütfen ERP uygulaması seçiniz...
          </div>`);
    });
  $.ajax({
    type: 'get',
    url: '/company/create/erps',
    success: function (response) {
      response.forEach((template) => {
        let option = new Option(`${template.app.name} - ${template.app.code}`, template.id, false, false);
        $('#erp-app').append(option);
      });
    },
  });

  $('#database-list').select2({
    placeholder: 'Veritabanı seçiniz',
    allowClear: true,
  });
  $.ajax({
    type: 'get',
    url: '/company/create/databases',
    success: function (response) {
      response.forEach((db) => {
        let option = new Option(`${db.name}`, db.name, false, false);
        $('#database-list').append(option);
      });
    },
  });
});
