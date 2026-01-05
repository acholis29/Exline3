var $calendar;

$( document ).ready(function() {

    /* REMARK EDIT */
    $('#voucher-remark').on('click', function() {
        var data    = $('#voucher-connect').data('item');

        //console.log(data[0].excursion_alias);
        $('#voucher-remark-title').text(data.excursion_alias);

        $loader.show();
        voucher_remark_open(data.idx_transaction, function(data) {
            var newline = '&#10;';
            var remark1 = data[0].remark.replace(/\\n/g, newline);
            var remark2 = data[0].remark_supplier.replace(/\\n/g, newline);

            $loader.hide();

            $('#voucher-remark1').empty().append(remark1);
            $('#voucher-remark2').empty().append(remark2);

            $app.closeModal('.popup-voucher');
            $app.popup('.popup-voucher-remark');
        });
    });

    $('#voucher-remark-save').on('click', function() {
        var data    = $('#voucher-connect').data('item');
        var remark1 = parseESC($('#voucher-remark1').val());
        var remark2 = parseESC($('#voucher-remark2').val());

        $loader.show();
        voucher_remark_update(data.idx_transaction, remark1, remark2, function() {
            $app.closeModal('.popup-voucher-remark');
            $loader.hide();
        });
    });

    /* ADD CUSTOM NUMBER */
    $('#voucher-connect').on('click', function() {
        $('#voucher-custom-number').val('');
        $app.closeModal('.popup-voucher');
        $app.popup('.popup-voucher-connect');
    });

    $('#voucher-connect-apply').on('click', function() {
        var data    = $('#voucher-connect').data('item');
        var code    = $('#voucher-custom-number').val().trim();

        if(code=='') {
            $app.alert("Custom voucher number is required!", $STRING.info_warning, function() {});
            return false;
        }

        $loader.show();
        voucher_connect_apply(data, code, function() {
            $loader.hide();
            $app.closeModal('.popup-voucher-connect');
            $('#view-booking-server').trigger('click');
        });
    });

    /* VOUCHER EDIT */
    /* new module */
    $('#voucher-edit').on('click', function() {
        var data    = $('#voucher-edit').data('item');
        var guest   = data.guestname.split(/\s+/);
        var title   = guest[0].split('(').join('').split(')').join('');
            guest.shift();
        var fname   = guest[0];
            guest.shift();
        var lname   = guest.join(' ');

        var pickup  = data.pickup.split(' ');
        var pi_date = pickup[0];
            pi_date = pi_date.split('/');
            pi_date = pi_date[2]+'-'+pi_date[1]+'-'+pi_date[0];
        var pi_time = pickup[1];
        var msg     = 'Updating transaction data independently is only recommended if you need it as soon as possible, please inform your administration before making any changes.';

        $('#voucher-edit-title').val(title);
        $('#voucher-edit-firstname').val(fname);
        $('#voucher-edit-lastname').val(lname);

        $('#voucher-edit-tourdate').val(pi_date);
        $('#voucher-edit-pickuptime').val(pi_time);

        // 3.0.36
        $('#voucher-edit-pickuplocation-id').val(data.idx_hotel);
        $('#voucher-edit-pickuplocation').val(data.hotel);
        $('#voucher-edit-pickuproom').val(data.hotel_room);

        //console.log(data);

        $app.alert(msg, $STRING.info_warning, function() {
            $app.closeModal('.popup-voucher');
            $app.popup('.popup-voucher-edit');
        });
    });
    $('#voucher-edit-pickuplocation').on('click', function() {
        var buffer = '';
        buffer  = '<li class="item-content">';
        buffer += '<div class="item-inner">';
        buffer += '  <p style="font-style:italic; color:#424242; text-align:center;">Type your location name (hotel/area) in search input above!</p>';
        buffer += '</div>';
        buffer += '</li>';

        $('#list-location').empty();
        $('#list-location').append(buffer);
        $('.popup-list-location input[type=search]').val('');

        $app.popup('.popup-list-location');
    });
    $('#list-location-close').on('click', function() {
        $app.closeModal('.popup-list-location');
        $app.popup('.popup-voucher-edit');
    });
    $('.popup-list-location input[type=search]').on('keyup', function() {
        var $this = $(this);
        var input = $this.val();
        var buffer = '';

        ssql_load('LIST_HOTEL', 'ALL', function(ssql_data) {
            ssql = ssql_data.script;
            ssql = ssql.replace(/@:search:/g, input);

            sql_data(ssql, function(data) {
                for(var i=0; i<data.length; i++) {
                buffer += '<li class="item-content" data-item=\''+JSON.stringify(data[i])+'\'>';
                buffer += '<div class="item-inner">';
                buffer += '  <div class="item-title">'+data[i].hotel+'</div>';
                buffer += '  <a href="#" class="button select-location" ><b>Select</b></a>';
                buffer += '</div>';
                buffer += '</li>';
                }
                $('#list-location').empty();
                $('#list-location').append(buffer);
            });
        });
    });
    $('#list-location').on('click', '.select-location', function() {
        var $this   = $(this);
        var $li     = $this.parents('li');
        var data    = $li.data('item');

        $('#voucher-edit-pickuplocation-id').val(data.idx_hotel);
        $('#voucher-edit-pickuplocation').val(data.hotel);

        $app.closeModal('.popup-list-location');
        $app.popup('.popup-voucher-edit');
    });
    var $voc_edit_calendar = $app.calendar({
        input: '#voucher-edit-tourdate',
        closeOnSelect: true,
        minDate: new Date()
    });
    $('#voucher-edit-pickuptime').mask('00:00');
    $('#voucher-edit-pickuptime').on('change', function() {
        var $this   = $(this);
        try {
            if(!time_format($this.val())) {
                $app.alert('Invalid pickup time!', 'Input Required', function() {
                    $this.val('');
                });
            }
        } catch(e) {
            $app.alert('ERROR: '+e, 'Input Required');
        }
    });
    $('#voucher-edit-save').on('click', function() {
        var data        = $('#voucher-edit').data('item');
        var title       = $('#voucher-edit-title option:selected');
        var firstname   = $('#voucher-edit-firstname');
        var lastname    = $('#voucher-edit-lastname');
        var tourdate    = $('#voucher-edit-tourdate');
        var pickup_area = $('#voucher-edit-pickuplocation');
        var pickup_time = $('#voucher-edit-pickuptime');
        var pickup_room = $('#voucher-edit-pickuproom');

        // protect from unwanted chars
        firstname.val(parseESC(firstname.val()));
        lastname.val(parseESC(lastname.val()));
        pickup_room.val(parseESC(pickup_room.val()));

        if(firstname.val().length == 0) {
            $app.alert('First name required!', 'Input Required', function() {
                firstname.focus();
            });
            return false;
        }
        if(lastname.val().length == 0) {
            $app.alert('Last name required!', 'Input Required', function() {
                lastname.focus();
            });
            return false;
        }
        if(tourdate.val().length == 0) {
            $app.alert('Tour date required!', 'Input Required', function() {
                setTimeout(function() {
                $voc_edit_calendar.open();
                }, 100);
            });
            return false;
        }
        if(pickup_area.val().length == 0) {
            $app.alert('Pickup location required!', 'Input Required', function() {
                $('#voucher-edit-pickuplocation').trigger('click');
            });
            return false;
        }
        if(pickup_time.val().length == 0) {
            $app.alert('Pickup time required!', 'Input Required', function() {
                pickup_time.focus();
            });
            return false;
        }

        console.log(data);

        var pi_date = tourdate.val()+' '+pickup_time.val();
        var pi_area = $('#voucher-edit-pickuplocation-id').val();
        var pi_room = pickup_room.val();

        $loader.show();
        voucher_update(
        {
            idmf: data.idx_mfexcursion,
            guest_title: title.val(),
            guest_fname: firstname.val(),
            guest_lname: lastname.val(),
            idtr: data.idx_transaction,
            pickup_date: pi_date,
            pickup_area: pi_area,
            pickup_room: pi_room
        }, function() {

                var push = {
                    voucher:    data.voucher,
                    excursion:  data.excursion_alias,
                    guest:      (title.val()+' '+firstname.val()+' '+lastname.val()).toUpperCase(),
                    pickup:     (tourdate.val()+' '+pickup_time.val()),
                    area:       pickup_area.val(),
                    room:       pickup_room.val(),
                    email:      data.supplier_email
                };

                voucher_update_notification(push, function() {
                    $('#view-booking-server').trigger('click');
                    $app.closeModal('.popup-voucher-edit');
                });

        });
    });
    /* new module */

    // required to prevent submit
    $('#bookings-search-form').on('submit', function(e) {
        e.preventDefault();
    });

    $('#view-booking-local').on('click', function() {
        var booking_fdate       = $('#i-bookings-search-fdate').val();
        var booking_tdate       = $('#i-bookings-search-tdate').val();

        booking_fdate = booking_fdate ? booking_fdate : get_date();
        booking_tdate = booking_tdate ? booking_tdate : get_date();

        booking_list_offline('', booking_fdate, booking_tdate, function() {
            $app.showTab('#tab-booking-local');
            $loader.hide();
        });
    });
    $('#view-booking-server').on('click', function() {
        var booking_fdate       = $('#i-bookings-search-fdate').val();
        var booking_tdate       = $('#i-bookings-search-tdate').val();

        booking_fdate = booking_fdate ? booking_fdate : get_date();
        booking_tdate = booking_tdate ? booking_tdate : get_date();

        booking_list_online('', booking_fdate, booking_tdate, function() {
            $app.showTab('#tab-booking-server');
            $loader.hide();
        });
    });
/*
    $('#tab-view-detail').on('click', function() {
        $app.showTab('#tab-view-detail');
    });
    $('#tab-view-summary').on('click', function() {
        $app.showTab('#tab-view-summary');
    });
*/
/*
    $('#summary-print').on('click', function() {
        var $this   = $(this);
        var $data   = $this.data('item');
        console.log(JSON.stringify($data));
        printer_device_list($data);
    });
*/
    $('#voucher-print').on('click', function() {
        var $this   = $(this);
        var $data   = $this.data('item');
        $data.status_prn = 'DUPLICATE';

        //console.log(JSON.stringify($data));
        switch($SETTINGS.print_device) {
            case 'TPV':
                // print_TPV.js
                tpv_print($data,'VOUCHER',function(){});                
                break;
            default:
                printer_device_list($data,'VOUCHER');
            break;

        }    
        


    });

    $('#voucher-unsync').on('click', function() {
        var $this   = $(this);
        var $data   = $this.data('item');
        console.log(JSON.stringify($data));
        
        // ask user for action
        $app.modal({
            title:  $STRING.info_confirmation,
            text:   $STRING.booking_unsync.replace(/@:voucher:/g, $data.voucher),
            buttons: [
            {
                text: 'Yes',
                bold: true,
                onClick: function() {
                    var obj_update = tr_sync_status_buffer($data.idx_mfexcursion, '0');
    
                    $loader.show();
                    $status.set('UPDATING SYNC STATUS');

                    tr_sync_status(obj_update, function() {
                        var booking_keyword     = $('#i-bookings-search-keyword').val();
                        var booking_fdate       = $('#i-bookings-search-fdate').val();
                        var booking_tdate       = $('#i-bookings-search-tdate').val();

                        booking_fdate = booking_fdate ? booking_fdate : get_date();
                        booking_tdate = booking_tdate ? booking_tdate : get_date();

                        booking_list_offline(booking_keyword, booking_fdate, booking_tdate, function() {
                            $loader.hide();
                        });
                    });
                }
            },
            {
                text: 'No',
                onClick: function() {

                }
            }]
        });        
    });

    $('#bookings-search').on('click', function() {
        $app.popup('.popup-bookings-search');
    });

    $('#bookings-search-start').on('click', function() {
        var current_tab         = $('#bookings-tab-group a.active').attr('id');
        var booking_keyword     = $('#i-bookings-search-keyword').val();
        var booking_fdate       = $('#i-bookings-search-fdate').val();
        var booking_tdate       = $('#i-bookings-search-tdate').val();

        if(!booking_fdate) {
            $app.alert('You need to select [from] date!', $STRING.info_required_input);
            return false;
        }

        if(!booking_tdate) {
            $app.alert('You need to select [to] date!', $STRING.info_required_input);
            return false;
        }

        switch(current_tab) {
            case 'view-booking-local':
                booking_list_offline(booking_keyword, booking_fdate, booking_tdate, function() {
                    $loader.hide();
                });
                break;
            case 'view-booking-server':
                booking_list_online(booking_keyword, booking_fdate, booking_tdate, function() {
                    $loader.hide();
                });
                break;
        }
    });

    $('#bookings-search-fdate').on('click', function() {
        // destroy calendar, prevent multiple
        $('#calendar-picker').empty();

        // create a new calendar
        $calendar = $app.calendar({
            container: '#calendar-picker',
            weekHeader: false,
            maxDate: get_date(),
            onChange: function (p) {
                if(p.value) {
                    var selected    = date_format(p.value[0], 'yyyy-MM-dd');
                    var str_date_f  = get_date(selected);
                    var str_date_t  = get_date($('#i-bookings-search-tdate').val());
                    var date_f      = string_to_object_date(str_date_f);
                    var date_t      = string_to_object_date(str_date_t);
                    var diff        = get_date_different(str_date_f, str_date_t);

                    if(date_f > date_t) {
                    // reset if date_from are higher
                        $('#i-bookings-search-tdate').val('');
                    } else {
                    // reset if date_from range are more than 31 day from date_to
                        if(diff>=31) {
                            $('#i-bookings-search-tdate').val('');
                        }
                    }
                    $('#i-bookings-search-fdate').val(selected);

                    $app.closeModal('.popup-calendar-picker');
                }
            }
        });

        // show pop up
        $app.popup('.popup-calendar-picker');
    });

    $('#bookings-search-tdate').on('click', function() {
        var min_date    = $('#i-bookings-search-fdate').val();
        var d           = '';

        if(min_date == get_date()) {
            d = new Date();
            d.setDate(d.getDate() - 1);
            min_date = date_format(d, 'yyyy-MM-dd');
        } else {
            d = string_to_object_date(min_date);
            d.setDate(d.getDate() - 1);
            min_date = date_format(d, 'yyyy-MM-dd');
        }

        // destroy calendar, prevent multiple
        $('#calendar-picker').empty();

        // create a new calendar
        $calendar = $app.calendar({
            container: '#calendar-picker',
            weekHeader: false,
            minDate: min_date,
            maxDate: add_days(min_date, 31),
            onChange: function (p) {
                if(p.value) {
                    var selected    = date_format(p.value[0], 'yyyy-MM-dd');
                    $('#i-bookings-search-tdate').val(selected);
                    $app.closeModal('.popup-calendar-picker');
                }
            }
        });

        // show pop up
        $app.popup('.popup-calendar-picker');
    });

    $('#booking-list-device').on('click', 'li', function() {
        var $data = $(this).data('item');
        booking_view($data, true);
    });

    $('#booking-list-server-detail').on('click', 'li', function() {
        var $data = $(this).data('item');
        booking_view($data, false);
        
    });


    /*
    $('#booking-list-summary').on('click', function() {
        //$('#summary-name').text($SETTINGS.user.name);
        //$('#summary-date').text($('#bookings-date-device').text());

        if( $('#booking-list-server').is(':empty') ) {
            $('#summary-list').empty();
            $('#summary-list').append('<tr><td>No transaction</td></tr>');
        }

        $app.popup('.popup-summary');
    });
    */
    $('#tab-view-print').on('click', function() {
        var buttons1 = [
            {
                text: 'Print Detail',
                onClick: function () {
                    var $_data  = [];
                    var $_dom   = $('#booking-list-server-detail [data-print]');

                    $_dom.each(function(i,e) {
                        var $this = $(e);
                        var $data = $this.data('print');

                        $_data = $_data.concat($data);
                    });
                    switch($SETTINGS.print_device) {
                        case 'TPV':
                            // print_TPV.js
                            tpv_printtext($_data,'DETAIL REPORT');                
                            break;
                        default:
                            printer_device_list($_data, 'DETAIL REPORT');
                        break;            
                    }    
                }
            },
            {
                text: 'Print Daily',
                onClick: function () {
                    var $_data  = [];
                    var $_dom   = $('#booking-list-server-daily [data-print]');

                    $_dom.each(function(i,e) {
                        var $this = $(e);
                        var $data = $this.data('print');

                        $_data = $_data.concat($data);
                    });
                    switch($SETTINGS.print_device) {
                        case 'TPV':
                            // print_TPV.js
                            tpv_printtext($_data, 'DAILY REPORT');
                            break;
                        default:
                            printer_device_list($_data, 'DAILY REPORT');
                            break;            
                    }   
                }
            },
            {
                text: 'Print Payment',
                onClick: function () {
                    var $_data  = [];
                    var $_dom   = $('#booking-list-server-payment [data-print]');

                    $_dom.each(function(i,e) {
                        var $this = $(e);
                        var $data = $this.data('print');

                        $_data = $_data.concat($data);
                    });

                    switch($SETTINGS.print_device) {
                        case 'TPV':
                            // print_TPV.js
                            tpv_printtext($_data, 'PAYMENT REPORT');
                            break;
                        default:
                            printer_device_list($_data, 'PAYMENT REPORT');
                            break;            
                    }  
                }
            }
        ];
        var buttons2 = [
            {
                text: 'Close dialog',
                color: 'red',
                onClick: function () {

                }
            },
        ];
        $app.actions([buttons1, buttons2]);
    });
});

