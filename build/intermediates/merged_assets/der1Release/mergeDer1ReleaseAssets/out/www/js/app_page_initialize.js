function app_page_initialize(app, page) {
    switch (page.name) {

        case 'setup-welcome':
            page_setup_welcome(app, page);
            break;
        case 'setup-domain':
            page_setup_domain(app, page);
            break;
        case 'setup-account':
            page_setup_account(app, page);
            break;
        case 'setup-language':
            page_setup_language(app, page);
            break;
        case 'setup-additionals':
            page_setup_additionals(app, page);
            break;
        case 'setup-paygate':
            page_setup_paygate(app, page);
            break;
        case 'setup-synchronize':
            page_setup_synchronize(app, page);
            break;
        case 'paygate-list':
            page_paygate_list(app, page);
            break;
        case 'product':
            page_product(app, page);
            break;
        case 'mflisting':
            page_mflisting(app, page);
            break;
        case 'payment-gate':
            page_payment_gate(app, page);
            break;

        case 'findbooking':
            page_findbooking(app, page);
            break;
        case 'detailbooking':
            page_detailbooking(app, page);
            break;
        case 'canceltrx':
            page_canceltrx(app, page);
            break;
        default:
    }
}
function app_page_view(name) {
    // hide
    $$('.view-main').hide();
    $$('.view-settings').hide();
    // show
    $$(name).show();
}

function page_setup_welcome(app, page) {
    $('#setup-welcome-title').addClass('re-center');
    $('#login-app-version').text('v' + AppVersion.version);

    if ($main_view.history.length > 1) {
        $('#setup-welcome-close').show();
    } else {
        $('#setup-welcome-close').hide();
    }

    $('#setup-welcome-next').on('click', function () {
        $settings_view.router.load({
            url: 'setup_domain.html'
        });
    });

    $('#setup-welcome-close').on('click', function () {
        settings_form_load();
        app_page_view('.view-main');
    });
}

function page_setup_domain(app, page) {
    var current_domain = $SETTINGS.server;
    $('#login-input-domain').val(current_domain);
    $('#login-input-domain').focus();

    $('.setup-domain-next').on('click', function () {
        domain_apply($('#login-input-domain').val(), function () {
            $loader.hide();
            $settings_view.router.load({
                url: 'setup_account.html'
            });
        });
    });
}

function page_setup_account(app, page) {
    $('#setup-account-next').on('click', function () {
        user_login(function ($data) {
            console.log($data)


            if ($data.length == 0) {
                $loader.hide();
                $app.alert('Invalid login attempt!', $STRING.info_warning);
                return false;
            }

            // applying user data
            $f_settings.branch.set(
                $data[0].branch_id,
                $data[0].branch_name

            );

            $f_settings.address_of_branch.set($data[0].branch_address);

            $f_settings.phone_branch.set($data[0].branch_phone);
            $f_settings.text_cx_branch.set($data[0].branch_cx_text !== undefined ? $data[0].branch_cx_text : $f_settings.cxl_policy.get());

            //

            $f_settings.user.set(
                $data[0].user_id,
                $data[0].user_name
            );
            $f_settings.user_initial.set(
                $data[0].user_initial
            );

            $f_settings.market.set(
                $data[0].market_id,
                $data[0].market_name
            );

            $f_settings.currency.set(
                $data[0].currency_id,
                $data[0].currency_name
            );

            $settings_view.router.load({
                url: 'setup_language.html'
            });

        });
    });
}

