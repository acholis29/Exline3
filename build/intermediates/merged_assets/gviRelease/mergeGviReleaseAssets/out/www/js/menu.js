$(document).ready(function () {

    $('#menu-findbookings').on('click', function () {
        $main_view.router.load({
            url: 'page/findbooking.html'
        });
    });
    $('#menu-itosdevice').on('click', function () {
        $main_view.router.load({
            url: 'page/itos/itos_device.html'
        });
    });
    $('#menu-bookings').on('click', function () {
        $main_view.router.loadPage('#bookings');
    });
    $('#menu-synchronize').on('click', function () {
        $main_view.router.loadPage('#synchronize');
    });
    $('#menu-price-list').on('click', function () {
        //$main_view.router.loadPage('#price-list');
        $main_view.router.load({
            url: 'product.html'
        });
    });
    $('#menu-mflisting').on('click', function () {
        //$main_view.router.loadPage('#price-list');
        $main_view.router.load({
            url: 'mflisting.html'
        });
    });

    $('#menu-exchangerates').on('click', function () {
        $main_view.router.loadPage('#exchangerates-compare');
    });
    $('#menu-manualvoucher').on('click', function () {
        $main_view.router.loadPage('#manual-voucher');
    });
    $('#menu-settings').on('click', function () {
        $main_view.router.loadPage('#settings');
    });

    $('#menu-update-program').on('click', function () {
        var app_version = AppVersion.version;
        var app_build = AppVersion.build;
        var app_current = 'v' + app_version + ' (build ' + app_build + ')';
        var update_url = $SETTINGS.server + "apk/version.xml";
        //var update_url      = "http://updateapps.smarttouristicsystem.com/"+$SETTINGS.initial_company+"/version.xml";

        $app.modal({
            title: 'Update',
            text: $STRING.apps_update.replace(/@:version:/g, app_current),
            buttons: [
                {
                    text: 'Check',
                    bold: true,
                    onClick: function () {
                        window.AppUpdate.checkAppUpdate(onSuccess, onFail, update_url);
                    }
                },
                {
                    text: 'Later',
                    onClick: function () {

                    }
                }]
        });

        function onSuccess(result) {
            $app.alert(get_update_message(result.code), $STRING.info_information);
        }

        function onFail(result) {
            $app.alert(get_update_message(result.code), 'Internet Disconnected');
        }

        function get_update_message(code) {
            /*
                int VERSION_NEED_UPDATE     = 201;
                int VERSION_UP_TO_UPDATE    = 202;
                int VERSION_UPDATING        = 203;
                int VERSION_RESOLVE_FAIL    = 301;
                int VERSION_COMPARE_FAIL    = 302;
                int REMOTE_FILE_NOT_FOUND   = 404;
                int NETWORK_ERROR           = 405;
                int NO_SUCH_METHOD          = 501;
                int UNKNOWN_ERROR           = 901;
            */
            var result = '';
            switch (code) {
                case 201:
                case 203:
                    result = 'The application package will prompt to install after it finish downloaded.';
                    break;
                case 202:
                    result = 'Exline is up to date!';
                    break;
                case 301:
                    result = 'XML resolve fail!';
                    break;
                case 302:
                    result = 'XML compare fail!';
                    break;
                case 404:
                    result = 'File not found!';
                    break;
                case 405:
                    result = 'No internet connection!';
                    break;
                case 501:
                    result = 'Unknown method!';
                    break;
                default:
                    result = '';
            }
            return result;
        }
    });

    $app.onPageBeforeAnimation('settings synchronize bookings product mflisting exchangerates-compare manual-voucher findbooking itosdevice', function (page) {
        $app.closePanel();
        console.log(page)
        switch (page.name) {
            case 'synchronize':
                $('#view-sync-transaction').trigger('click');
                break;
            case 'bookings':
                $('#view-booking-local').trigger('click');
                break;
            case 'product':
                $('#view-price-local').trigger('click');
                break;
            case 'exchangerates-compare':
                exchangerates_compare();
                break;
            case 'settings':
                $app.showTab('#tab-config-general');
                break;
            case 'itosdevice':
                $('#itos_pay_code').val(SESSION.transaction_number);
                break;
        }
    });

    $('#exchangerates-update').on('click', function () {
        sync_master_refresh(function () {
            sync_master_execute();
        });
    });
});