function voucher_remark_open(id_transaction, callback) {
    var current_tab         = $('#bookings-tab-group a.active').attr('id');

    switch(current_tab) {
        case 'view-booking-local':
            var ssql = "SELECT * FROM MFExcursionTransactionHeader WHERE idx_transaction = '" + id_transaction + "';";

            sql_data(ssql, function(data) {
                console.log(data);
                callback(data);
            });
            break;
        case 'view-booking-server':
            var module	    = get_core_module();
            var serialize   = '&act=voucher-remark-get'
                serialize  += '&idtr='+id_transaction

                $status.set('LOADING REMARK');

                $.ajax({
                    url: module,
                    data: serialize,
                    dataType: 'json',
                    success: function(result)
                    {
                        console.log(result);
                        callback(result);
                    }
                });
            break;
    }
}

function voucher_remark_update(id_transaction, remark1, remark2, callback) {
    var current_tab         = $('#bookings-tab-group a.active').attr('id');

    switch(current_tab) {
        case 'view-booking-local':
            var ssql  = " UPDATE MFExcursionTransactionHeader SET "
                ssql += "  remark = '"+remark1+"', "
                ssql += "  remark_supplier = '"+remark2+"' "
                ssql += " WHERE idx_transaction = '" + id_transaction + "';";

            sql(ssql, function(data) {
                console.log(data);
                callback(data);
            });
            break;
        case 'view-booking-server':
            var module	    = get_core_module();
            var serialize   = '&act=voucher-remark-update'
                serialize  += '&idtr='+id_transaction
                serialize  += '&remark1='+remark1
                serialize  += '&remark2='+remark2

                $status.set('UPDATING REMARK');

                $.ajax({
                    url: module,
                    data: serialize,
                    dataType: 'json',
                    success: function(result)
                    {
                        console.log(result);
                        callback(result);
                    }
                });
            break;
    }
}

