

$(document).ready(function () {


    $('body').on('click', '#div-find-booking li', function () {
        var $data = $(this).data('item');
        init_booking($data)
    });

    $('body').on('click', '#fab-printvoucher', function () {
        var $this = $(this);
        var $data = $this.data('item');
        $data.status_prn = 'DUPLICATE';

        switch ($SETTINGS.print_device) {
            case 'TPV':
                // print_TPV.js
                tpv_print($data, 'VOUCHER', function () { });
                break;
            default:
                printer_device_list($data, 'VOUCHER');
                break;

        }

    });
    $('body').on('click', '#fab-cxtrx', function () {
        var $data = $(this).data('item');
        init_pagecx($data)
        // init_traveller($data)
        //printer_device_list($data);
    });

    $('body').on('click', '#save_cx', function () {
        var $data = $(this).data('item');
        console.log($data)
    });


    $('body').on('click', '#print-pax', function () {

        var $this = $(this);
        var $data = $.parseJSON($('#ul-list-traveller').data('item'));
        var $namelist = ''
        var number = 0;
        var $paxA = 0;
        var $paxC = 0;
        var $paxI = 0;
        var $priceA = 0;
        var $priceC = 0;
        var $priceI = 0;
        var $price_pax = 0;

        if ($('#ul-list-traveller input[type=checkbox]:checked').length > 0) {
            $('#ul-list-traveller li input[type=checkbox]').each(function (i, e) {
                if ($(this).is(':checked')) {
                    number++;
                    var $dtnamelist = $(this).attr('data-namepax');
                    $namelist += $dtnamelist.split('|')[0].toUpperCase() + '<br>';
                    switch ($(this).attr('data-namepax').substr(0, 1)) {
                        case 'C':
                            $paxC++
                            $priceC += parseFloat($dtnamelist.split('|')[2]);
                            break;
                        case 'I':
                            $paxI++
                            $priceI += parseFloat($dtnamelist.split('|')[2]);
                            break;
                        default:
                            $paxA++;
                            $priceA += parseFloat($dtnamelist.split('|')[2]);
                            break;
                    }
                }
            })

            $price_pax = $priceA + $priceC + $priceI
            $data.namelist = $namelist
            $data.salesrate = $price_pax
            $data.totalsales = $price_pax
            $data.pax = number
            $data.paxa = $paxA
            $data.paxc = $paxC
            $data.paxi = $paxI
            $data.statusprint = 'perpax'
            $data.val_payment = 'Cash ' + $data.currency + ': ' + $price_pax

            switch ($SETTINGS.print_device) {
                case 'TPV':
                    // print_TPV.js
                    tpv_print($data, 'VOUCHER', function () { });
                    break;
                default:
                    printer_device_list($data, 'VOUCHER');
                    break;

            }
        }
    });

    $('body').on('click', '#fab-printticket_lp', function () {
        var $this = $(this);
        var $data = $this.data('item');
        var $arr = $data.idx_transaction.split('#');

        switch ($SETTINGS.print_device) {
            case 'TPV':
                // print_TPV.js
                tpv_printticketLP($data.idx_mfexcursion, $arr[2], 'DUPLICATE', function (r) {
                    if (r == 0) {
                        $lp.resync_ticket($data, function (rr) { });
                    }
                })
                break;
            default:
                printer_device_list($data.idx_mfexcursion + '#' + $data.idx_transaction, 'TICKET');
                break;

        }
    });

})

function init_reprint_ticketlp(item) {
    console.log(item)


}

function init_traveller(item) {


    var $data = item;
    var guest_list = '';
    var number = 0;
    var buffer = [];

    if ($data.hasOwnProperty('namelist')) {
        var $wr_paxcombi = { wrapper: '', count: 0 }
        $wr_paxcombi.wrapper = $('#ul-list-traveller');
        //$wr_paxcombi.count    = $paxcombi.length;

        html_template_init($wr_paxcombi.wrapper, 'li');
        $wr_paxcombi.wrapper.empty();

        guest_list = $data.namelist;
        guest_list = guest_list.replace(/\([^\)]*\)/g, '');  // remove age
        guest_list = guest_list.replace(/<[^>]*>/g, ',');    // remove html tag

        // format namelist
        guest_list = guest_list.split(',');

        for (var j = 0; j < guest_list.length; j++) {
            var name = guest_list[j].trim();

            if (name.length > 4) {
                number++;
                //    buffer += +'<br>';

                $template = html_template($wr_paxcombi.wrapper);
                $template.set('@:data:', name.toUpperCase());
                $template.set('@:item-name:', number + '. ' + name.split('|')[0].toUpperCase());
                $wr_paxcombi.wrapper.append($template.get());
                buffer.push(name)
            }
        }
        $('#ul-list-traveller').data('item', JSON.stringify($data));



    }

    if (buffer.length > 0) {
        $app.popup('.popup-printpax');
    }
}