function page_setup_language(app, page) {
    var buffer = '';
    get_language(function (data) {
        for (var i = 0; i < data.length; i++) {
            buffer += '<li data-item=\'' + JSON.stringify(data[i]) + '\'>';
            buffer += ' <label class="label-checkbox item-content" >';
            buffer += '  <input type="checkbox" ' + (i == 0 ? 'checked="checked"' : '') + ' >';
            buffer += '  <div class="item-media">';
            buffer += '   <i class="icon icon-form-checkbox"></i>';
            buffer += '  </div>';
            buffer += '  <div class="item-inner border-clear">';
            buffer += '   <div class="item-title" style="margin-top:-10px; white-space:normal;">';
            buffer += '    <b >' + data[i].language + '</b>';
            buffer += '   </div>';
            buffer += '  </div>';
            buffer += ' </label>';
            buffer += '</li>';
        }
        $('#login-input-language').empty();
        $('#login-input-language').append(buffer);
        $('#login-input-language').on('change', 'input[type=checkbox]', function (e) {
            $('#login-input-language input[type=checkbox]').prop('checked', false);
            $(this).prop('checked', true);
        });
        $loader.hide();
    });

    $('#setup-language-next').on('click', function () {
        var $selected = $('#login-input-language').find(':checked').parents('li').data('item');
        $f_settings.language.set(
            $selected.idx_language,
            $selected.language
        );

        $settings_view.router.load({
            url: 'setup_additionals.html'
        });
    });
}

function page_setup_additionals(app, page) {
    // initialize company's default
    var DEFAULT = $DEFAULT_SET[identify_company($f_settings.registration_id.get())];

    var d_payment_combinable = DEFAULT.payment_combinable;
    var d_payment_manual = DEFAULT.payment_manual;
    var d_payment_default = DEFAULT.payment_default;
    var d_print_company_logo = DEFAULT.print_company_logo;
    var d_print_size = DEFAULT.print_size;
    var d_discount_before_surcharge = DEFAULT.discount_before_surcharge;
    var d_discount_split_view = DEFAULT.discount_split_view;
    var d_discount_validation = DEFAULT.discount_validation;
    var d_last_minute_booking = DEFAULT.last_minute_booking;
    var d_required_guest_details = DEFAULT.required_guest_details;
    var d_voucher_connect = DEFAULT.voucher_connect;
    var d_voucher_amend = DEFAULT.voucher_amend;
    var d_voucher_manual = DEFAULT.voucher_manual;

    // init login state
    $f_login.payment_combinable.set(d_payment_combinable.status);
    $f_login.payment_combinable.disabled(d_payment_combinable.locked);
    $f_login.payment_manual.set(d_payment_manual.status);
    $f_login.payment_manual.disabled(d_payment_manual.locked);
    $f_login.payment_default.set(d_payment_default.status);
    $f_login.payment_default.disabled(d_payment_default.locked);
    $f_login.print_company_logo.set(d_print_company_logo.status);
    $f_login.print_company_logo.disabled(d_print_company_logo.locked);
    $f_login.print_size.set(d_print_size.status);
    $f_login.print_size.disabled(d_print_size.locked);
    $f_login.discount_before_surcharge.set(d_discount_before_surcharge.status);
    $f_login.discount_before_surcharge.disabled(d_discount_before_surcharge.locked);
    $f_login.discount_split_view.set(d_discount_split_view.status);
    $f_login.discount_split_view.disabled(d_discount_split_view.locked);
    $f_login.discount_validation.set(d_discount_validation.status);
    $f_login.discount_validation.disabled(d_discount_validation.locked);
    $f_login.last_minute_booking.set(d_last_minute_booking.status);
    $f_login.last_minute_booking.disabled(d_last_minute_booking.locked);
    $f_login.required_guest_details.set(d_required_guest_details.status);
    $f_login.required_guest_details.disabled(d_required_guest_details.locked);
    $f_login.voucher_connect.set(d_voucher_connect.status);
    $f_login.voucher_connect.disabled(d_voucher_connect.locked);
    $f_login.voucher_amend.set(d_voucher_amend.status);
    $f_login.voucher_amend.disabled(d_voucher_amend.locked);
    $f_login.voucher_manual.set(d_voucher_manual.status);
    $f_login.voucher_manual.disabled(d_voucher_manual.locked);

    $('#setup-additionals-next').on('click', function () {
        var i_payment_combinable = $('#login-input-payment-combinable option:selected').val();
        var i_payment_manual = $('#login-input-payment-manual option:selected').val();
        var i_payment_default = $('#login-input-payment-default option:selected').val();
        var i_print_company_logo = $('#login-input-print-companylogo option:selected').val();
        var i_print_size = $('#login-input-print-size option:selected').val();
        var i_discount_before_surcharge = $('#login-input-discount-beforesurcharge option:selected').val();
        var i_discount_split_view = $('#login-input-discount-splitview option:selected').val();
        var i_discount_validation = $('#login-input-discount-validation option:selected').val();
        var i_last_minute_booking = $('#login-input-lastminute-booking option:selected').val();
        var i_required_guest_details = $('#login-input-required-guestdetails option:selected').val();
        var i_voucher_connect = $('#login-input-voucher-connect option:selected').val();
        var i_voucher_amend = $('#login-input-voucher-amend option:selected').val();
        var i_voucher_manual = $('#login-input-voucher-manual option:selected').val();

        $f_settings.payment_combinable.set(i_payment_combinable);
        $f_settings.payment_combinable.disabled(d_payment_combinable.locked);
        $f_settings.payment_manual.set(i_payment_manual);
        $f_settings.payment_manual.disabled(d_payment_manual.locked);
        $f_settings.payment_default.set(i_payment_default);
        $f_settings.payment_default.disabled(d_payment_default.locked);
        $f_settings.print_company_logo.set(i_print_company_logo);
        $f_settings.print_company_logo.disabled(d_print_company_logo.locked);
        $f_settings.print_size.set(i_print_size);
        $f_settings.print_size.disabled(d_print_size.locked);
        $f_settings.discount_before_surcharge.set(i_discount_before_surcharge);
        $f_settings.discount_before_surcharge.disabled(d_discount_before_surcharge.locked);
        $f_settings.discount_split_view.set(i_discount_split_view);
        $f_settings.discount_split_view.disabled(d_discount_split_view.locked);
        $f_settings.discount_validation.set(i_discount_validation);
        $f_settings.discount_validation.disabled(d_discount_validation.locked);
        $f_settings.last_minute_booking.set(i_last_minute_booking);
        $f_settings.last_minute_booking.disabled(d_last_minute_booking.locked);
        $f_settings.required_guest_details.set(i_required_guest_details);
        $f_settings.required_guest_details.disabled(d_required_guest_details.locked);
        $f_settings.voucher_connect.set(i_voucher_connect);
        $f_settings.voucher_connect.disabled(d_voucher_connect.locked);
        $f_settings.voucher_amend.set(i_voucher_amend);
        $f_settings.voucher_amend.disabled(d_voucher_amend.locked);
        $f_settings.voucher_manual.set(i_voucher_manual);
        $f_settings.voucher_manual.disabled(d_voucher_manual.locked);

        $settings_view.router.load({
            url: 'setup_synchronize.html' //'setup_paygate.html'
        });
    });
}

