$(document).ready(function () {
  const header_main_editor = monaco.editor.create(document.getElementById('header_main_editor'), {
    value: ``,
    language: 'sql',
    theme: 'vs',
    automaticLayout: true,
    scrollBeyondLastLine: false,
  });
  const header_notes_editor = monaco.editor.create(document.getElementById('header_notes_editor'), {
    value: ``,
    language: 'sql',
    theme: 'vs',
    automaticLayout: true,
    scrollBeyondLastLine: false,
  });
  $('.content-wrapper').block({
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
      opacity: 0.9,
    },
  });
  $.ajax({
    url: 'settings/config/invoice',
    type: 'GET',
    success: function (data) {
      $('.content-wrapper').unblock();
      const queries = data.queries;
      console.log(queries);
      // $('#header_main_editor').val(queries.main);
      header_main_editor.setValue(queries.main);
      // $('#header_notes_editor').val(queries.notes);
      header_notes_editor.setValue(queries.notes);
      $('#header_despatches_editor').val(queries.despatches);
      $('#header_order_editor').val(queries.order);
      $('#header_update_num_editor').val(queries.update_number);
      $('#header_check_unsended_editor').val(queries.check_unsended);

      $('#currents_customer_editor').val(queries.customer);
      $('#lines_main_editor').val(queries.lines);
      $('#lines_taxes_editor').val(queries.line_taxes);
    },
    error: function (err) {
      $('.content-wrapper').unblock();
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Sorgular servisten alınamadı!',
        text: `${err.responseJSON.message}`,
      });
    },
  });
  $('#save').on('click', function () {
    $('.content-wrapper').block({
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
        opacity: 0.9,
      },
    });
    const queries = {
      main: $('#header_main_editor').val(),
      notes: $('#header_notes_editor').val(),
      despatches: $('#header_despatches_editor').val(),
      order: $('#header_order_editor').val(),
      update_number: $('#header_update_num_editor').val(),
      check_unsended: $('#header_check_unsended_editor').val(),
      customer: $('#currents_customer_editor').val(),
      lines: $('#lines_main_editor').val(),
      line_taxes: $('#lines_taxes_editor').val(),
    };
    $.ajax({
      url: 'settings/config/invoice',
      type: 'POST',
      data: {
        queries: queries,
      },
      success: function (data) {
        $('.content-wrapper').unblock();
        Swal.fire({
          icon: 'success',
          title: 'Sorgular kaydedildi!',
        });
      },
      error: function (err) {
        $('.content-wrapper').unblock();
        console.log(err);
        Swal.fire({
          icon: 'error',
          title: 'Sorgular kaydedilemedi!',
          text: `${err.responseJSON.message}`,
        });
      },
    });
  });
});