function openbooking(item) {
    var $data = item;
    var number = 0;
    var buffer = '';
    console.log($data)

    var tour_date = $data.pickup.split(' ')[0];
    var guest = $data.guestname.toUpperCase();
    var pickup_location = $data.hotel.toUpperCase();
    var pickup_time = $data.pickup.split(' ')[1];
    var meeting_point = typeof ($data.meeting_point) !== 'undefined' ? $data.meeting_point : '-';
    var pax_total = parseInt($data.paxa) + parseInt($data.paxc) + parseInt($data.paxi);
    var pax_info = $data.paxa + 'A+' + $data.paxc + 'C+' + $data.paxi + 'I';
    var guest_list = '';
    var pay_excurpax = $data.currency + ' ' + format_currency($data.salesrate, false);
    var pay_disc = format_currency(parseFloat($data.promo), false); // discount+promo_p
    var pay_surcharges = "";
    var pay_total = $data.currency + ' ' + format_currency($data.totalsales, false);
    var pay_method = $data.val_payment.split(':').join(' ');
    var status = '';
    var $idxtrx = $data.idx_transaction.split('#');

    $('#fab-printticket_lp').hide()
    console.log($idxtrx.length, $idxtrx);

    if ($idxtrx.length > 1) {
        $('#fab-printticket_lp').show();
    }

    pay_method = pay_method.toUpperCase();
    pay_method = pay_method.replace('PAY ON TOUR', label_pot.toUpperCase());

    // formating payment workaround
    // 2019-04-11
    var arr_payment = pay_method.replace(/:/g, ' ').split(', '); // bersihkan titik dua dan pisah hasil dari group concat
    var tmp_buffer = '';
    for (var i = 0; i < arr_payment.length; i++) {
        var arr_word = arr_payment[i].split(' ');
        for (var j = 0; j < arr_word.length; j++) {
            if (!isNaN(parseInt(arr_word[j].substr(0, 1)))) { // is number?
                tmp_buffer += format_currency(arr_word[j], false) + ' ';
            } else {
                tmp_buffer += arr_word[j] + ' ';
            }
        }
        tmp_buffer = tmp_buffer.trim() + ', ';
    }
    tmp_buffer = tmp_buffer.trim();
    tmp_buffer = tmp_buffer.substr(0, tmp_buffer.length - 1);
    pay_method = tmp_buffer;

    // check for support of namelist column
    if ($data.hasOwnProperty('namelist')) {
        guest_list = $data.namelist;
        guest_list = guest_list.replace(/\([^\)]*\)/g, '');  // remove age
        guest_list = guest_list.replace(/<[^>]*>/g, ',');    // remove html tag

        // format namelist
        guest_list = guest_list.split(',');
        for (var j = 0; j < guest_list.length; j++) {
            var name = guest_list[j].trim();
            console.log(name.split('|')[0])
            if (name.length > 4) {
                number++;
                buffer += number + '. ' + name.split('|')[0].toUpperCase() + '<br>';
            }
        }
        // remove last {br}
        guest_list = buffer.slice(0, - 4);
    }

    // check for surcharge existence (prevent error)
    if ($data.surcharge_detail) {
        pay_surcharges = $data.surcharge_detail.split(', ');
        buffer = "";
        for (var j = 0; j < pay_surcharges.length; j++) {
            var name = pay_surcharges[j].trim();

            if (name.length) {
                buffer += '+ ' + name.toUpperCase() + '<br>';
            }
        }
        // remove last {br}
        pay_surcharges = buffer.slice(0, - 4);
    }

    if ($data.hasOwnProperty('stat')) {
        switch ($data.stat) {
            case 'x':
            case 'y':
                status = 'DELETED';
                break;
            case '0':
            case '1':
            case '':
                status = '-';
                break;
            default:
                status = $data.stat.toUpperCase();
        }
    }

    guest_list = guest_list ? guest_list : '-';
    pay_disc = pay_disc ? pay_disc : '-';
    pay_surcharges = pay_surcharges ? pay_surcharges : '-';

    $('#voucherb-number').text($data.voucher);
    $('#voucherb-bookingdate').text('BOOKED ON ' + $data.date_tr);
    $('#voucherb-excursion').text($data.excursion_alias);
    $('#voucherb-tourdate').text(tour_date);
    $('#voucherb-guestname').text(guest);
    $('#voucherb-pickup-location').text(pickup_location);
    $('#voucherb-pickup-time').text(pickup_time);
    $('#voucherb-meeting-point').text(meeting_point);
    $('#voucherb-pax').text(pax_total + ' PERSON (' + pax_info + ')');
    $('#voucherb-guestlist').empty();
    $('#voucherb-guestlist').append(guest_list);
    $('#voucherb-paydetail-excursion').text(pay_excurpax);
    $('#voucherb-paydetail-discount').text(pay_disc);
    $('#voucherb-paydetail-surcharge').text(pay_surcharges);
    $('#voucherb-paytotal').text(pay_total);
    $('#voucherb-paymethod').empty().append(pay_method);
    $('#voucherb-rep').text($SETTINGS.user.name);
    $('#voucherb-agent').text($data.agent);
    $('#voucherb-supplier').text($data.supplier);
    $('#voucherb-status').text(status);

    $('#fab-printvoucher').data('item', $data);
    $('#fab-cxtrx').data('item', $data);
    $('#fab-printticket_lp').data('item', $data);

    // remark button
    //$('#voucher-remark').data('item', $data);

    // connect button (custom voucher)
    //$('#voucher-connect').data('item', $data);
    //$('#voucher-connect').hide();
    //$('#voucher-connect-br').hide();

    // edit button
    //$('#voucher-edit').data('item', null);
    //$('#voucher-edit').hide();
    //$('#voucher-edit-br').hide();

    /*
    if(unsync) {
        $('.popup-voucher .unsync').data('item', $data);
        $('#voucher-unsync').show();
        $('#voucher-unsync-br').show();
    } else {
        if(string_to_boolean($SETTINGS.voucher_connect)) {
            $('#voucher-connect').show();
            $('#voucher-connect-br').show();
        }

        $('.popup-voucher .unsync').data('item', null);
        $('#voucher-unsync').hide();
        $('#voucher-unsync-br').hide();

        var tmp_tour_date   = tour_date.split('/');
            tmp_tour_date   = tmp_tour_date[2]+'-'+tmp_tour_date[1]+'-'+tmp_tour_date[0];
            tmp_tour_date   = new Date(tmp_tour_date);
        var tmp_today       = new Date();

        if(tmp_tour_date>tmp_today && string_to_boolean($SETTINGS.voucher_amend)) {
            // allow edit
            $('#voucher-edit').data('item', $data);
            $('#voucher-edit').show();
            $('#voucher-edit-br').show();
        }
    }
    
    $app.popup('.popup-voucher');
    */

}

