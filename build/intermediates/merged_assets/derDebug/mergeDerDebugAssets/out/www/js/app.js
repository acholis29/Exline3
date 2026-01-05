var div_search_location = '#autocomplete-standalone-location';
var div_search_excursion = '#autocomplete-standalone-excursion';
var div_search_agent = '#autocomplete-standalone-agent';
var div_search_hotel = '#autocomplete-standalone-hotel';

var $location, $excursion, $agent, $hotel_area;
var $tour_calendar;

var RESET = {
    input_location: function () {
        $location.value = [];
        $(div_search_location).find('input[type=text]').val('');
    },
    input_excursion: function () {
        $excursion.value = [];
        $(div_search_excursion).find('input[type=text]').val('');
    },
    input_agent: function () {
        $agent.value = [];
        $(div_search_agent).find('input[type=text]').val('');
    },
    input_hotel_area: function () {
        $hotel_area.value = [];
        $(div_search_hotel).find('input[type=text]').val('');
    },
    input_pickup_time: function () {
        $('#i-pickuptime').val('');
    },
    input_room: function () {
        $('#i-room').val('');
    },
    input_tour_date: function () {
        $('#i-allotment-calendar').val('');

        // dont forget to destroy
        if ($tour_calendar) {
            $tour_calendar.destroy();
        }
    },
    input_pax: function () {
        // later
    }
}

