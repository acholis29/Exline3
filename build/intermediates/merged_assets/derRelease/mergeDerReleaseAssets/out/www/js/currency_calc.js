function calc_multiple_currency(element) {

    var $target = $(element);
    var $parent = $target.parents('.root');
    var $checkbox = $parent.find('input[type=checkbox]');
    var total = SESSION.transaction_payment;

    var currency_from = $SETTINGS.currency.id;
    var currency_to = $parent.data('item').idx_currency;
    var currency_type = $parent.data('type');

    var $label = $('#' + currency_type + '_' + currency_to + '_label');
    var $original_value = $('#' + currency_type + '_' + currency_to + '_original_value');
    var $exchange_value = $('#' + currency_type + '_' + currency_to + '_exchange_value');

    var prefix_label = $label.data('label');
    var infix_label = '<i style="font-size:50%; font-weight:normal;">values of ' + $SETTINGS.currency.name;
    var suffix_label = '</i>';

    $loader.show();
    setTimeout(function () {
        if ($checkbox.prop('checked')) {
            // sometimes it's not checked, don't know why?
            //$checkbox.prop('checked', true);

            // destroy all negative sign
            //$exchange_value.val(Math.abs($exchange_value.val()));

            // prevent multiple credit card payment
            if ($('#pay-input input[data-type=credit_card]:checked').length > 1) {
                $app.alert($STRING.currency_no_creditcard, $STRING.info_important, function () {
                    reset_input_field(element);
                });
                $loader.hide();
                return false;
            }

            // prevent invalid input by user
            var is_valid = !isNaN(parseFloat($exchange_value.val()));
            if (!is_valid) {
                console.log('> input is invalid');
                $app.alert($STRING.currency_value_invalid, $STRING.info_important, function () {
                    reset_input_field(element);
                });
                $loader.hide();
                return false;
            }

            // detect zero input and auto uncheck
            var is_zero = $original_value.val() != 0 && $exchange_value.val() == 0 && $checkbox.is(':checked');
            if (is_zero) {
                console.log('> input is zero');
                reset_input_field(element);
                $loader.hide();
                return false;
            }

            get_cash_minus(total, get_pay_array(), function (val_to_convert) {

                // prevent selecting with zero available value
                // v3.0.31
                // dont parse [val_to_convert] to prevent false validation
                // ie 0.15 will parsed to 0 (dont do this)

                if (val_to_convert == 0 && $('#pay-input input[type=checkbox]:checked').length > 0) {
                    $app.alert($STRING.currency_no_value, $STRING.info_important, function () {
                        reset_input_field(element);
                    });
                    $loader.hide();
                    return false;
                }

                // prevent overflow
                // if val_to_convert is -1 or smaller than 0 (zero)
                var is_overflow = parseFloat(val_to_convert) < 0;
                if (is_overflow) {
                    console.log('> input is overflow');
                    $app.alert($STRING.currency_value_overflow, $STRING.info_important, function () {
                        reset_input_field(element);
                    });
                    $loader.hide();
                    return false;
                }

                var x_currency_from = $target.is(':checkbox') ? currency_from : currency_to;
                var x_currency_to = $target.is(':checkbox') ? currency_to : currency_from;
                var x_val_to_convert = $target.is(':checkbox') ? val_to_convert : $exchange_value.val();

                rates_convert(x_currency_from, x_currency_to, currency_type, x_val_to_convert, function (result) {

                    var original_val = val_to_convert; // from get_cash_minus result
                    var exchange_val = result;

                    var x_result = $target.is(':checkbox') ? original_val : result;
                    var credit_card_add = ''; //currency_type == 'credit_card' ? '+'+$SETTINGS.tax_for_credit_card+'% rates' : '';

                    $label.empty();
                    $label.append(prefix_label + ' ' + infix_label + ' ' + x_result + credit_card_add + suffix_label);
                    $original_value.val(x_result);

                    if ($target.is(':checkbox')) {
                        $exchange_value.val(exchange_val);
                    }

                    $loader.hide();
                });

            });

        } else {

            // sometimes it's not unchecked, don't know why?
            //$checkbox.prop('checked', false);

            $label.empty();
            $label.append(prefix_label);
            $original_value.val('0');
            $exchange_value.val('0');
            $loader.hide();

        }
    }, 500); // let the ui keep working
}