function opencancel(item, page) {
    console.log($data);

    var $data = item;
    var number = 0;
    var buffer = '';
    var tour_date = $data.pickup.split(' ')[0];

    $('#save_cx').data('item', item);

    console.log(page);

    $('#voucherbcx-number').text($data.voucher);
    $('#voucherbcx-bookingdate').text('BOOKED ON ' + $data.date_tr);
    $('#voucherbcx-excursion').text($data.excursion_alias);
    $('#voucherbcx-datetour').text('TOUR ON ' + tour_date);




}

function init_booking(item) {
    $main_view.router.load({
        url: 'page/detailbooking.html',
        query: item
    });
}

function init_pagecx(item) {
    $main_view.router.load({
        url: 'page/canceltrx.html',
        query: item
    });
}

function find_booking() {
    $loader.show();
    $('#div-find-booking').empty();
    var module = get_core_module();
    var serialize = 'act=bookings-list-v4'
    serialize += '&keywords=' + $('#t_findbooking').val()
    serialize += '&usr=' + $SETTINGS.user.id
    $.ajax({
        url: module,
        data: serialize,
        dataType: 'json',
        success: function (data) {
            console.log(data);
            $loader.hide();

            var buffer = '';

            for (var i = 0; i < data.length; i++) {
                var next = data[i + 1] ? data[i + 1].voucher : undefined;
                var prev = data[i - 1] ? data[i - 1].voucher : undefined;

                buffer += buffer_item_transaction_header(data[i], next, prev);
            }
            $('#div-find-booking').append(buffer);
        }
    });
}

// cfuft204