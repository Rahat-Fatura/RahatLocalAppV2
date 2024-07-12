$(document).ready(function () {
  const unsecuredCopyToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Unable to copy to clipboard', err);
    }
    document.body.removeChild(textArea);
  };

  const copyToClipboard = (content) => {
    if (window.isSecureContext && navigator.clipboard) {
      navigator.clipboard.writeText(content);
    } else {
      unsecuredCopyToClipboard(content);
    }
  };
  const theme = $('html').hasClass('light-style') ? 'default' : 'default-dark';
  const isLight = $('html').hasClass('light-style');
  let selectedNode = 'Ana Gövde';
  let queries = {
    main: '',
    notes: '',
    despatches: '',
    order: '',
    update_number: '',
    check_unsended: '',
    customer: '',
    lines: '',
    line_taxes: '',
    activate_http: '',
    set_api_request: '',
    table_trigger: '',
  };
  const descriptionMapping = {
    'Ana Gövde': 'main',
    Notlar: 'notes',
    İrsaliyeler: 'despatches',
    Siparişler: 'order',
    'Numara Güncelleme': 'update_number',
    'Gönderilmemiş Liste': 'check_unsended',
    Müşteri: 'customer',
    Kalemler: 'lines',
    Vergiler: 'line_taxes',
    'HTTP Aktifleştirme': 'activate_http',
    'HTTP Fonksiyonu': 'set_api_request',
    'Tablo Trigger': 'table_trigger',
  };

  let invoice_sql_editor = monaco.editor.create(document.getElementById('invoice_sql_editor'), {
    value: ``,
    language: 'sql',
    theme: isLight ? 'vs' : 'vs-dark',
    automaticLayout: true,
    scrollBeyondLastLine: false,
    wordWrap: 'on',
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
      Object.keys(data.queries).forEach((key) => {
        queries[key] = data.queries[key];
      });
      invoice_sql_editor.setValue(queries.main);
    },
    error: function (err) {
      $('.content-wrapper').unblock();
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Fatura sorguları servisten alınamadı!',
        text: `${err.responseJSON.message}`,
      });
    },
  });
  $('#invoice-sqls-tree')
    .jstree({
      core: {
        themes: {
          name: theme,
        },
        data: [
          {
            text: 'Üst Bilgi',
            state: {
              opened: true,
            },
            children: [
              {
                text: 'Ana Gövde',
                type: 'sql',
                state: {
                  selected: true,
                },
              },
              {
                text: 'Notlar',
                type: 'sql',
              },
              {
                text: 'İrsaliyeler',
                type: 'sql',
              },
              {
                text: 'Siparişler',
                type: 'sql',
              },
              {
                text: 'Numara Güncelleme',
                type: 'sql',
              },
              {
                text: 'Gönderilmemiş Liste',
                type: 'sql',
              },
            ],
          },
          {
            text: 'Müşteriler',
            state: {
              opened: true,
            },
            children: [
              {
                text: 'Müşteri',
                type: 'sql',
              },
            ],
          },
          {
            text: 'Kalemler',
            state: {
              opened: true,
            },
            children: [
              {
                text: 'Kalemler',
                type: 'sql',
              },
              {
                text: 'Vergiler',
                type: 'sql',
              },
            ],
          },
        ],
      },
      plugins: ['types'],
      types: {
        default: {
          icon: 'ti ti-folder',
        },
        sql: {
          icon: 'ti ti-sql text-primary',
        },
      },
    })
    .on('select_node.jstree', function (e, data) {
      if (data.node.type !== 'sql') {
        selectedNode = '';
        invoice_sql_editor.setValue('');
        return;
      }
      selectedNode = data.node.text;
      invoice_sql_editor.setValue(queries[descriptionMapping[selectedNode]]);
    });

  invoice_sql_editor.getModel().onDidChangeContent((event) => {
    queries[descriptionMapping[selectedNode]] = invoice_sql_editor.getValue();
  });

  $('#save-invoice-sqls').on('click', function () {
    console.log(queries);
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
  $('#run-http-activation-query').on('click', function () {
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
      url: 'settings/sql/invoice/http-activate',
      type: 'GET',
      success: function (data) {
        console.log(data);
        $('.content-wrapper').unblock();
        $('#http-activation-input').val(data.query);
      },
      error: function (err) {
        $('.content-wrapper').unblock();
        console.log(err);
        Swal.fire({
          icon: 'error',
          title: 'HTTP Aktivasyon Sorgusu Çalıştırılamadı!',
          text: `${err.responseJSON.message}`,
        });
      },
    });
  });
  $('#run-http-function-query').on('click', function () {
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
      url: 'settings/sql/invoice/http-function',
      type: 'GET',
      success: function (data) {
        console.log(data);
        $('.content-wrapper').unblock();
        $('#http-function-input').val(data.query);
      },
      error: function (err) {
        $('.content-wrapper').unblock();
        console.log(err);
        Swal.fire({
          icon: 'error',
          title: 'HTTP Fonksiyon Sorgusu Çalıştırılamadı!',
          text: `${err.responseJSON.message}`,
        });
      },
    });
  });
  $('#run-table-trigger-query').on('click', function () {
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
      url: 'settings/sql/invoice/table-trigger',
      type: 'GET',
      success: function (data) {
        console.log(data);
        $('.content-wrapper').unblock();
        $('#table-trigger-input').val(data.query);
      },
      error: function (err) {
        $('.content-wrapper').unblock();
        console.log(err);
        Swal.fire({
          icon: 'error',
          title: 'Tablo Trigger Sorgusu Çalıştırılamadı!',
          text: `${err.responseJSON.message}`,
        });
      },
    });
  });

  $('#copy-editor-query').on('click', function () {
    const queryName = descriptionMapping[selectedNode];
    $.ajax({
      url: `settings/sql/invoice/copy/${queryName}`,
      success: async function (data) {
        const query = data.query;
        console.log(query);
        copyToClipboard(query);
        Swal.fire({
          icon: 'success',
          title: 'Sorgu kopyalandı!',
          text: `Sorgu başarıyla kopyalandı.`,
        });
      },
      error: function (err) {
        console.log(err);
        Swal.fire({
          icon: 'error',
          title: 'Sorgu kopyalanamadı!',
          text: `${err.responseJSON.message}`,
        });
      },
    });
  });
});
