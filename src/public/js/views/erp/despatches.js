const blockPage = (message) => {
  $.blockUI({
    message: `
        <div class="loader-block d-flex justify-content-center">
            <div class="sk-bounce me-3">
                <div class="sk-bounce-dot"></div>
                <div class="sk-bounce-dot"></div>
            </div>
            <p class="mb-0">${message}</p>
        </div>`,
    css: {
      backgroundColor: 'transparent',
      border: '0',
    },
    overlayCSS: {
      opacity: 0.5,
    },
  });
};

$(document).ready(function () {
  const despatch_table = $('#despatches').DataTable({
    language: {
      url: '/vendor/libs/datatables/language/dataTables.tr.json',
    },
    serverSide: true,
    processing: true,
    ajax: {
      url: '/movements/sending/despatch/dt-list',
      data: (d) => {
        return $.extend({}, d, {
          fdate: fdateObject.formatDate(fdateObject.selectedDates[0], 'Y-m-d'),
          ldate: ldateObject.formatDate(ldateObject.selectedDates[0], 'Y-m-d'),
          status_codes: $('#status').val(),
          type_filter: $('#type-filter').val(),
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

  const searchTable = () => {
    despatch_table.draw();
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

  $('#despatches tbody').on('click', '#status-label', function () {
    let data = despatch_table.row($(this).parents('tr')).data();
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

  $('#despatches tbody').on('click', '#show-json', function () {
    let data = despatch_table.row($(this).parents('tr')).data();
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

  $('[name^="send_"]').on('click', (e) => {
    let dspId = e.target.name.split('_')[1];
    blockPage('Fatura sisteme gönderiliyor...');
    $.ajax({
      type: 'GET',
      url: `/erp/despatch/send/${dspId}`,
      success: function (response) {
        $.unblockUI();
        Swal.fire({
          title: `${dspId} ID'li irsaliye gönderimi başarılı!`,
          icon: 'success',
          confirmButtonText: 'Tamam',
          customClass: {
            confirmButton: 'btn btn-primary me-2',
          },
          buttonsStyling: false,
        });
      },
      error: (e) => {
        $.unblockUI();
        Swal.fire({
          title: `${dspId} ID'li irsaliye gönderimi hatalı!`,
          text: JSON.stringify(e?.responseJSON ? (e.responseJSON?.error ? e.responseJSON?.error : e?.responseJSON) : e),
          icon: 'error',
          confirmButtonText: 'Tamam',
          customClass: {
            confirmButton: 'btn btn-danger me-2',
          },
          buttonsStyling: false,
        });
      },
      finally: () => {},
    });
  });
});