function page_setup_paygate(app, page) {
    var buffer = '';
    get_paygate(function (data) {
        if (data.length != 0) {
            for (var i = 0; i < data.length; i++) {
                buffer += '<li data-item=\'' + JSON.stringify(data[i]) + '\'>';
                buffer += ' <label class="label-checkbox item-content" >';
                buffer += '  <input type="checkbox" checked="checked" >';
                buffer += '  <div class="item-media">';
                buffer += '   <i class="icon icon-form-checkbox"></i>';
                buffer += '  </div>';
                buffer += '  <div class="item-inner border-clear">';
                buffer += '   <div class="item-title" style="margin-top:-10px; white-space:normal;">';
                buffer += '    <b >' + data[i].name_provider + '</b>';
                buffer += '   </div>';
                buffer += '   <div style="margin-right:15px;">' + (string_to_boolean(data[i].status_dev) ? '<span style="color:red;">DEMO</span>' : '') + '</div>';
                buffer += '  </div>';
                buffer += ' </label>';
                buffer += '</li>';
            }
            $('#login-input-paygate').empty();
            $('#login-input-paygate').append(buffer);
            $loader.hide();
        } else {
            $settings_view.router.load({
                url: 'setup_synchronize.html'
            });
        }
    });

    $('#setup-paygate-next').on('click', function () {
        $settings_view.router.load({
            url: 'setup_synchronize.html'
        });
    });
}