function reset_input_field(element) {
    var $target = $(element);
    var $parent = $target.parents('.root');
    var $checkbox = $parent.find('input[type=checkbox]');
    /* 3.0.32
    var $label          = $('#'+currency_type+'_'+currency_to+'_label');
    var $original_value = $('#'+currency_type+'_'+currency_to+'_original_value');
    var $exchange_value = $('#'+currency_type+'_'+currency_to+'_exchange_value');
    */
    var $label = $parent.find('b');
    var $original_value = $parent.find('input[type=hidden]');
    var $exchange_value = $parent.find('input[type=number]');
    var prefix_label = $label.data('label');

    $checkbox.prop('checked', false);
    $label.empty();
    $label.append(prefix_label);
    $original_value.val('0');
    $exchange_value.val('0');
    $exchange_value.removeClass('focus-text');
    $exchange_value.prop('disabled', true);
}

function list_currency_input(paycode) {
    var buffer = '';
    ssql_load('LIST_CURRENCY', 'ALL', function (ssql_data) {
        ssql = ssql_data.script;
        console.log(ssql_data);

        sql(ssql, function (result) {
            console.log(result)



            SQL_ROWS = result.rows;
            SQL_ARRAY = arr_props_to_lower(SQL_ROWS._array);
            switch (paycode) {
                case 'cp':
                    // combinable payment
                    for (var i = 0; i < SQL_ARRAY.length; i++) {
                        buffer += buffer_item_currency(SQL_ARRAY[i], 'cash', true, false);
                    }
                    for (var i = 0; i < SQL_ARRAY.length; i++) {
                        buffer += buffer_item_currency(SQL_ARRAY[i], 'credit_card', false, false);
                    }
                    break;
                case 'ca':
                    // cash
                    for (var i = 0; i < SQL_ARRAY.length; i++) {
                        buffer += buffer_item_currency(SQL_ARRAY[i], 'cash', true, false);
                    }
                    break;
                case 'cc':
                case 'cc_doku':
                    // credit card to local currency
                    for (var i = 0; i < SQL_ARRAY.length; i++) {
                        if (SQL_ARRAY[i].set_default) { /* show only local currency */
                            buffer += buffer_item_currency(SQL_ARRAY[i], 'credit_card', true, true);
                        }
                    }
                    break;
                case 'pot':
                    // pay on tour
                    for (var i = 0; i < SQL_ARRAY.length; i++) {
                        if (SQL_ARRAY[i].idx_currency == $SETTINGS.currency.id) {
                            buffer += buffer_item_currency(SQL_ARRAY[i], 'pay_on_tour', true, true);
                        }
                    }
                    break;
            }

            $('#pay-input').empty();
            $('#pay-input').append(buffer);
        });
    });
}

function get_pay_array() {
    var buffer = [];
    $('#pay-input li.root').each(function (i, e) {
        var $li = $(e);
        var $checkbox = $li.find('input[type=checkbox]');

        if ($checkbox.is(':checked')) {
            buffer.push($li);
        }
    });
    return buffer;
}

function get_pay_value(type) {
    // REMEMBER!
    // hidden: for original value in default currency (without tax)
    // number: for exchange value
    console.log('> calculating temporary of total payment');
    var find = type == 'hidden' ? 'hidden' : 'number';
    var temp = 0;
    $('#pay-input li.root').each(function (i, e) {
        var $li = $(e);
        var $checkbox = $li.find('input[type=checkbox]');
        var value = $li.find('input[type=' + find + ']').val();

        if ($checkbox.is(':checked')) {
            console.log('+' + value);
            temp = temp + parseFloat(value);
        }
    });
    console.log('total: ' + temp);
    return temp;
}

