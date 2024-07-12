$(document).ready(function () {
  $('#companies').select2({
    placeholder: 'Firma seçiniz',
    allowClear: true,
  });
  $.ajax({
    type: 'get',
    url: '/company/list',
    success: function (response) {
      response.forEach((company) => {
        let option = new Option(`${company.code}`, company.id, false, false);
        $('#companies').append(option);
      });
    },
  });
  $('#login').on('click', function () {
    const companyId = $('#companies').val();
    window.location.href = `/company/${companyId}/dashboard`;
  });
});
