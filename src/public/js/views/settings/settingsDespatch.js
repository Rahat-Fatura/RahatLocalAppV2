$(document).ready(function () {
  const theme = $('html').hasClass('light-style') ? 'default' : 'default-dark';
  const isLight = $('html').hasClass('light-style');
  let selectedNode = 'Ana Gövde';
  let queries = {
    main: '',
    notes: '',
    update_number: '',
    check_unsended: '',
    customer: '',
    lines: '',
    shipment_driver: '',
    shipment_carrier: '',
    shipment_delivery: '',
    activate_http: '',
    set_api_request: '',
    table_trigger: '',
  };
  const descriptionMapping = {
    'Ana Gövde': 'main',
    Notlar: 'notes',
    'Numara Güncelleme': 'update_number',
    'Gönderilmemiş Liste': 'check_unsended',
    Müşteri: 'customer',
    Kalemler: 'lines',
    Sürücü: 'shipment_driver',
    'Nakliye Firması': 'shipment_carrier',
    Teslimat: 'shipment_delivery',
    'HTTP Aktifleştirme': 'activate_http',
    'HTTP Fonksiyonu': 'set_api_request',
    'Tablo Trigger': 'table_trigger',
  };

  let despatch_sql_editor = monaco.editor.create(document.getElementById('despatch_sql_editor'), {
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
    url: 'settings/config/despatch',
    type: 'GET',
    success: function (data) {
      $('.content-wrapper').unblock();
      Object.keys(data.queries).forEach((key) => {
        queries[key] = data.queries[key];
      });
      despatch_sql_editor.setValue(queries.main);
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
  $('#despatch-sqls-tree')
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
            ],
          },
          {
            text: 'Taşıyıcı Bilgileri',
            state: {
              opened: true,
            },
            children: [
              {
                text: 'Sürücü',
                type: 'sql',
              },
              {
                text: 'Nakliye Firması',
                type: 'sql',
              },
              {
                text: 'Teslimat Adresi',
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
        despatch_sql_editor.setValue('');
        return;
      }
      selectedNode = data.node.text;
      despatch_sql_editor.setValue(queries[descriptionMapping[selectedNode]]);
    });

  despatch_sql_editor.getModel().onDidChangeContent((event) => {
    queries[descriptionMapping[selectedNode]] = despatch_sql_editor.getValue();
  });

  $('#save-despatch-sqls').on('click', function () {
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
      url: 'settings/config/despatch',
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