function get_cash_minus(total, cash_array, callback) {

    console.log('> getting cash minus');
    console.log('array size: ' + cash_array.length);

    if (cash_array.length != 0) {

        var cash = cash_array;
        var $li = cash[0];
        console.log('> returning object $li');
        console.log($li)
        var $data = $li.data('item');
        var $input = $li.find('input[type=number]');

        var currency_from = $data.idx_currency;
        var currency_to = $SETTINGS.currency.id;
        var currency_type = $li.data('type');

        var original_value = parseFloat($li.find('input[type=hidden]').val());

        var val_to_convert = parseFloat($input.val());
        val_to_convert = currency_type == 'credit_card' ? original_value : val_to_convert;

        var x_total = 0;

        console.log('active value: ' + val_to_convert);
        console.log('origin value: ' + original_value);
        console.log('total: ' + total);

        // prevent overflow input
        console.log('> checking for overflow');
        var default_currency_total = parseFloat(total);
        var default_currency_input = parseFloat(rates_convert(currency_from, currency_to, 'cash', val_to_convert));
        console.log('total: ' + default_currency_total);
        console.log('input: ' + default_currency_input);
        var is_nan_calc = isNaN(default_currency_total - default_currency_input); // required to prevent err
        var is_overflow = is_nan_calc ? true : (default_currency_total - default_currency_input) < 0 || (default_currency_total - default_currency_input) > SESSION.transaction_payment;
        // note: i can't simplified the above code because there is a strange error!
        // this: (default_currency_total - default_currency_input)
        if (is_overflow) {
            console.log('> overflow');
            console.log(-1);
            return callback(-1);
        }

        // zero value for [val_to_convert] will result false calculation
        if ((cash_array.length == 1 && val_to_convert == 0)
            || (cash_array.length == 1 && val_to_convert == SESSION.transaction_payment)) {
            console.log('> result (special condition)');
            console.log(total);
            /*
            console.log('> calculating temporary of total payment');
            var temp = 0;
            $('#pay-input li.root').each(function(i,e) {
                var $li         = $(e);
                var $checkbox   = $li.find('input[type=checkbox]');
                var value       = $li.find('input[type=hidden]').val();
    
                if($checkbox.is(':checked')) {
                    console.log('+'+value);
                    temp = temp + parseFloat(value);
                }
            });
            console.log('total: '+temp);
            */
            temp = get_pay_value('hidden');

            if (temp == SESSION.transaction_payment) {
                console.log('> temporary match the total payment');
                console.log(0);
                return callback(0);
            } else {
                console.log('> temporary  isn\'t match the total payment');
                var left = SESSION.transaction_payment - temp;
                left = left.toFixed(2);

                console.log('left: ' + left);
                return callback(left);
            }
        }

        if (currency_from == currency_to) {

            console.log('> currency is same');
            console.log('> calculating in ' + currency_type);

            // new code --------- BETA
            var minus = val_to_convert - get_percent_value(total, $SETTINGS.tax_for_credit_card);
            var x_result = currency_type == 'credit_card' ? minus : val_to_convert;

            // PREVENT FALSE CALCULATION IF BOTH CASH & CREDIT CARD ARE CHECKED
            // without this block, selecting another cash currency will result a false calculation
            // ie:
            // TOTAL PAYMENT 87.15
            // SELECT EUR 80 in CASH
            // SELECT EUR 7.36 (automatically) in CREDIT CARD
            // THEN
            // SELECT ANOTHER CASH CURRENCY TO TRIGGER A FALSE CALCULATION
            if (currency_type == 'credit_card' && cash_array.length == 1 && $('#pay-input li.root').length > 1) {
                console.log('> recalculate x_result');
                console.log('before: ' + x_result);
                x_result = val_to_convert;
                console.log('after: ' + x_result);
            }
            console.log('> returning x-result')
            console.log(x_result);
            // new code ---------

            x_total = total - x_result;
            x_total = x_total.toFixed(2);

            console.log('> result');
            console.log(x_total);

            if (cash.length != 0) {
                cash.shift();
            }

            if (cash.length != 0) {
                get_cash_minus(x_total, cash, callback);
            } else {
                callback(x_total);
            }

        } else {

            console.log('> currency is same');

            rates_convert(currency_from, currency_to, currency_type, val_to_convert, function (result) {
                console.log('> calculating in ' + currency_type);

                // new code --------- BETA
                var rates = rates_convert(currency_from, currency_to, 'cash', val_to_convert); // cari nilai [konversi tanpa tax]
                var minus = result - rates; // kurangi [hasil konversi berisi/tanpa tax] dengan [konversi tanpa tax] = [jarak perkalian n%]
                minus = result - minus; // kurangi [hasil konversi berisi/tanpa tax] dengan [jarak perkalian %]  = [nilai kotor]
                minus = minus - get_percent_value(total, $SETTINGS.tax_for_credit_card); // kurangi [nilai kotor] dengan [n% dari total] = [nilai akhir]
                var x_result = currency_type == 'credit_card' ? minus : result;

                console.log('minus: ' + minus);
                console.log('x-result: ' + x_result);
                // new code ---------

                x_total = total - x_result;
                x_total = x_total.toFixed(2);

                console.log('> result');
                console.log(x_total);

                if (cash.length != 0) {
                    cash.shift();
                }

                if (cash.length != 0) {
                    get_cash_minus(x_total, cash, callback);
                } else {
                    callback(x_total);
                }
            });

        }

    } else {
        callback(total);
    }
}

