$(document).ready(function () {
  const invoice_table = $('#documents').DataTable({
    language: {
      url: '/vendor/libs/datatables/language/dataTables.tr.json',
    },
    serverSide: true,
    processing: true,
    ajax: {
      url: 'movements/dt-list',
      data: (d) => {
        return $.extend({}, d, {
          searchbox: $('#searchbox').val(),
          fdate: fdateObject.formatDate(fdateObject.selectedDates[0], 'Y-m-d'),
          ldate: ldateObject.formatDate(ldateObject.selectedDates[0], 'Y-m-d'),
          status_codes: $('#status').val(),
          type_filter: $('#type-filter').val(),
          document_filter: $('#document-filter').val(),
        });
      },
    },
    columns: [
      { data: 'id' },
      { data: 'status' },
      { data: 'json' },
      { data: 'external_id' },
      { data: 'external_code' },
      { data: 'status_desc' },
      { data: 'created_at' },
      { data: 'updated_at' },
      { data: 'movement_type' },
      { data: 'document_type' },
    ],
    columnDefs: [
      {
        // For Checkboxes
        targets: 0,
        searchable: false,
        orderable: false,
        render: function () {
          return '<input type="checkbox" class="dt-checkboxes form-check-input">';
        },
        checkboxes: {
          selectRow: true,
          selectAllRender: '<input type="checkbox" class="form-check-input">',
        },
      },
      {
        targets: 2,
        orderable: false,
        className: 'dt-center',
        render: function () {
          return '<span id="show-json" class="badge bg-secondary">Göster</span>';
        },
      },
      {
        targets: 1,
        orderable: false,
        className: 'dt-center',
        render: (data, types, row) => {
          let status = '';
          let text = '';
          switch (data) {
            case 100:
              status = 'bg-warning bg-glow';
              text = `<i class="fa-regular fa-square-check fa-xl"></i>&nbsp;&nbsp;İşleniyor`;
              break;
            case 101:
              status = 'bg-warning bg-glow';
              text = `<i class="fa-regular fa-square-check fa-xl"></i>&nbsp;&nbsp;İşleniyor`;
              break;
            case 200:
              status = 'bg-label-success';
              text = `<i class="fa-regular fa-square-check fa-xl"></i>&nbsp;&nbsp;Başarılı`;
              break;
            case 400:
              status = 'bg-danger bg-glow';
              text = `<i class="fa-solid fa-square-xmark fa-xl"></i>&nbsp;&nbsp;&nbsp;Hatalı`;
              break;
            default:
              status = 'bg-warning bg-glow';
              break;
          }
          return `
                  <span id="status-label" class="badge ${status} d-block">${text}</span>`;
        },
      },
      {
        targets: [5],
        visible: false,
      },
    ],
    order: [[1, 'desc']],
    dom: '<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p><"col-sm-12 col-md-6"l>>',
    select: {
      // Select style
      style: 'multi',
      selector: 'tr>td:nth-child(1), tr>td:nth-child(4), tr>td:nth-child(5), tr>td:nth-child(6), tr>td:nth-child(7)',
    },
  });

  $('#documents').on('processing.dt', function (e, settings, processing) {
    if (processing) {
      $('#table-div').block({
        message: `
                <div class="d-flex justify-content-center">
                    <div class="sk-grid sk-primary">
                        <div class="sk-grid-cube"></div>
                        <div class="sk-grid-cube"></div>
                        <div class="sk-grid-cube"></div>
                        <div class="sk-grid-cube"></div>
                        <div class="sk-grid-cube"></div>
                        <div class="sk-grid-cube"></div>
                        <div class="sk-grid-cube"></div>
                        <div class="sk-grid-cube"></div>
                        <div class="sk-grid-cube"></div>
                    </div>
                </div>`,
        css: {
          backgroundColor: 'transparent',
          color: '#fff',
          border: '0',
        },
        overlayCSS: {
          opacity: 0.8,
          backgroundColor: isDarkStyle ? config.colors_dark.cardColor : config.colors.cardColor,
        },
      });
    } else {
      $('#table-div').unblock();
    }
  });

  const searchTable = () => {
    invoice_table.draw();
  };

  let ldate = new Date();
  let fdate = new Date();
  fdate = fdate.setDate(ldate.getDate() - 7);
  ldate = ldate.setDate(ldate.getDate() + 1);
  let fdateObject = $('#fdate').flatpickr({
    locale: 'tr',
    defaultDate: fdate,
    dateFormat: 'd.m.Y',
    onChange: function (selectedDates, dateStr, instance) {
      searchTable();
    },
  });
  let ldateObject = $('#ldate').flatpickr({
    locale: 'tr',
    defaultDate: ldate,
    dateFormat: 'd.m.Y',
    onChange: function (selectedDates, dateStr, instance) {
      searchTable();
    },
  });

  $('#status').each(function () {
    var $this = $(this);
    $this
      .wrap('<div class="position-relative"></div>')
      .select2({
        dropdownParent: $this.parent(),
        placeholder: 'Durum',
        multiple: true,
        closeOnSelect: false,
        allowClear: true,
      })
      .on('change', (e) => {
        searchTable();
      })
      .val([])
      .trigger('change');
  });

  $('#type-filter').each(function () {
    var $this = $(this);
    $this
      .wrap('<div class="position-relative"></div>')
      .select2({
        dropdownParent: $this.parent(),
        placeholder: 'Tip',
        multiple: false,
        closeOnSelect: false,
        allowClear: true,
      })
      .on('change', (e) => {
        searchTable();
      })
      .val([])
      .trigger('change');
  });

  $('#document-filter').each(function () {
    var $this = $(this);
    $this
      .wrap('<div class="position-relative"></div>')
      .select2({
        dropdownParent: $this.parent(),
        placeholder: 'Belge',
        multiple: false,
        closeOnSelect: false,
        allowClear: true,
      })
      .on('change', (e) => {
        searchTable();
      })
      .val([])
      .trigger('change');
  });

  $('#search-button').click((e) => {
    searchTable();
  });
  $('#searchbox').on('focusout', (e) => {
    searchTable();
  });
  $('#searchbox').keypress(function (event) {
    var keycode = event.keyCode ? event.keyCode : event.which;
    if (keycode == '13') {
      searchTable();
    }
  });

  $('#documents tbody').on('click', '#status-label', function () {
    let data = invoice_table.row($(this).parents('tr')).data();
    let error;
    try {
      error = JSON.stringify(JSON.parse(data.status_desc), null, 2);
    } catch (err) {
      error = JSON.stringify(data.status_desc, null, 2);
    }
    Swal.fire({
      title: 'Hata Detayı',
      html: `<textarea class="form-control" rows="15">${error}</textarea>`,
      showConfirmButton: true,
      showCancelButton: false,
      confirmButtonText: 'Tamam',
    });
  });

  $('#documents tbody').on('click', '#show-json', function () {
    let data = invoice_table.row($(this).parents('tr')).data();
    let error;
    try {
      error = JSON.stringify(JSON.parse(data.json), null, 4);
    } catch (err) {
      error = JSON.stringify(data.json, null, 2);
    }
    Swal.fire({
      title: 'JSON',
      html: `<textarea class="form-control" rows="15">${error}</textarea>`,
      showConfirmButton: true,
      showCancelButton: false,
      confirmButtonText: 'Tamam',
    });
  });
});