function exchangerates_compare() {
    var ratedate = '';
    var buffer = '';

    $('#ratedate-device').empty();
    $('#ratedate-server').empty();

    ssql_load('LIST_EXCHANGERATE', 'ALL', function (ssql_data) {
        ssql = ssql_data.script;
        sql_data(ssql, function (device) {

            if (device.length) {
                ratedate = device[0].ratedate.substr(0, 10);
                ratedate = date_format(ratedate, "dd/MMM/yyyy");
                $('#ratedate-device').append(ratedate);

                for (var i = 0; i < device.length; i++) {
                    var rate = parseFloat(device[i].rate);
                    var ca_rate = parseInt(rate) != 0 ? rate.toFixed(2) : rate.toFixed(6);

                    buffer += '<tr data-item=\'' + JSON.stringify(device[i]) + '\'>';
                    buffer += '<td>' + device[i].codefrom + ' to ' + device[i].codeto + '</td>';
                    buffer += '<td class="device">' + ca_rate + '</td>';
                    buffer += '<td class="server"></td>';
                    buffer += '</tr>';

                }
            } else {
                buffer += '<tr ><td colspan="3" style="padding:10p;">NO DATA</td></tr>';
            }

            $('#exchangerates-compare-list').empty();
            $('#exchangerates-compare-list').append(buffer);

            // check for internet connection
            // error on iOS: navigator.connection.type
            var isOK = navigator.connection ? (navigator.connection.type != Connection.NONE) : true;

            if (isOK) {
                var module = get_core_module();
                var serialize = '&act=form-payment-exchangerates'
                serialize += '&ef='
                serialize += '&et='

                $.ajax({
                    url: module,
                    data: serialize,
                    dataType: 'json',
                    success: function (online) {

                        if (online.length) {
                            ratedate = online[0].ratedate.substr(0, 10);
                            // format required, the date comes in dd/MM/yyyy
                            ratedate = ratedate.split('/');
                            ratedate = ratedate[2] + '-' + ratedate[1] + '-' + ratedate[0];
                            ratedate = date_format(ratedate, "dd/MMM/yyyy");

                            $('#rate-server-title').empty();
                            $('#rate-server-title').append('Server');
                            $('#ratedate-server').append(ratedate);

                            $('#exchangerates-compare-list tr').each(function (i, e) {
                                var $tr = $(e);
                                var item = $tr.data('item');

                                for (var i = 0; i < online.length; i++) {
                                    var rate_server = parseFloat(online[i].rate);
                                    rate_server = parseInt(rate_server) != 0 ? rate_server.toFixed(2) : rate_server.toFixed(6);
                                    var rate_device = $tr.find('.device').text();

                                    if (item.idx_currency_from == online[i].idx_currency_from
                                        && item.idx_currency_to == online[i].idx_currency_to) {
                                        if (rate_server != rate_device) {
                                            $tr.find('.device').css('color', 'red');
                                        }
                                        $tr.find('.server').append(rate_server);
                                    }
                                }
                            });

                            // Sometimes, the back office doing it wrong!
                            if (device.length != online.length) {
                                $app.alert('Exchange rates data from server is incorrect, please contact administrator to fix this issue!', $STRING.info_important, function () {
                                    console.log('Rate online: ' + online.length);
                                    console.log('Rate device: ' + device.length);
                                });
                            }
                        } else {
                            console.log('No data on server!');
                        }

                    }
                });
            } else {
                $('#rate-server-title').empty();
            }
        });
    });
}