function voucher_connect_apply(data, new_voucher, callback) {
    var module	    = get_core_module();
    var serialize   = '&act=manual-voucher-update'
        serialize  += '&idmf='+data.idx_mfexcursion
        serialize  += '&idtr='+data.idx_transaction
        serialize  += '&ncode='+new_voucher
        serialize  += '&usr='+data.rep

        $status.set('APPLYING VOUCHER');

        $.ajax({
            url: module,
            data: serialize,
            dataType: 'json',
            success: function(result)
            {
                console.log(result);
                callback();
            }
        });
}

function voucher_update(data, callback) {
    var module	    = get_core_module();
    var serialize   = '&act=voucher-update'
        serialize  += '&idmf='+data.idmf
        serialize  += '&title='+data.guest_title
        serialize  += '&fname='+data.guest_fname
        serialize  += '&lname='+data.guest_lname
        serialize  += '&idtr='+data.idtr
        serialize  += '&pidate='+data.pickup_date
        serialize  += '&piarea='+data.pickup_area
        serialize  += '&piroom='+data.pickup_room

    $status.set('UPDATING TRANSACTION');

        $.ajax({
            url: module,
            data: serialize,
            dataType: 'json',
            success: function(result)
            {
                console.log(result);
                callback();
            }
        });
}
function voucher_update_notification(data, callback) {
    var module	    = get_core_mailing();
    var serialize   = '&act=mail-send-update'
        serialize  += '&vn='+data.voucher
        serialize  += '&ex='+data.excursion
        serialize  += '&gn='+data.guest
        serialize  += '&pd='+data.pickup
        serialize  += '&pa='+data.area
        serialize  += '&pr='+data.room
        serialize  += '&to='+data.email

    $status.set('SENDING MAIL');

        $.ajax({
            timeout: 60000, /* 60 sec */
            url: module,
            data: serialize,
            success: function(result)
            {
                console.log(result);
                callback(result);
            }
        });
}