function page_setup_synchronize(app, page) {
    $('#setup-synchronize-retry').hide();
    reset_and_sync(function () {
        save_paygate(function () {
            // nothing
        });
    });

    $('#setup-synchronize-retry').on('click', function () {
        $('#setup-synchronize-retry').hide();
        reset_and_sync(function () {
            save_paygate(function () {
                // nothing
            });
        });
    });
}

function page_paygate_list(app, page) {
    $('#paygate-list-title').addClass('re-center');
    paygate_list();
    /*
    $('#paygate-list-close').on('click', function() {
        app_page_view('.view-main');
    });
    */
}

function page_mflisting(app, page) {

}

function page_canceltrx(app, page) {
    var today = get_date();

    //--- Function in find_booking.js
    opencancel(page.query, page)


}
function page_detailbooking(app, page) {
    var today = get_date();

    //--- Function in find_booking.js
    openbooking(page.query)


}



function page_findbooking(app, page) {
    $('#a_findbooking').on('click', function (e) {
        var $this = $(this);

        find_booking()
    })
    $('#t_findbooking').on('keyup', function (e) {
        var $this = $(this);
        var input = $this.val();
        var buffer = '';
        if (e.keyCode === 13) {
            find_booking()
        }
    });

}

function page_product(app, page) {
    var today = get_date();
    $('#product-search-date').val(today);
    $('.product-date').text(date_format(today, 'dd MONTH yyyy'));


    $('#view-price-local').on('click', function () {
        product_list_offline('', $('#product-search-date').val(), function () {
            $app.showTab('#tab-price-local');
            $loader.hide();
        });
    });
    $('#view-price-server').on('click', function () {
        product_list_online('', $('#product-search-date').val(), function () {
            $app.showTab('#tab-price-server');
            $loader.hide();
        });
    });

    $('#price-change-date').on('click', function () {
        $app.popup('.popup-product-search');
    });

    $('#product-search-start').on('click', function () {
        var current_tab = $('#product-tab-group a.active').attr('id');
        var booking_date = $('#product-search-date').val();

        if (!booking_date) {
            $app.alert('You need to select date!', $STRING.info_required_input);
            return false;
        }

        $('.product-date').text(date_format(booking_date, 'dd MONTH yyyy'));

        switch (current_tab) {
            case 'view-price-local':
                product_list_offline('', booking_date, function () {
                    $loader.hide();
                });
                break;
            case 'view-price-server':
                product_list_online('', booking_date, function () {
                    $loader.hide();
                });
                break;
        }
    });

    var $product_search_calendar = $app.calendar({
        container: '#product-search-calendar',
        weekHeader: false,
        onDayClick: function (p, dayContainer, year, month, day) {
            var year = year;
            var month = parseInt(month) + 1;
            var day = day;

            month = month < 10 ? '0' + month : month;
            day = day < 10 ? '0' + day : day;

            $('#product-search-date').val(year + '-' + month + '-' + day);
        }
    });
}

function page_payment_gate(app, page) {
    var $data = JSON.parse(decodeURIComponent(page.query.raw));
    console.log('test')
    console.log($data)
    var $form = $('#paygate-parameters');
    $form.attr('action', $data.post_url);

    $form.find('input[name=VOUCHER]').val(page.query.voucher);
    $form.find('input[name=NAME]').val(page.query.guest);
    $form.find('input[name=EMAIL]').val(page.query.email);
    $form.find('input[name=MOBILEPHONE]').val(page.query.phone);
    $form.find('input[name=AMOUNT]').val(page.query.amount);
    $form.find('input[name=forurl]').val(page.query.domain);
    $form.find('input[name=stsapp]').val(page.query.via);
    $form.find('input[name=statusapp]').val(page.query.status);

    $('#payment-pay-load').trigger('click');
}

