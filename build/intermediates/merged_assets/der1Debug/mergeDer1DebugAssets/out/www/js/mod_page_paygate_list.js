function paygate_list() {
    var ssql = "SELECT * FROM config_paygate;";
    var buff = '';

    sql_data(ssql, function (data) {
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                buff += '<tr >'
                buff += ' <td >'
                buff += '  <span style="font-size:18px; font-weight:bold;">' + data[i].provider + '</span><br>'
                buff += '  <span style="font-size:12px;">' + (string_to_boolean(data[i].dev_status) ? 'DEMO' : 'LIVE') + '</span>'
                buff += ' </td>'
                buff += '</tr>'
            }
        } else {
            buff += '<tr >'
            buff += ' <td >'
            buff += '  <span style="font-size:16px;">Not available</span>'
            buff += ' </td>'
            buff += '</tr>'
        }
        $('#paygate-list-item').empty();
        $('#paygate-list-item').append(buff);
    });
}

function paygate_list_option(callback) {
    var ssql = "SELECT * FROM config_paygate;";
    var buff = '';
    sql_data(ssql, function (data) {
        console.log('paygate_list_option', data)

        for (var i = 0; i < data.length; i++) {
            buff += '<option value="cc" data-item=\'' + JSON.stringify(data) + '\'>Pay with ' + data[i].provider + (string_to_boolean(data[i].dev_status) ? ' -DEMO- ' : '') + '</option>'
        }
        callback(buff);
    });
}