function booking_view(item, unsync) {
    var $data           = item;
    var number          = 0;
    var buffer          = '';

    var tour_date       = $data.pickup.split(' ')[0];
    var guest           = $data.guestname.toUpperCase();
    var pickup_location = $data.hotel.toUpperCase();
    var pickup_time     = $data.pickup.split(' ')[1];
    var meeting_point   = typeof($data.meeting_point) !== 'undefined' ? $data.meeting_point : '-';
    var pax_total       = parseInt($data.paxa)+parseInt($data.paxc)+parseInt($data.paxi);
    var pax_info        = $data.paxa+'A+'+$data.paxc+'C+'+$data.paxi+'I';
    var guest_list      = '';
    var pay_excurpax    = $data.currency+' '+format_currency($data.salesrate, false);
    var pay_disc        = format_currency(parseFloat($data.promo), false); // discount+promo_p
    var pay_surcharges  = "";
    var pay_total       = $data.currency+' '+format_currency($data.totalsales, false);
    var pay_method      = $data.val_payment.split(':').join(' ');
    var status          = '';


    pay_method = pay_method.toUpperCase();
    pay_method = pay_method.replace('PAY ON TOUR', label_pot.toUpperCase());

    // formating payment workaround
    // 2019-04-11
    var arr_payment = pay_method.replace(/:/g, ' ').split(', '); // bersihkan titik dua dan pisah hasil dari group concat
    var tmp_buffer  = '';
    for(var i=0; i<arr_payment.length; i++) {
        var arr_word = arr_payment[i].split(' ');
        for(var j=0; j<arr_word.length; j++) {
            if(!isNaN(parseInt(arr_word[j].substr(0,1)))) { // is number?
                tmp_buffer += format_currency(arr_word[j], false)+' ';
            } else {
                tmp_buffer += arr_word[j]+' ';
            }
        }
        tmp_buffer = tmp_buffer.trim()+', ';
    }
    tmp_buffer  = tmp_buffer.trim();
    tmp_buffer  = tmp_buffer.substr(0, tmp_buffer.length-1);
    pay_method  = tmp_buffer;

    // check for support of namelist column
    if($data.hasOwnProperty('namelist')) {
        guest_list    = $data.namelist;
        guest_list    = guest_list.replace(/\([^\)]*\)/g, '');  // remove age
        guest_list    = guest_list.replace(/<[^>]*>/g, ',');    // remove html tag

        // format namelist
        guest_list    = guest_list.split(',');
        for(var j=0; j<guest_list.length; j++) {
            var name = guest_list[j].trim();

            if(name.length > 4) {
                number++;
                buffer += number+'. '+name.toUpperCase()+'<br>';
            }
        }
        // remove last {br}
        guest_list = buffer.slice(0, - 4);
    }

    // check for surcharge existence (prevent error)
    if($data.surcharge_detail) {
        pay_surcharges  = $data.surcharge_detail.split(', ');
        buffer          = "";
        for(var j=0; j<pay_surcharges.length; j++) {
            var name = pay_surcharges[j].trim();

            if(name.length) {
                buffer += '+ '+name.toUpperCase()+'<br>';
            }
        }
        // remove last {br}
        pay_surcharges = buffer.slice(0, - 4);
    }

    if($data.hasOwnProperty('stat')) {
        switch($data.stat) {
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

    guest_list      = guest_list ? guest_list : '-';
    pay_disc        = pay_disc ? pay_disc : '-';
    pay_surcharges  = pay_surcharges ? pay_surcharges : '-';

    $('#voucher-number').text($data.voucher);
    $('#voucher-bookingdate').text('BOOKED ON '+$data.date_tr);
    $('#voucher-excursion').text($data.excursion_alias);
    $('#voucher-tourdate').text(tour_date);
    $('#voucher-guestname').text(guest);
    $('#voucher-pickup-location').text(pickup_location);
    $('#voucher-pickup-time').text(pickup_time);
    $('#voucher-meeting-point').text(meeting_point);
    $('#voucher-pax').text(pax_total+' PERSON ('+pax_info+')');
    $('#voucher-guestlist').empty();
    $('#voucher-guestlist').append(guest_list);
    $('#voucher-paydetail-excursion').text(pay_excurpax);
    $('#voucher-paydetail-discount').text(pay_disc);
    $('#voucher-paydetail-surcharge').text(pay_surcharges);
    $('#voucher-paytotal').text(pay_total);
    $('#voucher-paymethod').empty().append(pay_method);
    $('#voucher-rep').text($SETTINGS.user.name);
    $('#voucher-agent').text($data.agent);
    $('#voucher-supplier').text($data.supplier);
    $('#voucher-status').text(status);

    $('.popup-voucher .print').data('item', $data);

    // remark button
    $('#voucher-remark').data('item', $data);

    // connect button (custom voucher)
    $('#voucher-connect').data('item', $data);
    $('#voucher-connect').hide();
    $('#voucher-connect-br').hide();

    // edit button
    $('#voucher-edit').data('item', null);
    $('#voucher-edit').hide();
    $('#voucher-edit-br').hide();

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
}

function booking_list_offline(keyword, fdate, tdate, callback) {
    var $table      = $('#booking-list-device');
    var $count      = $('#booking-list-device-count');
    var $count_sync = $('#booking-list-device-sync-count');
    var buffer      = '';
    var n_sync      = 0;

    $('#bookings-toolbar-bottom').hide();
    $('#summary-list').empty();

    if(fdate!=tdate) {
        $('.bookings-date').text(date_format(fdate, 'dd MMM yyyy')+' - '+date_format(tdate, 'dd MMM yyyy'));
    } else {
        $('.bookings-date').text(date_format(fdate, 'dd MMM yyyy'));
    }

    $loader.show();
    ssql_load('LIST_TRANSACTION', 'ALL', function(ssql_data) {
        ssql = ssql_data.script;

        ssql = ssql.replace(/@:search:/g,       keyword);
        ssql = ssql.replace(/@:fromdate:/g,     fdate);
        ssql = ssql.replace(/@:todate:/g,       tdate);
        ssql = ssql.replace(/@:id_language:/g,  $SETTINGS.language.id);
        ssql = ssql.replace(/@:repname:/g,      $SETTINGS.user.name);

        sql_data(ssql, function(data) {
            var $table  = $('#booking-list-device'),
                $count  = $('#booking-list-device-count');
            var buffer  = '';

            $table.empty();
            $count.text('SHOWING '+data.length+' TRANSACTION(S)');

            if(data.length>0) {

                for(var i=0; i<data.length; i++) {
                    var next = data[i+1] ? data[i+1].voucher : undefined;
                    var prev = data[i-1] ? data[i-1].voucher : undefined;

                    buffer += buffer_item_transaction_header(data[i], next, prev);
                }
                $table.append(buffer);

            } else {
                //$table.append('<tr ><td colspan="2" style="padding:10px;">NO DATA</td></tr>');
            }

            callback();
        });
    });
}

function booking_list_online(keyword, fdate, tdate, callback) {

    $loader.show();
    $('#bookings-toolbar-bottom').show();

    var sort_date    = $('#i-bookings-search-sort option:selected').val();

    var module       = get_core_module();
    var serialize    = '&act=bookings-list-v3'
        serialize   += '&fdate='+ fdate
        serialize   += '&tdate='+ tdate;
        serialize   += '&search=' + keyword
        serialize   += '&idr=' + $SETTINGS.user.id
        serialize   += '&idl=' + $SETTINGS.language.id
        serialize   += '&sort=' + sort_date

    if(fdate!=tdate) {
        $('.bookings-date').text(date_format(fdate, 'dd MMM yyyy')+' - '+date_format(tdate, 'dd MMM yyyy'));
    } else {
        $('.bookings-date').text(date_format(fdate, 'dd MMM yyyy'));
    }

    $.ajax({
        url: module,
        data: serialize,
        dataType: 'json',
        success: function(data)
        {
            //var $count  = $('#booking-list-server-count');
            var buffer  = '';

            var representative  = $SETTINGS.user.name;
            var period          = $('#bookings-date-device').text().toUpperCase();
            var base_on         = $('#i-bookings-search-sort option:selected').text().toUpperCase();

            var print_header    =
                ['SEPARATOR',
                 'REPORT',
                 'NEWLINE',
                 '  REP. : '+representative,
                 '  DATE : '+period.split(' - ').join('-'),
                 '  SORT : '+base_on
                ];

            var n_record        = 0;
            var n_pax           = 0;
            var n_amount        = 0;

            var $_day           = []; // array buffer
            var count           = -1; // for indexing purpose

            // clear html
            $('#booking-list-server-detail').empty();
            $('#booking-list-server-daily').empty();
            $('#booking-list-server-payment').empty();

            // all view header
            buffer  = '<table class="auto rounded" style="margin-bottom:10px;">'
            buffer += '<tr data-print=\''+JSON.stringify(print_header)+'\'>'
            buffer += ' <td style="padding-left:15px;" colspan="2"><b>REPORT</b></td>'
            buffer += '</tr>'
            buffer += '<tr >'
            buffer += ' <td style="padding-left:15px; width:100px;" >REP.</td>'
            buffer += ' <td >'+representative+'</td>'
            buffer += '</tr>'
            buffer += '<tr >'
            buffer += ' <td style="padding-left:15px;" >DATE</td>'
            buffer += ' <td >'+period+'</td>'
            buffer += '</tr>'
            buffer += '<tr >'
            buffer += ' <td style="padding-left:15px;" >SORT</td>'
            buffer += ' <td >'+base_on+'</td>'
            buffer += '</tr>'
            buffer += '</table>'

            $('#booking-list-server-detail').append(buffer);
            $('#booking-list-server-daily').append(buffer);
            $('#booking-list-server-payment').append(buffer);

            if(data.length>0) {

                // daily view
                for(var i=0; i<data.length; i++) {
                    var next    = data[i+1] ? data[i+1].date_tr.substr(0,10) : undefined;
                    var prev    = data[i-1] ? data[i-1].date_tr.substr(0,10) : undefined;
                    var current = data[i].date_tr.substr(0,10);
                    var pax     = parseInt(data[i].paxa)+parseInt(data[i].paxc)+parseInt(data[i].paxi);

                    if(sort_date == 'T') {
                        next    = data[i+1] ? data[i+1].pickup.substr(0,10) : undefined;
                        prev    = data[i-1] ? data[i-1].pickup.substr(0,10) : undefined;
                        current = data[i].pickup.substr(0,10);
                    }

                    if(data[i].idx_mfexcursion) {
                        if(prev != current) {
                            $_day.push({
                                date:           current,
                                transaction:    1,
                                pax:            pax,
                                currency:       data[i].currency,
                                amount:         parseFloat(data[i].totalsales)
                            });
                            count++;
                        } else {
                            $_day[count].transaction    += 1;
                            $_day[count].pax            += pax;
                            $_day[count].amount         += parseFloat(data[i].totalsales);
                        }
                    }
                }

                buffer  = '<table class="auto rounded" style="margin-bottom:10px;">'
                buffer += '<tr data-print=\''+JSON.stringify(['SEPARATOR', 'DAILY', 'NEWLINE'])+'\'>'
                buffer += '<td style="padding-left:15px;" colspan="2"><b>DAILY</b></td>'
                buffer += '</tr>'
                for(var i=0; i<$_day.length; i++) {
                    var date    = $_day[i].date;
                    var record  = '  BOOKING : '+$_day[i].transaction;
                    var pax     = '  PAX     : '+$_day[i].pax;
                    var amount  = '  AMOUNT  : '+$_day[i].currency+' '+format_currency($_day[i].amount, false);
                    var print   = ['SEPARATOR', date+', '+$_day[i].transaction+' BOOK, '+$_day[i].pax+' PAX', amount];
                        print   = i!=0 ? print : [date+', '+$_day[i].transaction+' BOOK, '+$_day[i].pax+' PAX', amount];

                    buffer      += '<tr data-print=\''+JSON.stringify(print)+'\'>'
                    buffer      += ' <td style="padding-left:15px;" colspan="2">'
                    buffer      += '       <span style="font-weight:bold;">'+date+'</span>'
                    buffer      += '  <br ><span style="font-size:10px;">'+record+'</span>'
                    buffer      += '  <br ><span style="font-size:10px;">'+pax+'</span>'
                    buffer      += '  <br ><span style="font-size:10px;">'+amount+'</span>'
                    buffer      += ' </td>'
                    buffer      += '</tr>'

                    n_record    += $_day[i].transaction;
                    n_pax       += $_day[i].pax;
                    n_amount    += $_day[i].amount;
                }
                buffer += '</table>';
                $('#booking-list-server-daily').append(buffer);

                // update with currency code
                n_amount = $_day[0].currency+' '+format_currency(n_amount, false);

                // payment view
                buffer  = '<table class="auto rounded" style="margin-bottom:10px;">'
                buffer += '<tr data-print=\''+JSON.stringify(['SEPARATOR', 'PAYMENT', 'NEWLINE'])+'\'>'
                buffer += ' <td style="padding-left:15px;" colspan="2"><b>PAYMENT</b></td>'
                buffer += '</tr>'
                for(var i=0; i<data.length; i++) {
                    if(!data[i].idx_mfexcursion) {
                        var payment_total       = data[i].totalsales;
                        var payment_type        = data[i].val_payment.toUpperCase();
                        var payment_value       = data[i].currency+' '+format_currency(payment_total, false);
                        var print_body          = '';

                        switch(payment_type) {
                            case 'CREDIT CARD':
                                print_body = ['  '+'CC   : '+data[i].currency+' '+format_currency(payment_total, false)];
                                break;
                            case 'PAY ON TOUR':
                                print_body = ['  '+'POT  : '+data[i].currency+' '+format_currency(payment_total, false)];
                                break;
                            default:
                                print_body = ['  '+payment_type+' : '+data[i].currency+' '+format_currency(payment_total, false)];
                        }

                        buffer += '<tr data-print=\''+JSON.stringify(print_body)+'\'>'
                        buffer += '<td style="padding-left:15px; width:100px;" >'+payment_type+'</td>'
                        buffer += '<td >'+payment_value+'</td>'
                        buffer += '</tr>'
                    }
                }
                buffer += '</table>'
                $('#booking-list-server-payment').append(buffer);

                // detail view
                buffer  = '<br>';
                for(var i=0; i<data.length; i++) {
                    var next = data[i+1] ? data[i+1].voucher : undefined;
                    var prev = data[i-1] ? data[i-1].voucher : undefined;

                    buffer      += buffer_item_transaction_header(data[i], next, prev);
                }
                $('#booking-list-server-detail').append(buffer);

                // showing record count
                //$count.text('SHOWING '+n_record+' TRANSACTION(S)');

            }

            // all view footer
            var print_footer =
                ['SEPARATOR',
                 'TOTAL',
                 'NEWLINE',
                 '  BOOKING : '+n_record,
                 '  PAX     : '+n_pax,
                 '  AMOUNT  : '+n_amount
                ];

            buffer  = '<table class="auto rounded" style="margin-bottom:10px;">'
            buffer += '<tr data-print=\''+JSON.stringify(print_footer)+'\'>'
            buffer += ' <td style="padding-left:15px;" colspan="2"><b>TOTAL</b></td>'
            buffer += '</tr>'
            buffer += '<tr >'
            buffer += ' <td style="padding-left:15px; width:100px;" >BOOKING</td>'
            buffer += ' <td >'+n_record+'</td>'
            buffer += '</tr>'
            buffer += '<tr >'
            buffer += ' <td style="padding-left:15px;" >PAX</td>'
            buffer += ' <td >'+n_pax+'</td>'
            buffer += '</tr>'
            buffer += '<tr >'
            buffer += ' <td style="padding-left:15px;" >AMOUNT</td>'
            buffer += ' <td >'+n_amount+'</td>'
            buffer += '</tr>'
            buffer += '</table>'

            $('#booking-list-server-detail').append(buffer);
            $('#booking-list-server-daily').append(buffer);
            $('#booking-list-server-payment').append(buffer);

            callback();
        }
    });    
}