$(document).ready(function () {

    $loader.show();
    document.addEventListener("deviceready", function () {

        // initialize basic information
        $('#about-info-app-version').text(AppVersion.version);
        $('#about-info-app-build').text(AppVersion.build);
        $('#about-info-model').text(device.model);
        $('#about-info-platform').text(device.platform);
        $('#about-info-uuid').text(device.uuid);
        $('#about-info-version').text(device.version);
        $('#about-info-manufacturer').text(device.manufacturer);
        $('#about-info-serial').text(device.serial);

        $('#a-setting-deviceITOS').hide();
        $('#menu-itosdevice').hide();

        //---- Checking Device ITOS
        switch (device.manufacturer) {
            case 'ITOS':
                $('#a-setting-deviceITOS').show();
                $('#menu-itosdevice').show();
                $('#settings-tpv-device').val('true');

                break;
            default:
                $('#settings-tpv-device').val('false')
                $('#a-setting-deviceITOS').hide();
                $('#menu-itosdevice').hide();
                $('#settings-print-device').val('BT')
                break;
        }

        // initialize
        DB_FILE = "db_excursion.db";

        //db_remove(DB_FILE, function() {
        db_initialize(DB_FILE,
            function () {

                ssql_prepare(function () {
                    // load config data
                    initialize_settings(function () {
                        // default state is OFFLINE!
                        //var is_online = false;
                        var is_online = true;

                        // run [initialize_variable] before [review_unfinished_transaction]
                        // to prepare fallback if internet connection disconnected!
                        initialize_variable(is_online, function () {
                            if (is_online) {
                                initialize_loroparque(is_online, function (e) {
                                    console.log(e);
                                    review_unfinished_transaction({
                                        session_continue: function (data) {
                                            //initialize!
                                        },
                                        session_reset: function () {
                                            // reset
                                            reset_transaction(is_online, function () {
                                                $loader.hide();
                                                check_for_sync_master();
                                            });
                                        }
                                    });
                                });
                            } else {
                                review_unfinished_transaction({
                                    session_continue: function (data) {
                                        //initialize!
                                    },
                                    session_reset: function () {
                                        // reset
                                        reset_transaction(is_online, function () {
                                            $loader.hide();
                                            check_for_sync_master();
                                        });
                                    }
                                });
                            }
                        });
                    });
                });

            },
            function () {
                $app.alert('Failed to initialize database!', $STRING.info_warning);
            });
        //});

    }, false);


    // non event only ------------------------------------- !!

    $.ajaxSetup({
        method: 'POST',
        beforeSend: function (x, y) {
            var complete_url = '';
            if (y.data !== undefined) {
                complete_url = y.url + y.data;
            } else {
                complete_url = y.url;
            };
            //var complete_url = y.url+y.data;


            x.url = complete_url;
            //console.log(complete_url);
        },
        error: ajax_error,
        timeout: 15000 // 15 second is safe
    });


    $('body').on('click', '#payment-pay-load', function () {
        $loader.show();
    });

    $location = $app.autocomplete({
        openIn: 'page',
        opener: $(div_search_location),
        autoFocus: true,
        backOnSelect: true,
        searchbarPlaceholderText: "Type 3 characters to search..",
        valueProperty: 'idx_state',
        textProperty: 'state',
        preloader: true,
        source: function (autocomplete, query, render) {
            var results = [];

            if (query.length === 0) {
                render(results);
                return;
            }
            if (query.length < 3) {
                return;
            }
            if ($MODE == "online") {
                var module = get_core_module();
                var serialize = '&act=form-search-location'
                serialize += '&search=' + encodeURIComponent(query);

                autocomplete.showPreloader();
                $.ajax({
                    url: module,
                    data: serialize,
                    dataType: 'json',
                    success: function (data) {
                        autocomplete.hidePreloader();
                        render(arr_props_to_lower(data));
                    }
                });
            } else {
                ssql_load('LIST_LOCATION', 'ALL', function (ssql_data) {
                    ssql = ssql_data.script;

                    ssql = ssql.replace(/@:search:/g, query);

                    sql_data(ssql, function (data) {
                        render(data);
                    });
                });
            }
        },
        onOpen: function (autocomplete) {

        },
        onChange: function (autocomplete, data) {
            $(div_search_location).find('input[type=text]').val(data[0].state.toUpperCase());
            $(div_search_location).find('input[type=hidden]').val(data[0].idx_state);
        }
    });

    /* WARNING! Unique ID for excursion is id_excursion+id_sub */
    $excursion = $app.autocomplete({
        openIn: 'page',
        opener: $(div_search_excursion),
        autoFocus: true,
        backOnSelect: true,
        searchbarPlaceholderText: "Type 3 characters to search..",
        valueProperty: 'idx_excursion_and_sub',
        textProperty: 'excursion',
        preloader: true,
        source: function (autocomplete, query, render) {
            var input_location = $location.value.length != 0 ? $location.value[0].idx_state : '';
            var results = [];

            if (query.length === 0) {
                render(results);
                return;
            }
            if (query.length < 3) {
                return;
            }
            if ($MODE == "online") {

                var module = get_core_module();
                var serialize = '&act=form-search-excursion'
                serialize += '&search=' + encodeURIComponent(query)
                serialize += '&idr=' + $SETTINGS.user.id
                serialize += '&ids=' + input_location
                serialize += '&idl=' + $SETTINGS.language.id

                autocomplete.showPreloader();
                $.ajax({
                    url: module,
                    data: serialize,
                    dataType: 'json',
                    success: function (data) {
                        autocomplete.hidePreloader();
                        render(arr_props_to_lower(data));
                    }
                });

            } else {
                ssql_load('LIST_EXCURSION', 'ALL', function (ssql_data) {
                    ssql = ssql_data.script;

                    ssql = ssql.replace(/@:id_user:/g, $SETTINGS.user.id);
                    ssql = ssql.replace(/@:id_market:/g, $SETTINGS.market.id);
                    ssql = ssql.replace(/@:id_language:/g, '');
                    ssql = ssql.replace(/@:id_state:/g, input_location);
                    ssql = ssql.replace(/@:search:/g, query);

                    sql_data(ssql, function (data) {
                        render(data);
                    });
                });
            }
        },
        onOpen: function (autocomplete) {

        },
        onChange: function (autocomplete, data) {
            $('#i-allotment-calendar').val('');
            $(div_search_excursion).find('input[type=text]').val(data[0].excursion.toUpperCase());
            $(div_search_excursion).find('input[type=hidden]').val(data[0].idx_excursion);
            $(div_search_excursion).data('select', data[0]);

            if ($hotel_area.value.length != 0) {
                get_pickuptime();
            }


        }
    });

    $agent = $app.autocomplete({
        openIn: 'page',
        opener: $(div_search_agent),
        autoFocus: true,
        backOnSelect: true,
        searchbarPlaceholderText: "Type 3 characters to search..",
        valueProperty: 'idx_agent',
        textProperty: 'agent',
        preloader: true,
        source: function (autocomplete, query, render) {
            var results = [];

            if (query.length === 0) {
                render(results);
                return;
            }
            if (query.length < 3) {
                return;
            }
            if ($MODE == "online") {

                var module = get_core_module();
                var serialize = '&act=form-search-agent'
                serialize += '&search=' + encodeURIComponent(query)
                serialize += '&idr=' + $SETTINGS.user.id

                autocomplete.showPreloader();
                $.ajax({
                    url: module,
                    data: serialize,
                    dataType: 'json',
                    success: function (data) {
                        autocomplete.hidePreloader();
                        render(arr_props_to_lower(data));
                    }
                });

            } else {
                ssql_load('LIST_AGENT', 'ALL', function (ssql_data) {
                    ssql = ssql_data.script;

                    ssql = ssql.replace(/@:id_user:/g, $SETTINGS.user.id);
                    ssql = ssql.replace(/@:search:/g, query);

                    sql_data(ssql, function (data) {
                        render(data);
                    });
                });
            }
        },
        onOpen: function (autocomplete) {

        },
        onChange: function (autocomplete, data) {
            $('#i-allotment-calendar').val('');
            $(div_search_agent).find('input[type=text]').val(data[0].agent.toUpperCase());
            $(div_search_agent).find('input[type=hidden]').val(data[0].idx_agent);
        }
    });

    $('#input-agent').on('click', function () {
        if ($(div_search_agent).hasClass('disabled')) {
            $app.alert('You can\'t change agent while you already have make one booking!', $STRING.info_information);
        }
    });

    $hotel_area = $app.autocomplete({
        openIn: 'page',
        opener: $(div_search_hotel),
        autoFocus: true,
        backOnSelect: true,
        searchbarPlaceholderText: "Type 3 characters to search..",
        valueProperty: 'idx_hotel',
        textProperty: 'hotel',
        preloader: true,
        source: function (autocomplete, query, render) {
            var results = [];

            if (query.length === 0) {
                render(results);
                return;
            }
            if (query.length < 3) {
                return;
            }
            if ($MODE == "online") {

                var module = get_core_module();
                var serialize = '&act=form-search-hotel'
                serialize += '&search=' + encodeURIComponent(query)
                serialize += '&idr=' + $SETTINGS.user.id

                autocomplete.showPreloader();
                $.ajax({
                    url: module,
                    data: serialize,
                    dataType: 'json',
                    success: function (data) {
                        autocomplete.hidePreloader();
                        render(arr_props_to_lower(data));
                    }
                });

            } else {
                ssql_load('LIST_HOTEL', 'ALL', function (ssql_data) {
                    ssql = ssql_data.script;

                    ssql = ssql.replace(/@:search:/g, query);

                    sql_data(ssql, function (data) {
                        render(data);
                    });
                });
            }
        },
        onOpen: function (autocomplete) {

        },
        onChange: function (autocomplete, data) {
            $(div_search_hotel).find('input[type=text]').val(data[0].hotel.toUpperCase());
            $(div_search_hotel).find('input[type=hidden]').val(data[0].idx_hotel);

            if ($excursion.value.length != 0) {
                get_pickuptime();
            }
        }
    });

    $('#i-pickuptime').mask('00:00');
    $('#i-pickuptime').on('change', function () {
        var $this = $(this);
        try {

            if (!time_format($this.val())) {
                $app.alert('Invalid pickup time!', 'Input Required', function () {
                    $this.val('');
                });
            }

        } catch (e) {
            $app.alert('ERROR: ' + e, 'Input Required');
        }
    });

    $('#i-allotment-calendar').on('click', function () {
        if ($excursion.value.length == 0) {
            $app.alert('Excursion is not selected!', 'Input Required', function () {
                $excursion.open();
            });
            return false;
        }

        allotment_list(function () {
            $loader.hide();
        }, true);
    });

    $('#i-allotment-calendar').on('change', function () {
        var $this = "";
        $('#i-allotment-calendar').data('rsvid', '');
        $loader.show();
        //console.log($SETTINGS.lp_status)
        //----- tentukan rsvid unt loroparqu
        if ($SETTINGS.lp_status == 'true') {

            $this = $(this);

            if ($return_HIBDisponible.DatosResult !== null && $return_HIBDisponible.DatosResult !== undefined) {
                for (ii in $(this).data('allotment')) {
                    if ($(this).data('allotment')[ii].src == 'LP') {

                        $SETTINGS.lp_data = $(this).data('allotment')[ii].src
                        var tgltmpl = new Date($(this).data('allotment')[ii].date);
                        var tgltmp = date_format(tgltmpl, 'yyyy-MM-dd');
                        var tglselect = $(this).val();
                        //console.log(tglselect, tgltmp)

                        if (tglselect == tgltmp) {
                            var c = JSON.parse($(this).data('allotment')[ii].idx_allotment);
                            console.log(c)

                            $(this).data('rsvid', c.RecintosSesionId);

                            $SETTINGS.loroparque.RecintosSesionId = c.RecintosSesionId;
                            $SETTINGS.loroparque.HoraInicio = c.HoraInicio;
                            $SETTINGS.loroparque.Fecha = $(this).data('allotment')[ii].date;
                            $paramdispo.Fecha = $(this).data('allotment')[ii].date;
                        };
                    } else {
                        $SETTINGS.lp_data = 'false';
                    }

                };
            };
        };

        list_maxpax(function () {
            $loader.hide();
        });

    });

    $('#view-price-detail').on('click', function () {
        var $calendar = $('#i-allotment-calendar');
        var $time = $('#i-pickuptime');
        var $room = $('#i-room');

        if ($excursion.value.length == 0) {
            $app.alert('Excursion is not selected!', 'Input Required', function () {
                $excursion.open();
            });
            return false;
        }

        if ($agent.value.length == 0) {
            $app.alert('Agent is not selected!', 'Input Required', function () {
                $agent.open();
            });
            return false;
        }

        if ($hotel_area.value.length == 0) {
            $app.alert('Hotel area is not selected!', 'Input Required', function () {
                $hotel_area.open();
            });
            return false;
        }

        if (!time_format($time.val())) {

            $app.alert('Time pickup is not set!', 'Input Required', function () {
                $time.focus();
            });
            return false;

        }

        if ($room.val().trim() == '') {

            $app.alert('Room number is not set!', 'Input Required', function () {
                $room.focus();
            });
            return false;

        }

        if ($calendar.val() == '') {
            $app.alert('Tour date is not selected!', 'Input Required', function () {
                $calendar.trigger('click');
            });
            return false;
        }

        var pupp = get_pupp();
        if (pupp == '') {
            $app.alert('PUPP for this product is unknown!', $STRING.info_incorrect_data);
            return false;
        }

        if ($('#div-booking-pax .pax').length == 0) {
            $app.alert('Pax setup is not available!', $STRING.info_incorrect_data);
            return false;
        }

        //preparing date (dd MM yyyy)
        var d = new Date($tour_calendar.value[0]),
            year = d.getFullYear(),
            month = d.getMonth(),
            day = d.getDate();
        date = '';

        day = day < 10 ? '0' + day : day;
        date = day + ' ' + monthNames[month] + ' ' + year;

        $('#detail-agent').text($agent.value[0].agent);
        $('#detail-product').text($excursion.value[0].excursion);
        $('#detail-hotel').text($hotel_area.value[0].hotel + ($room.val() ? ' / ' + $room.val() : ''));
        $('#detail-date').text('ON ' + date + ' ' + $time.val());
        $('#detail-pupp').text(pupp);

        $loader.show();
        show_price_item(function () {
            // set ui
            if ($('#detail-price-pax tr').length > 0) {
                $('#detail-pax').show();

                //$('#detail-remark').show();
                $('#detail-button').show();
            }
            if ($('#detail-price-surcharge tr').length > 0) {
                $('#detail-surcharge').show();
            }

            var tmp_price = get_total_price_detail(true).split(' ');
            tmp_price = format_currency(tmp_price[0], false) + ' ' + tmp_price[1];
            $('#detail-total-price').text(tmp_price);
            // open page
            $main_view.router.loadPage('#price-detail');
            $loader.hide();
        });

    });

    $('#add_to_cart').on('click', function () {

        SESSION.transaction_id = $.uuid();
        SESSION.transaction_date = get_date();

        /* setup variable for parameter loroparque */
        if ($SETTINGS.lp_status == 'true') {
            $paramReservaAforo.ConexionIacpos = $SETTINGS.loroparque.general.ConexionIacpos;
            $paramReservaAforo.clienteAPI = $SETTINGS.loroparque.clienteAPI;
            $paramReservaAforo.IdentificadorUnico = $SETTINGS.loroparque.clienteAPI.Id;
            $paramReservaAforo.Sesion = $SETTINGS.loroparque.RecintosSesionId;
            $paramReservaAforo.Cantidad = $SETTINGS.loroparque.Cantidad;
        }


        if ($MODE == 'online') {
            $loader.show();

            //----- proses cek to loroparque
            if ($SETTINGS.lp_status == 'true') {
                if ($return_HIBDisponible.DatosResult !== null) {
                    if ($SETTINGS.lp_data == 'LP') {
                        $lp.ReservaAforo($paramReservaAforo, function (r) {
                            console.log(r)
                            //--- batasi looping cuman 1 kali
                            if (r == 1) {
                                cart_item_insert_online(function () {
                                    cart_insert_after();
                                    $loader.hide();
                                });
                            };
                        });
                    } else {
                        cart_item_insert_online(function () {
                            cart_insert_after();
                            $loader.hide();
                        });
                    }

                } else {
                    cart_item_insert_online(function () {
                        cart_insert_after();
                        $loader.hide();
                    });
                }

            } else {
                cart_item_insert_online(function () {
                    cart_insert_after();
                    $loader.hide();
                });
            }



        } else {
            cart_item_insert_header(SESSION.transaction_date, function () {
                cart_item_insert_all(SESSION.transaction_date, get_price_info(), function () {
                    cart_insert_after();
                })
            });
        }
    });

    $('#detail-price-surcharge').on('change', 'input[type=checkbox]', function () {
        var tmp_price = get_total_price_detail(true).split(' ');
        tmp_price = format_currency(tmp_price[0], false) + ' ' + tmp_price[1];
        $('#detail-total-price').text(tmp_price);
    });

    $('#show-remark').on('click', function () {
        $('#detail-remark-fields').show();
    });

    $('#pay-input').on('keypress', 'input[type=number]', function (e) {
        if ((e.which != 46 || $(this).val().indexOf('.') != -1)
            && (e.which < 48 || e.which > 57)) {
            e.preventDefault();
        }
    }).on('paste', function (e) {
        e.preventDefault();
    });

    $('#pay-input').on('change', 'input[type=checkbox], input[type=number]', function (e) {
        var $target = $(this);
        var $parent = $target.parents('.root');
        var $checkbox = $parent.find('input[type=checkbox]');
        var $number = $parent.find('input[type=number]');
        var currency_type = $parent.data('type');
        var value = 0;

        var pay_method = $('#checkout-paymethod').find(':selected').val();

        // if input target is number (NOT CHECKBOX)
        if ($target.is(':checkbox')) {
            console.log('> input auto');
            if ($checkbox.is(':checked')) {
                $number.addClass('focus-text');

                // if NOT combinable payment and target is credit card
                if ((pay_method == 'cp' && currency_type != 'credit_card')
                    || (pay_method != 'cp' && currency_type != 'credit_card')
                    || (pay_method == 'cc')) {
                    $number.prop('disabled', false);
                }
            } else {
                $number.removeClass('focus-text');
                $number.prop('disabled', true);
                reset_input_field(this);
            }
        } else {
            console.log('> input manually');
            value = parseFloat($target.val()); // required to prevent invalid sign, ie: -0 will parse to 0
            value = isNaN(value) ? 0 : value;
            value = value > 0 ? value.toFixed(2) : 0;
            $target.val(value);
        }

        // special rules for companies that use manual payment calculations by rep
        // if payment value is 0, then ignore validation
        if (!string_to_boolean($SETTINGS.payment_manual)) {
            calc_multiple_currency(this);
        }
    });

    $('#cart-items').on('click', '.remove', cart_item_remove_confirm);
    $('#cart-nav').on('click', cart_open);

    $('.checkout-nav').on('click', function () {
        //var default_pay_method = string_to_boolean($SETTINGS.payment_combinable) ? 'cp' : 'ca';
        var default_pay_method = $SETTINGS.payment_default;
        $('#checkout-paymethod').val(default_pay_method);

        payment_method_initialize(function () {
            payment_initialize(default_pay_method, function () {
                // create name list form
                guest_form_generate(function () {
                    $main_view.router.loadPage('#payment');
                });
            });
        });
    });

    $('#checkout-guest-list').on('click', function () {
        var firstname = $('#checkout-firstname').val();
        var lastname = $('#checkout-lastname').val();

        if (firstname && lastname) {
            $main_view.router.loadPage('#guest-details');
        } else {
            $app.alert('Full name required!', $STRING.info_required_input);
        }
    });

    $('#promotion-nav').on('click', function () {
        var buttons1 = [
            {
                text: 'Apply code',
                onClick: function () {
                    // form reset
                    $('#promotion-search').val('');
                    $('#promotion-info').empty();
                    $('#promotion-info').append('Type a <b>code</b> or registered <b>guest name</b>!');
                    $('#promotion-list').empty();
                    // form show
                    $main_view.router.loadPage('#promotion');
                }
            },
            {
                text: 'Cancel all applied code',
                onClick: function () {

                    // ask user for action
                    $app.modal({
                        title: $STRING.info_confirmation,
                        text: $STRING.cart_remove_promotion,
                        buttons: [
                            {
                                text: 'Yes',
                                bold: true,
                                onClick: function () {

                                    var is_online = $MODE == 'online' ? true : false;

                                    $loader.show();
                                    cart_item_remove_voucher(function () {
                                        cart_item_remove_promotion('', function () {
                                            cart_item_list(is_online, function () {
                                                $loader.hide();
                                            });
                                        });
                                    });

                                }
                            },
                            {
                                text: 'No',
                                onClick: function () {

                                }
                            }
                        ]
                    });

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

    $('#promotion-search').on('keyup paste', function (e) {
        var $this = $(this);
        var value = $this.val();

        cart_promotion_search(value);
    });

    $('#promotion-list').on('click', '.apply', function () {
        var $this = $(this);
        var $root = $this.parents('.item-content');
        var $item = $root.data('item');

        console.log('apply button')
        console.log($root)
        console.log($item)

        cart_promotion_dialog(
            false,
            $root.data('type'),  /* offline|online */
            $root.data('code'),  /* P-XXX (example) */
            $root.data('value'), /* 10.0  (example) */
            $item.promo_valprec, /* optional P|V (percent or value) */
            $item.idx_promotion
        );
    });

    $('#promotion-submit').on('click', function () {
        var is_online = $MODE == 'online' ? true : false;
        var selected = cart_list_find_checked();

        if (selected.length) {
            $loader.show();
            cart_promotion_apply(selected, function () {
                cart_item_list(is_online, function () {
                    if ($main_view.activePage.name == 'promotion') {
                        $main_view.router.back();
                    }
                    $loader.hide();
                });
            });
        } else {
            $app.alert('No product to applied!', $STRING.info_information);
        }
    });

    $('#checkout-finish').on('click', function () {
        var $firstname = $('#checkout-firstname');
        var $lastname = $('#checkout-lastname');
        var $email = $('#checkout-email');
        var pay_input = get_pay_value();

        if ($firstname.val() == '') {
            $app.alert('First name is empty!',
                $STRING.info_required_input, function () {
                    $firstname.focus();
                });
            return false;
        }

        if ($lastname.val() == '') {
            $app.alert('Last name is empty!',
                $STRING.info_required_input, function () {
                    $lastname.focus();
                });
            return false;
        }

        if ($email.val().length) {
            // if email not empty
            if (!is_valid_email($email.val())) {
                $app.alert('You have entered an invalid email address!',
                    $STRING.info_required_input, function () {
                        $email.val('');
                        $email.focus();
                    });
                return false;
            }
        }

        if (get_pay_array().length == 0) {
            $app.alert($STRING.currency_value_empty,
                $STRING.info_warning, function () {
                    // do nothing
                });
            return false;
        }

        if (get_pay_value() < 0 || isNaN(pay_input)) {
            $app.alert($STRING.currency_value_invalid,
                $STRING.info_warning, function () {
                    // do nothing
                });
            return false;
        }



        // special rules for companies that use manual payment calculations by rep
        // if payment value is 0, then ignore validation
        if (!string_to_boolean($SETTINGS.payment_manual)) {
            get_cash_minus(SESSION.transaction_payment, get_pay_array(), function (val_to_convert) {
                console.log('val_to_convert: ' + val_to_convert);

                // dont parse [val_to_convert] to prevent false validation
                // ie 0.15 will parsed to 0 (dont do this)
                if (val_to_convert != 0) {
                    $app.alert("Amount of payment isn't match with total payment!",
                        $STRING.info_required_input, function () { });
                } else {
                    if ($('#checkout-paymethod').val() === 'cc' || $('#checkout-paymethod').val() === 'cp') {
                        if ($SETTINGS.tpv_device == 'true') {
                            $itos_payment.init(function (r) {
                                if (r.resultCode === 1000) {
                                    amountcc = parseFloat(SESSION.transaction_payment)
                                    $itos_payment.payment(SESSION.transaction_number_last, amountcc, function (rr) {
                                        if (rr.resultCode === 0) {
                                            //print bill for CC
                                            $loader.hide();
                                            tpv_printbillcc(rr, 'BILL PAYMENT', function (r) {
                                                $loader.show();
                                                init_payment();
                                            })
                                        }
                                    });
                                };
                            });
                        } else {
                            init_payment();

                        }
                    } else {
                        init_payment();
                    }

                }
            });
        } else {
            // save without validation
            /*
            if ($SETTINGS.lp_status == 'true') {
                $lp.Insercion(function () {
                    checkout_save(function () {
                        checkout_after();
                    });
                })
            } else {
                checkout_save(function () {
                    checkout_after();
                });

            }
            */
            if ($('#checkout-paymethod').val() === 'cc' || $('#checkout-paymethod').val() === 'cp') {
                if ($SETTINGS.tpv_device == 'true') {
                    $itos_payment.init(function (r) {
                        if (r.resultCode === 1000) {
                            amountcc = parseFloat(SESSION.transaction_payment)
                            $itos_payment.payment(SESSION.transaction_number_last, amountcc, function (rr) {
                                if (rr.resultCode === 0) {
                                    //print bill for CC
                                    $loader.hide();
                                    tpv_printbillcc(rr, 'BILL PAYMENT', function (r) {
                                        $loader.show();
                                        init_payment();
                                    })
                                }
                            });
                        };
                    });
                } else {
                    init_payment();

                }
            } else {
                init_payment();
            }

        };



    });


    $('#app-mode').on('click', function (e) {
        e.preventDefault();

        var $checkbox = $('#switch-mode');
        var is_online = true; // temp value

        if (!$checkbox.is(':checked')) {
            is_online = true;   // go online
        } else {
            is_online = false;  // go offline 
        }

        // ask user for action
        $app.modal({
            title: $STRING.info_confirmation,
            text: $STRING.mode_switch,
            buttons: [
                {
                    text: 'Switch',
                    bold: true,
                    onClick: function () {
                        checkout_reset(is_online, function () {
                            if (is_online) {
                                $MODE = 'online';
                                $app.alert('You are now connected to server by using <b>' + get_connection_status() + '</b>!', 'Online');
                                navigator.vibrate(500);
                            } else {
                                $MODE = 'offline';
                                $app.alert('You are disconnected from server!', 'Offline');
                            }

                            $('#lbl-nav-info-mode').text($MODE.toUpperCase());
                            $checkbox.prop('checked', is_online);
                        });
                    }
                },
                {
                    text: 'Cancel',
                    onClick: function () {

                    }
                }]
        });
    });

    $('#div-booking-pax').on('change', 'input[type="text"]', function () {
        var $this = $(this);

        switch ($this.prop('id')) {
            case 'i-booking-pax-adult':
                //alert('You have reach maximum pax for PU item!');
                break;
            case 'i-booking-pax-child':
                i_booking_pax_add_child('child', $this.val(), function () {
                    $('.age.input-stepper.child').inputStepper();
                    //alert('You have reach maximum pax for PU item!');
                });
                break;
            case 'i-booking-pax-infant':
                i_booking_pax_add_child('infant', $this.val(), function () {
                    $('.age.input-stepper.infant').inputStepper();
                    //alert('You have reach maximum pax for PU item!');
                });
                break;
            default:
        }
    });

    $('#checkout-paymethod').on('change', function () {

        var $this = $(this);
        var $selected = $('#checkout-paymethod').find(':selected');
        var value = $selected.val();

        payment_initialize(value, function () {
            $('#checkout-paygate').addClass('hidden');
            $('#checkout-finish').addClass('hidden');

            if ($selected.data('item')) {
                $('#checkout-paygate').removeClass('hidden');
            } else {
                $('#checkout-finish').removeClass('hidden');
            }
        });

    });

    $('#checkout-paygate').on('click', function () {
        var $selected = $('#checkout-paymethod').find(':selected');
        var $data = $selected.data('item')[0];

        var $firstname = $('#checkout-firstname');
        var $lastname = $('#checkout-lastname');
        var $email = $('#checkout-email');
        var $phone = $('#checkout-phone');

        var guest = $firstname.val() + ' ' + $lastname.val();
        var email = $email.val();
        var phone = $phone.val();
        var amount = get_pay_value();

        var domain = "online.govacation.biz"; //remove_end_slash(remove_http($SETTINGS.server));
        var via = "exline";
        var status = string_to_boolean($data.dev_status) ? "demo" : ""; // change this to "demo" for testing purpose

        if ($firstname.val() == '') {
            $app.alert('First name is empty!',
                $STRING.info_required_input, function () {
                    $firstname.focus();
                });
            return false;
        }

        if ($lastname.val() == '') {
            $app.alert('Last name is empty!',
                $STRING.info_required_input, function () {
                    $lastname.focus();
                });
            return false;
        }

        if ($email.val() == '') {
            $app.alert('Email is empty!',
                $STRING.info_required_input, function () {
                    $email.focus();
                });
            return false;
        } else {
            // if email not empty
            if (!is_valid_email($email.val())) {
                $app.alert('You have entered an invalid email address!',
                    $STRING.info_required_input, function () {
                        $email.val('');
                        $email.focus();
                    });
                return false;
            }
        }

        $main_view.router.load({
            url: 'payment_gate.html',
            query: {
                voucher: SESSION.transaction_number,
                guest: guest,
                email: email,
                phone: phone,
                amount: amount,
                domain: domain,
                via: via,
                status: status,
                raw: encodeURIComponent(JSON.stringify($data))
            }
        });
    });

    initialize();
});

function init_payment() {
    if ($SETTINGS.lp_status == 'true') {
        $lp.Insercion(function () {
            checkout_save(function () {
                checkout_after();
            });
        })
    } else {
        checkout_save(function () {
            checkout_after();
        });

    }
}

function translate_payment_code(paycode) {
    switch (paycode) {
        case 'CA':
            return 'CASH';
        case 'CC':
            return 'CREDIT CARD';
        case 'POT':
            return 'PAY ON TOUR';
        default:
            return paycode;
    }
}

function payment_method_initialize(callback) {
    var $container = $('#checkout-paymethod');
    var buffer = '';

    if (string_to_boolean($SETTINGS.payment_combinable)) {
        buffer += '<option value="cp" ' + ($SETTINGS.payment_default == "cp" ? "selected" : "") + '>Combinable Payment</option>';
    }

    buffer += '<option value="ca" ' + ($SETTINGS.payment_default == "ca" ? "selected" : "") + '>Pay with Cash</option>';
    buffer += '<option value="cc" ' + ($SETTINGS.payment_default == "cc" ? "selected" : "") + '>Pay with Credit Card</option>';
    buffer += '<option value="pot" ' + ($SETTINGS.payment_default == "pot" ? "selected" : "") + '>' + label_pot + '</option>';

    if ($MODE == "online") {
        paygate_list_option(function (item) {
            console.log(item)
            buffer += item;

            $container.empty();
            $container.append(buffer);
            callback();
        });
    } else {
        $container.empty();
        $container.append(buffer);
        callback();
    }
}

function payment_initialize(paycode, callback) {

    $loader.show();
    rates_list(function () {
        console.log(paycode)
        list_currency_input(paycode);
        $loader.hide();
        callback();
    })

}

function guest_form_get() {
    var buffer = [];
    $('#guest-list .guest').each(function (i, e) {
        var $guest = $(e);
        var id_transaction = $guest.data('id');
        var guest_title = $guest.find('.guest-title').find(':selected').val();
        var guest_fullname = $guest.find('.guest-fullname').val();

        buffer.push({
            id_transaction: id_transaction,
            guest_title: guest_title,
            guest_fullname: guest_fullname,
            guest_age: 0
        });
    });
    return buffer;
}

function guest_form_generate(callback) {
    var buffer = '';


    $('#cart-items li').each(function (i, e) {
        var $root = $(e);
        var $data = $root.data('item');
        var total = parseInt($data.adult) + parseInt($data.child) + parseInt($data.infant);

        buffer += '<div class="content-block-title"><b>' + $data.excursion + '</b></div>';
        buffer += '<span style="margin-left:15px;">' + total + ' guest(s)</span>';
        buffer += '<div class="list-block">';

        for (var i = 0; i < $data.adult; i++) {
            buffer += buffer_item_guest($data.idx_transaction, 'Adult', 0);
        }
        for (var i = 0; i < $data.child; i++) {
            buffer += buffer_item_guest($data.idx_transaction, 'Child', 0);
        }
        for (var i = 0; i < $data.infant; i++) {
            buffer += buffer_item_guest($data.idx_transaction, 'Infant', 0);
        }


        buffer += '</div>';
        buffer += '</div>';
    });
    $('#guest-list').empty();
    $('#guest-list').append(buffer);





    callback();
}

function initialize() {
    i_booking_pax();
}

function get_pupp() {
    var pupp = '';

    if ($MODE == "online") {
        // get this value from maxpax module
        switch ($('#i-booking-pax-adult').data('pupp')) {
            case 'PU': pupp = 'Per Unit'; break;
            case 'PP': pupp = 'Per Pax'; break;
        }
    } else {
        var exc = obj_props_to_lower($(div_search_excursion).data('select'));

        switch (exc.pupp) {
            case 'PU': pupp = 'Per Unit'; break;
            case 'PP': pupp = 'Per Pax'; break;
        }
    }

    return pupp;
}

function get_pickuptime() {

    var $input = $('#i-pickuptime');

    $loader.show();
    $status.set('GETTING PICKUP TIME INFORMATION')
    //if($MODE == 'online') {

    var module = get_core_module();
    var serialize = '&act=form-search-pickuptime'
    serialize += '&ide=' + $excursion.value[0].idx_excursion
    serialize += '&ids=' + ($excursion.value[0].idx_sub !== null ? $excursion.value[0].idx_sub : '')
    serialize += '&idh=' + $hotel_area.value[0].idx_hotel

    $.ajax({
        url: module,
        data: serialize,
        dataType: 'json',
        success: function (data) {

            $loader.hide();

            if (data.length != 0) {
                $input.val(data[0].pickup);
                if (typeof (data[0].location) !== 'undefined') {
                    // meeting point di offline mode hanya disimpan di remark guest (agar data tidak dobel)
                    //$('#detail-remark2').val('Meeting point at '+data[0].location);
                    $('#detail-remark2').val('');
                }
            } else {
                $input.val('00:00');
                $('#detail-remark1').val('');
                $('#detail-remark2').val('');
                $app.alert($STRING.pickuptime_no_data, $STRING.info_data_not_found);
            }
        }
    });
    /*
    } else {

        ssql_load('LIST_PICKUP', 'ALL', function(ssql_data) {
            ssql = ssql_data.script;
    
            ssql = ssql.replace(/@:id_excur:/g, $excursion.value[0].idx_excursion);
            ssql = ssql.replace(/@:id_excursub:/g, $excursion.value[0].idx_sub);
            ssql = ssql.replace(/@:id_hotel:/g, $hotel_area.value[0].idx_hotel);
                  
            sql(ssql, function(result) {
                SQL_ROWS  = result.rows;
                SQL_ARRAY = arr_props_to_lower(SQL_ROWS._array);

                $loader.hide();

                if(SQL_ARRAY.length!=0) {
                    $input.val(SQL_ARRAY[0].pickup.substr(11, 5));
                } else {
                    $input.val('00:00');
                    $app.alert($STRING.pickuptime_no_data, $STRING.info_data_not_found);
                }
            });
        });

    }
    */
}

function charge_type(aci) {
    var type = aci.toUpperCase();
    switch (type) {
        /*case 'S':*/
        case 'A': return 'adult';
        case 'C': return 'child';
        case 'I': return 'infant';
        case 'S': return 'service package';
        default: return aci;
    }
}

function list_maxpax(callback) {

    var buffer = '';

    $loader.show();
    $status.set('LOADING PAX INFORMATION');

    $('#div-booking-pax').empty();

    if ($MODE == "online") {
        var module = get_core_module();
        var serialize = '&act=form-search-maxpax'
        serialize += '&ide=' + $excursion.value[0].idx_excursion
        serialize += '&ids=' + ($excursion.value[0].idx_sub !== null ? $excursion.value[0].idx_sub : '')
        serialize += '&td=' + $('#i-allotment-calendar').val()

        $.ajax({
            url: module,
            data: serialize,
            dataType: 'json',
            success: function (data) {

                $loader.hide();
                if (data) {
                    if (data[0].aci == 'S') {
                        buffer += buffer_input_pax('A', 1, 99, 0, 0);
                        buffer += buffer_input_pax('C', 0, 99, 0, 0);
                        buffer += buffer_input_pax('I', 0, 99, 0, 0);
                    } else {
                        for (var i = 0; i < data.length; i++) {
                            buffer += buffer_input_pax(data[i].aci, data[i].minpax, data[i].maxpax, data[i].agefrom, data[i].ageto);
                        }
                    }
                    $('#div-booking-pax').append(buffer);
                    $('#i-booking-pax-adult').data('pupp', data[0].pupp);
                    i_booking_pax();
                } else {
                    $app.alert('Max pax data is not exist!', 'Data not qualified');
                }

            }
        });
    } else {

        var exc = obj_props_to_lower($(div_search_excursion).data('select'));

        if (exc.pf_adult != 0) {
            buffer += buffer_input_pax('A', exc.pf_adult, exc.pt_adult, exc.af_adult, exc.at_adult);
            buffer += buffer_input_pax('C', exc.pf_child, exc.pt_child, exc.af_child, exc.at_child);
            buffer += buffer_input_pax('I', exc.pf_infant, exc.pt_infant, exc.af_infant, exc.at_infant);

            $('#div-booking-pax').append(buffer);
            i_booking_pax();
        } else {
            // data error, minimum pax for adult must not zero!
            $('#div-booking-pax').append("<i style='color:red;'>Incorrect setup for minimum adult pax!</i>");
        }
        $loader.hide();
        callback();
    }
}

function allotment_create_calendar(allotments, month, year, reset, callback) {
    var disabled_dates = [];
    var date, tmp;

    // last minute booking
    // -1 for allow from today
    //  0 for allow from tomorrow
    var minimum_date = new Date();
    var allowed_code = parseInt($SETTINGS.last_minute_booking);

    minimum_date.setDate(minimum_date.getDate() + (allowed_code));

    console.log('allotments: ' + allotments.length)
    console.log(allotments);

    // allotment will come in all day of month
    // even the past day
    for (var i = 0; i < allotments.length; i++) {
        var today = new Date();
        var data = new Date(allotments[i].date);

        // check allotment only from today
        if (today <= data) {
            if (allotments[i].status == 0) {
                tmp = allotments[i].date;
                tmp = tmp.substr(0, 10);
                tmp = tmp.split('-');

                date = new Date(tmp[0], parseInt(tmp[1]) - 1, tmp[2]);
                disabled_dates.push(date);
            }
        }
    }

    $('#i-allotment-calendar').data('allotment', allotments);
    console.log(disabled_dates);

    $tour_calendar = $app.calendar({
        input: '#i-allotment-calendar',
        convertToPopover: false,
        closeOnSelect: true,
        minDate: minimum_date, /* disabled from minimum */
        disabled: disabled_dates,
        toolbarTemplate: CALENDAR_TEMPLATE,
        onOpen: function (p) {

            $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] + ', ' + p.currentYear);
            $$('.calendar-custom-toolbar .left .link').on('click', function () {
                p.prevMonth();
            });
            $$('.calendar-custom-toolbar .right .link').on('click', function () {
                p.nextMonth();
            });
            callback();

        },
        onMonthYearChangeStart: function (p, year, month) {

            $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] + ', ' + p.currentYear);

        },
        onMonthYearChangeEnd: function (p, c_year, c_month) {

            var before = parseInt(month, 10);
            var after = parseInt(c_month) + 1;

            if (before != after) {
                allotment_list(function () {
                    callback();
                }, false, c_month + 1, c_year);
            }

        },
        onDayClick: function (p, dayContainer, year, month, day) {

            //console.log(p);
            //console.log(dayContainer);

        }
    });

    if (!$tour_calendar.opened) {
        // waiting is required to prevent something funny!
        setTimeout(function () {
            $tour_calendar.open();

            if (!reset) {
                $tour_calendar.setYearMonth(year, month - 1, 100);
            }
        }, 100);
    }
}

function allotment_list(callback, reset, month, year) {

    var today = new Date();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear() + '';
    var disabled_dates;

    month = month == undefined ? mm : month;
    month = month < 10 ? '0' + month : month;
    year = year == undefined ? yyyy : year;

    $loader.show();
    $status.set('ASKING ALLOTMENT DATA FROM SERVER<br><b>' + monthNames[month - 1] + ' ' + year + '</b>');

    // destroy is important!
    RESET.input_tour_date();

    function sts_allotment() {
        //if($MODE=="online") {
        var module = get_core_module();
        var serialize = '&act=form-search-allotment'
        serialize += '&ide=' + $excursion.value[0].idx_excursion
        serialize += '&ids=' + ($excursion.value[0].idx_sub !== null ? $excursion.value[0].idx_sub : '')
        serialize += '&idm=' + $SETTINGS.market.id
        serialize += '&m=' + month
        serialize += '&y=' + year

        $.ajax({
            url: module,
            data: serialize,
            dataType: 'json',
            success: function (result) {
                allotment_create_calendar(result, month, year, reset, callback);
            },
            error: function () {
                $loader.hide();
                $app.alert($STRING.allotment_fail, 'Internet Disconnected', function () {
                    allotment_create_calendar([], month, year, reset, callback);
                });
            }
        });
        /*
        } else {
            ssql_load('LIST_ALLOTMENT', 'ALL', function(ssql_data) {
                ssql = ssql_data.script;
                    
                ssql = ssql.replace(/@:id_excur:/g, $excursion.value[0].idx_excursion);
                ssql = ssql.replace(/@:id_excursub:/g, $excursion.value[0].idx_sub);
                ssql = ssql.replace(/@:id_market:/g, $SETTINGS.market.id);
                ssql = ssql.replace(/@:cmonth:/g, month);
                ssql = ssql.replace(/@:cyear:/g, year);
                    
                sql(ssql, function(result) {
                    SQL_ROWS    = result.rows;
                    SQL_ARRAY   = arr_props_to_lower(SQL_ROWS._array);
                    
                    allotment_create_calendar(SQL_ARRAY,  month, year, reset, callback); 
                });
            });

        }
        */
    }




    //---- integration with loro parque

    $SETTINGS.loroparque.product_id = '';
    $SETTINGS.loroparque.bono_id = '';
    $SETTINGS.loroparque.ProductosBono = '';


    if ($f_settings.lp_status.get() == 'true') {
        var $dataselect = obj_props_to_lower($(div_search_excursion).data('select'));
        if ($dataselect.conexios !== null || $dataselect.enlace_menu !== null || $dataselect.group_internet !== null || $dataselect.product_id !== null) {
            console.log($dataselect);
            console.log($dataselect.product_id);
            $SETTINGS.loroparque.product_id = $dataselect.product_id;
            $SETTINGS.loroparque.general.ConexionIacpos = $dataselect.conexios;

            if ($dataselect.product_id !== undefined && $dataselect.product_id !== '') {
                $lp.HIBDisponible($dataselect, month, year, function (r) {
                    if (r.DatosResult !== null) {
                        $lp.allotment(r, $dataselect.product_id, month, year, function (s) { });

                    } else {
                        sts_allotment();
                    }
                });
            } else {
                sts_allotment();
            }

        } else {
            sts_allotment();
        }
    } else {
        sts_allotment()
    }
}




function i_booking_pax() {

    $('.input-stepper').inputStepper();
    /*
    $('#div-booking-pax input[type="text"]').on('change', function() {
        var $this 		= $(this);
    	
        switch($this.prop('id')) {
            case 'i-booking-pax-adult':
                //alert('You have reach maximum pax for PU item!');
                break;
            case 'i-booking-pax-child':
                i_booking_pax_add_child('child', $this.val(), function() {
                    $('.age.input-stepper.child').inputStepper();
                    //alert('You have reach maximum pax for PU item!');
                });
                break;
            case 'i-booking-pax-infant':
                i_booking_pax_add_child('infant', $this.val(), function() {
                    $('.age.input-stepper.infant').inputStepper();
                    //alert('You have reach maximum pax for PU item!');
                });
                break;
            default:
        }
    });
    */
}

function i_booking_pax_add_child(ci, childCount, callback) {

    var elid = '#div-age-of-' + ci,
        input = '#i-booking-pax-' + ci,
        $EL = $(elid),
        item = '',
        item_len = parseInt($EL.children().length);

    var min = Math.round($(input).attr('min-age')),
        max = Math.round($(input).attr('max-age'));

    if (childCount > 0) {
        if (childCount > item_len) {

            item = buffer_input_age(ci, min, max);
            $EL.append(item);

        } else {
            $(elid + ' div.age:last').remove();
        }
    } else {
        $EL.empty();
    }

    //event
    $(elid + ' .pax').focus(function () { this.blur(); });

    callback();
}

function iframe_load(url) {
    var url_string = url; //window.location.href
    var url = new URL(url_string);
    var query = url.searchParams.get("sts");

    if (query != null) {

        $main_view.router.back();
        switch (query) {
            case 'ok':
                $('#checkout-doku').addClass('hidden');
                $('#checkout-finish').removeClass('hidden');
                $('#checkout-finish').trigger('click');
                break;
            case 'xx':
            //nothing todo
        }

    }
    $loader.hide();
}

function iframe_error() {
    $loader.hide();
}