function rates_convert(rates_from, rates_to, rates_type, value, callback) {
    var rates_value = 0;
    var tax = 0;
    var buffer = 0;

    // test only -- 3.0.47
    //console.log('val origin: '+value);
    var value_fixed = value; //parseFloat(value).toFixed(2);
    //console.log('val fixed : '+value_fixed);
    //

    console.log('> converting rates');
    console.log('from: ' + rates_from);
    console.log('to: ' + rates_to);
    console.log('type: ' + rates_type);
    console.log('val: ' + value);

    if (rates_from == rates_to) {

        console.log('> currency is same');

        if (rates_type == 'credit_card') {
            console.log('> calculating exchange rates in credit card');

            // credit card
            tax = get_percent_value(value_fixed, $SETTINGS.tax_for_credit_card);
            buffer = parseFloat(value_fixed) + tax;
        } else {
            console.log('> calculating exchange rates in cash');

            // cash
            buffer = parseFloat(value_fixed);
        }
        console.log('value: ' + value);
        console.log('tax  : ' + tax);
        console.log('rates: ' + value + ' (after tax)');
        console.log('> exchange rates result');
        console.log(buffer);

        buffer = buffer > 0 ? buffer.toFixed(2) : 0;

        console.log('> fixing')
        console.log(buffer);

        if (typeof callback == 'function') {
            callback(buffer);
        } else {
            return buffer;
        }

    } else {

        console.log('> currency is different');
        console.log('> finding exchange rates');

        // parse to prevent exponensial error
        rates_value = parseFloat(rates_find(rates_from, rates_to));
        console.log('rates: ' + rates_value);

        if (rates_value) {
            if (rates_type == 'credit_card') {
                console.log('> calculating exchange rates in credit card');

                // credit card
                tax = get_percent_value(rates_value, $SETTINGS.tax_for_credit_card);
                rates_value = rates_value + tax;
                buffer = parseFloat(value_fixed) * rates_value;
            } else {
                console.log('> calculating exchange rates in cash');

                // cash
                buffer = parseFloat(value_fixed) * rates_value;
            }
            console.log('value: ' + value);
            console.log('tax  : ' + tax);
            console.log('rates: ' + rates_value + ' (after tax)');
            console.log('> exchange rates result');
            console.log(buffer);

            buffer = buffer > 0 ? buffer.toFixed(2) : 0;

            console.log('> fixing')
            console.log(buffer);

            if (typeof callback == 'function') {
                callback(buffer);
            } else {
                return buffer;
            }
        } else {
            $app.alert('No data for exchange rates', 'fn:rates_convert');

            if (typeof callback == 'function') {
                callback(buffer);
            } else {
                return buffer;
            }
        }
    }
}


function rates_find(from, to) {
    var rates = 0;
    $('#exchangerates-list tr').each(function (i, e) {
        var $tr = $(e);
        var data = $tr.data('item');

        if (data.idx_currency_from == from
            && data.idx_currency_to == to) {
            rates = data.rate;
        }
    });
    return rates;
}

function rates_list(callback) {

    $status.set('LISTING EXCHANGE RATES');

    // show booking mode (online/offline)
    $('.booking-mode').text($MODE);

    if ($MODE == 'online') {
        var module = get_core_module();
        var serialize = '&act=form-payment-exchangerates'
        serialize += '&ef='
        serialize += '&et='

        $.ajax({
            url: module,
            data: serialize,
            dataType: 'json',
            success: function (data) {
                if (data.length) {
                    for (var i = 0; i < data.length; i++) {
                        buffer += buffer_item_exchangerates(data[i]);
                    }
                } else {
                    buffer += '<tr ><td colspan="3" style="padding:10p;">NO DATA</td></tr>';
                }
                $('#exchangerates-list').empty();
                $('#exchangerates-list').append(buffer);

                $('#credit-card-value-add').text('+' + $SETTINGS.tax_for_credit_card + '%');

                callback();
            }
        });
    } else {
        var buffer = '';
        ssql_load('LIST_EXCHANGERATE', 'ALL', function (ssql_data) {
            ssql = ssql_data.script;
            sql(ssql, function (result) {
                SQL_ROWS = result.rows;
                SQL_ARRAY = arr_props_to_lower(SQL_ROWS._array);

                if (SQL_ARRAY.length) {
                    for (var i = 0; i < SQL_ARRAY.length; i++) {
                        buffer += buffer_item_exchangerates(SQL_ARRAY[i]);
                    }
                } else {
                    buffer += '<tr ><td colspan="3" style="padding:10p;">NO DATA</td></tr>';
                }

                $('#exchangerates-list').empty();
                $('#exchangerates-list').append(buffer);

                $('#credit-card-value-add').text('+' + $SETTINGS.tax_for_credit_card + '%');

                callback();
            });
        });
    }
}