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
          taxNumber: $('#company-tax-number').val(),
        };
        $.ajax({
          url: '/company/recover',
          type: 'POST',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
          success: function (data) {
            $('.wizard-modern-example').unblock();
            Swal.fire({
              icon: 'success',
              title: 'Başarılı!',
              text: 'Firma başarıyla geri yüklendi.',
              confirmButtonText: 'Tamam',
            }).then((result) => {
              window.location.href = '/';
            });
          },
          error: function (err) {
            $('.wizard-modern-example').unblock();
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
});
