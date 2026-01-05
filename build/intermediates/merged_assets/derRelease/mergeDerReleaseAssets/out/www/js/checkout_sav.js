function checkout_reset(is_online, callback) {
    initialize_variable(is_online, function () {
        if (is_online) {
            initialize_loroparque(is_online, function (e) {
                console.log(e);
                reset_transaction(is_online, function () {
                    $loader.hide();
                    callback();
                });
            });
        } else {
            reset_transaction(is_online, function () {
                $loader.hide();
                callback();
            });

        }

    });
}

function checkout_last_transaction_data(last_number, callback) {

    var today = get_date();

    $loader.show();
    $status.set('GETTING LAST TRANSACTION DATA');

    if ($MODE == 'online') {
        var module = get_core_module();
        var serialize = '&act=bookings-list-v3'
        serialize += '&fdate=' + today
        serialize += '&tdate=' + today;
        serialize += '&search=' + last_number
        serialize += '&idr=' + $SETTINGS.user.id
        serialize += '&idl=' + $SETTINGS.language.id
        serialize += '&sort=' + 'B'

        $.ajax({
            url: module,
            data: serialize,
            dataType: 'json',
            success: function (data) {
                if (data.length) {
                    callback(data);
                } else {
                    $loader.hide();
                    $app.alert('Transaction not found!', $STRING.info_warning);
                }
            }
        });
    } else {
        ssql_load('LIST_TRANSACTION', 'ALL', function (ssql_data) {
            ssql = ssql_data.script;

            ssql = ssql.replace(/@:search:/g, SESSION.transaction_number_last);
            ssql = ssql.replace(/@:fromdate:/g, today);
            ssql = ssql.replace(/@:todate:/g, today);
            ssql = ssql.replace(/@:id_language:/g, $SETTINGS.language.id);
            ssql = ssql.replace(/@:repname:/g, $SETTINGS.user.name);

            sql_data(ssql, function (data) {

                if (data.length) {
                    callback(data);
                } else {
                    $loader.hide();
                    $app.alert('Transaction not found!', $STRING.info_warning);
                }

            });
        });
    }
}

function checkout_after() {
    var location = $MODE == 'online' ? 'server' : 'device';
    var messages = $STRING.checkout_save_success.replace(/@:location:/g, location);

    // reset push state 3.0.35
    $main_view.history = ['#index'];

    // ask user for action

    $loader.hide();
    $app.modal({
        title: $STRING.save_success,
        text: messages,
        buttons: [
            {
                text: 'Print',
                bold: true,
                onClick: function () {
                    console.log(SESSION)
                    if (SESSION.transaction_number_last !== '') {
                        checkout_last_transaction_data(SESSION.transaction_number_last, function ($bookings) {
                            $loader.hide();
                            switch ($SETTINGS.print_device) {
                                case 'TPV':
                                    // print_TPV.js
                                    tpv_print($bookings, 'VOUCHER', function () {

                                        var temp = [];
                                        $bookings = $bookings.filter((item) => {

                                            if (!temp.includes(item.idx_mfexcursion)) {
                                                temp.push(item.idx_mfexcursion)
                                                return true;
                                            }
                                        })
                                        console.log(temp)

                                        $.each(temp, function (m) {
                                            if (temp[m] != "") {
                                                tpv_printticketLP(temp[m], '', '', function () { });
                                            }
                                        });
                                    });

                                    break;
                                default:
                                    printer_device_list($bookings, 'VOUCHER');
                                    break;

                            }
                        });
                    }

                }
            },
            /*{
                text: 'per Pax',
                onClick: function() {
                    // No action
                }
            },
            */
            {
                text: 'Later',
                onClick: function () {
                    // No action
                    $buffer_arrResultInsercion = [];
                }
            }]
    });
}


function beforecheckout(callback) {

    var module = get_core_module();
    var serialize = 'act=form-cart-add'
    serialize += '&f=' + generate_parameters('before-checkout')
    serialize += '&idx_mf=' + SESSION.transaction_mf

    $.ajax({
        url: module,
        data: serialize,
        success: function (data) {
            if (data == "1") {
                callback(data);
            } else {
                alert(data);
                return false;
            }
        }
    });

}


function checkout_save(callback) {

    var is_online = $MODE == 'online' ? true : false;

    if (string_to_boolean($SETTINGS.required_guest_details) && !checkout_validate_guest()) {
        $app.alert('A complete <b>guest list</b> is required!', $STRING.info_required_input, function () {
            $main_view.router.loadPage('#guest-details');
        });
        return false;
    }

    $loader.show();
    $status.set('SAVING ALL TRANSACTION');

    SESSION.transaction_date = get_date_time(); //get_date();

    if ($MODE == 'online') {

        beforecheckout(function (rr) {
            var module = get_core_module();
            var serialize = '&act=form-payment-checkout'
            serialize += '&data=' + (generate_parameters('checkout'))

            $.ajax({
                url: module,
                data: serialize,
                success: function (data) {

                    checkout_online_mail_buffer(function (data) {
                        if (data.length == 0) {
                            $loader.hide();
                            $app.alert('Sending mail aborted! No data to be send.', $STRING.info_warning);
                            return false;
                        }
                        /*
                                            if ($('#checkout-paymethod').val() === 'cc' || $('#checkout-paymethod').val() === 'cp') {
                                                if ($SETTINGS.tpv_device == 'true') {
                        
                                                    if (data.length == 0) {
                                                        $loader.hide();
                                                        $app.alert('Sending mail aborted! No data to be send.', $STRING.info_warning);
                                                        return false;
                                                    }
                                                    $itos_payment.init(function (r) {
                                                        if (r.resultCode === 1000) {
                                                            amountcc = parseFloat(SESSION.transaction_payment)
                                                            $itos_payment.payment(SESSION.transaction_number_last, amountcc, function (rr) {
                                                                if (rr.resultCode === 0) {
                                                                    //print bill for CC
                                                                    $loader.hide();
                                                                    tpv_printbillcc(rr, 'BILL PAYMENT', function (r) {
                                                                        $loader.show();
                        
                                                                        if ($SETTINGS.lp_status == 'true') {
                                                                            if ($return_HIBDisponible.DatosResult !== null) {
                        
                                                                            }
                                                                        } else {
                        
                                                                            $status.set('PREPARING MAIL MESSAGE');
                                                                            checkout_online_mail_send(data, function (r) {
                                                                                checkout_reset(is_online, function () {
                                                                                    // go back to main page
                                                                                    $main_view.router.loadPage('#index');
                                                                                    $loader.hide();
                                                                                    callback();
                                                                                });
                                                                            });
                        
                                                                        }
                                                                    })
                        
                                                                } else {
                                                                    $loader.hide();
                                                                    $app.alert(rr.resultMessage, 'Error');
                                                                }
                                                            })
                                                        }
                                                    })
                        
                                                } else {
                                                    $loader.show();
                                                    $status.set('PREPARING MAIL MESSAGE');
                                                    checkout_online_mail_send(data, function () {
                                                        checkout_reset(is_online, function () {
                                                            // go back to main page
                                                            $main_view.router.loadPage('#index');
                                                            $loader.hide();
                                                            callback();
                                                        });
                                                    });
                                                }
                                            } else {
                        */
                        $loader.show();
                        $status.set('PREPARING MAIL MESSAGE');
                        checkout_online_mail_send(data, function () {
                            checkout_reset(is_online, function () {
                                // go back to main page
                                $main_view.router.loadPage('#index');
                                $loader.hide();
                                callback();
                            });
                        });

                        //}
                    });

                }
            });


        });




    } else {
        /*
                if ($('#checkout-paymethod').val() === 'cc') {
                    if ($SETTINGS.tpv_device == 'true') {
                        $itos_payment.init(function (r) {
                            if (r.resultCode === 1000) {
                                amountcc = parseFloat(SESSION.transaction_payment)
                                $itos_payment.payment(SESSION.transaction_number_last, amountcc, function (rr) {
                                    if (rr.resultCode === 0) {
                                        //print bill for CC
                                        $loader.hide();
        
                                        tpv_printbillcc(rr, 'BILL PAYMENT', function (r) {
        
                                            checkout_insert_mf_header(SESSION.transaction_date, function () {
                                                checkout_insert_mf_contact(SESSION.transaction_date, function () {
                                                    checkout_insert_mf_payment(SESSION.transaction_date, get_pay_array(), function () {
                                                        checkout_insert_tr_header(function () {
                                                            checkout_insert_tr_item(function () {
                                                                checkout_insert_tr_surcharge(function () {
                                                                    checkout_insert_tr_discount(function () {
                                                                        checkout_insert_tr_namelist(function () {
                                                                            checkout_reset(is_online, function () {
        
                                                                                $main_view.router.loadPage('#index');
                                                                                $loader.hide();
        
                                                                                callback();
        
                                                                            });
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
        
        
                                        })
        
        
        
        
                                    } else {
                                        $loader.hide();
                                        $app.alert(rr.resultMessage, 'Error');
                                    }
                                })
                            }
                        })
        
                    } else {
                        */

        checkout_insert_mf_header(SESSION.transaction_date, function () {
            checkout_insert_mf_contact(SESSION.transaction_date, function () {
                checkout_insert_mf_payment(SESSION.transaction_date, get_pay_array(), function () {
                    checkout_insert_tr_header(function () {
                        checkout_insert_tr_item(function () {
                            checkout_insert_tr_surcharge(function () {
                                checkout_insert_tr_discount(function () {
                                    checkout_insert_tr_namelist(function () {
                                        checkout_reset(is_online, function () {

                                            $main_view.router.loadPage('#index');
                                            $loader.hide();

                                            callback();

                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

    }
    /*
              //} else {
  
              checkout_insert_mf_header(SESSION.transaction_date, function () {
                  checkout_insert_mf_contact(SESSION.transaction_date, function () {
                      checkout_insert_mf_payment(SESSION.transaction_date, get_pay_array(), function () {
                          checkout_insert_tr_header(function () {
                              checkout_insert_tr_item(function () {
                                  checkout_insert_tr_surcharge(function () {
                                      checkout_insert_tr_discount(function () {
                                          checkout_insert_tr_namelist(function () {
                                              checkout_reset(is_online, function () {
  
                                                  $main_view.router.loadPage('#index');
                                                  $loader.hide();
  
                                                  callback();
  
                                              });
                                          });
                                      });
                                  });
                              });
                          });
                      });
                  });
              });
        //  }
  */





}
//}


function checkout_online_mail_buffer(result) {
    var module = get_core_module();
    var serialize = '&act=form-payment-checkout-list'
    serialize += '&mf=' + SESSION.transaction_mf;

    $status.set('PREPARING MAIL MESSAGE');
    $loader.show();

    $.ajax({
        timeout: 60000, /* 60 sec */
        url: module,
        data: serialize,
        dataType: 'json',
        success: function (data) {
            var buffer = '';
            for (var i = 0; i < data.length; i++) {
                buffer += (data[i].email_supplier.length != 0 ? data[i].email_supplier : '') + ',';
                buffer += data[i].idx_transaction + ',';
                buffer += data[i].idx_company + ',';
                buffer += (data[i].email_contact.length != 0 ? data[i].email_contact : '') + '|';
            }
            if (buffer.length) {
                result(buffer.slice(0, - 1)); // remove last vertical bar
            } else {
                result(buffer);
            }
        }
    });
}

function checkout_online_mail_send(buffer, callback) {

    if (buffer.length == 0) {
        $loader.hide();
        $app.alert('Sending mail aborted! No data to be send.', $STRING.info_warning);
        return false;
    }

    var module = get_core_module();
    var serialize = '&act=mail-send'
    serialize += '&arlist=' + (buffer)


    $status.set('SENDING MAIL MESSAGE');

    $.ajax({
        timeout: 60000, /* 60 sec */
        url: module,
        data: serialize,
        success: function (data) {
            if (data == 'MAILSENT') {
                callback();
            } else {
                $loader.hide();
                log_show('Failed to send email!', data);
            }
        }
    });
}

function checkout_validate_guest() {
    var data = guest_form_get();
    var valid = true;
    for (var i = 0; i < data.length; i++) {
        if (data[i].guest_fullname == '') {
            valid = false;
        }
    }
    return valid;
}

function checkout_insert_mf_header(create_date, callback) {
    var pot_remark = 'PAY ON TOUR';
    var pot_paid = $('#checkout-paymethod option:selected').val() == 'pot' ? pot_remark : 'PAID';

    if ($MODE == "online") {

    } else {
        // check for currency first!
        // if only ONE currency exist then no exchangerates available
        sql_data("SELECT * FROM mscurrency", function (currency_data) {
            var ratedate = currency_data.length == 1 ? get_date() : $('.rates-date').data('date');

            ssql_load('INSERT_MF_HEADER', 'ALL', function (ssql_data) {
                ssql = ssql_data.script;

                ssql = ssql.replace(/@:tr_number:/g, SESSION.transaction_number);
                ssql = ssql.replace(/@:date:/g, create_date);
                ssql = ssql.replace(/@:ratedate:/g, ratedate);
                ssql = ssql.replace(/@:id_currency:/g, $SETTINGS.currency.id);
                ssql = ssql.replace(/@:total_price:/g, SESSION.transaction_payment);
                ssql = ssql.replace(/@:id_user:/g, $SETTINGS.user.id);
                ssql = ssql.replace(/@:id_mf:/g, SESSION.transaction_mf);
                ssql = ssql.replace(/@:id_company:/g, $SETTINGS.company.id);
                ssql = ssql.replace(/@:id_branch:/g, $SETTINGS.branch.id);
                ssql = ssql.replace(/@:remark_internal:/g, pot_paid);
                ssql = ssql.replace(/@:remark_guest:/g, pot_paid);
                ssql = ssql.replace(/@:user:/g, $SETTINGS.user.name);

                sql(ssql, function (result) {
                    if (result.rowsAffected == 1) {
                        callback();
                    } else {
                        $loader.hide();
                        $app.alert('Error saving: ' + ssql, 'fn: checkout_insert_mf_header');
                    }
                });
            });
        });
    }
}
function checkout_insert_mf_contact(create_date, callback) {
    if ($MODE == "online") {

    } else {

        ssql_load('INSERT_MF_CONTACT', 'ALL', function (ssql_data) {
            ssql = ssql_data.script;

            ssql = ssql.replace(/@:id_mf:/g, SESSION.transaction_mf);
            ssql = ssql.replace(/@:tr_number:/g, SESSION.transaction_number);
            ssql = ssql.replace(/@:gender:/g, parseESC($('#checkout-title option:selected').val()));
            ssql = ssql.replace(/@:fname:/g, parseESC($('#checkout-firstname').val()));
            ssql = ssql.replace(/@:lname:/g, parseESC($('#checkout-lastname').val()));
            ssql = ssql.replace(/@:email:/g, parseESC($('#checkout-email').val()));
            ssql = ssql.replace(/@:confirm_email:/g, '');
            ssql = ssql.replace(/@:phone:/g, parseESC($('#checkout-phone').val()));
            ssql = ssql.replace(/@:mobile:/g, parseESC($('#checkout-phone').val()));
            ssql = ssql.replace(/@:fax:/g, '');
            ssql = ssql.replace(/@:newid:/g, $.uuid());
            ssql = ssql.replace(/@:user:/g, $SETTINGS.user.name);
            ssql = ssql.replace(/@:date:/g, create_date);

            sql(ssql, function (result) {
                if (result.rowsAffected == 1) {
                    callback();
                } else {
                    $loader.hide();
                    $app.alert('Error saving: ' + ssql, 'fn: checkout_insert_mf_contact');
                }
            });
        });

    }
}
function checkout_insert_mf_payment(create_date, data_payment, callback) {
    var x_data = data_payment;
    var $li = x_data[0];
    var $data = $li.data('item');
    var input_paycode = $li.data('code');
    var input_price = $li.find('input[type=number]').val();
    var input_currency = $data.idx_currency;
    var input_fullname = $('#checkout-firstname').val() + ' ' + $('#checkout-lastname').val();

    //----- for payment to itos
    amountcc = input_price;

    if ($MODE == "online") {

    } else {

        ssql_load('INSERT_MF_PAYMENT', 'ALL', function (ssql_data) {
            ssql = ssql_data.script;

            ssql = ssql.replace(/@:id_mf:/g, SESSION.transaction_mf);
            ssql = ssql.replace(/@:tr_number:/g, SESSION.transaction_number);
            ssql = ssql.replace(/@:payment_type:/g, input_paycode);
            ssql = ssql.replace(/@:name_of_card:/g, parseESC(input_fullname));
            ssql = ssql.replace(/@:billing_address1:/g, '');
            ssql = ssql.replace(/@:billing_address2:/g, '');
            ssql = ssql.replace(/@:id_country:/g, '');
            ssql = ssql.replace(/@:id_state:/g, '');
            ssql = ssql.replace(/@:zip_code:/g, '');
            ssql = ssql.replace(/@:card_type:/g, '');
            ssql = ssql.replace(/@:card_numb:/g, '');
            ssql = ssql.replace(/@:exp_date:/g, '');
            ssql = ssql.replace(/@:secure_code:/g, '');
            ssql = ssql.replace(/@:total_price:/g, input_price);
            ssql = ssql.replace(/@:id_currency:/g, input_currency);
            ssql = ssql.replace(/@:newid:/g, $.uuid());
            ssql = ssql.replace(/@:user:/g, $SETTINGS.user.name);
            ssql = ssql.replace(/@:date:/g, create_date);

            sql(ssql, function (result) {
                if (result.rowsAffected == 1) {

                    if (x_data.length != 0) {
                        x_data.shift();
                    }
                    if (x_data.length != 0) {
                        checkout_insert_mf_payment(create_date, x_data, callback);
                    } else {
                        callback();
                    }

                } else {
                    $loader.hide();
                    $app.alert('Error saving: ' + ssql, 'fn: checkout_insert_mf_payment');
                }
            });
        });

    }
}

function checkout_insert_tr_header(callback) {
    ssql = "SELECT * FROM TMP_MFExcursionTransactionHeader";
    sql_data(ssql, function (result) {
        checkout_insert_tr_header_next(result, callback);
    });
}

function checkout_insert_tr_header_next(input, callback) {
    var data = input;
    var item = data[0];

    ssql = "INSERT INTO MFExcursionTransactionHeader VALUES("
    ssql += "'" + SESSION.transaction_mf + "',"
    ssql += "'" + item.exc_numb + "',"
    ssql += "'" + item.idx_comp + "',"
    ssql += "'" + item.idx_excursion + "',"
    ssql += "'" + item.idx_sub_excursion + "',"
    ssql += "'" + item.refnumber + "',"
    ssql += "'" + item.pickup + "',"
    ssql += "'" + item.idx_hotel + "',"
    ssql += "'" + item.room_no + "',"
    ssql += "'" + item.idx_client + "',"
    ssql += "'" + item.idx_supplier + "',"
    ssql += "'" + item.confirmby + "',"
    ssql += "'" + item.remark + "',"
    ssql += "'" + item.remark_supplier + "',"
    ssql += "'" + item.usedunitroom + "',"
    ssql += "'" + item.idx_contract + "',"
    ssql += "'" + item.stsactive + "',"
    ssql += "'" + item.idx_transaction + "',"
    ssql += "'" + item.idx_from + "',"
    ssql += "'" + item.category + "',"
    ssql += "'" + item.promo + "',"
    ssql += "'" + item.crea_by + "',"
    ssql += "'" + item.crea_date + "',"
    ssql += "'" + item.modi_by + "',"
    ssql += "'" + item.modi_date + "',"
    ssql += "'" + "0" + "'); "

    sql(ssql, function (result) {
        if (result.rowsAffected == 1) {
            if (data.length != 0) {
                data.shift();
            }
            if (data.length != 0) {
                checkout_insert_tr_header_next(data, callback);
            } else {
                callback();
            }
        } else {
            $loader.hide();
            $app.alert('Error saving: ' + ssql, 'fn: checkout_insert_tr_header_next');
        }
    });
}

function checkout_insert_tr_item(callback) {
    ssql = "SELECT * FROM TMP_MFExcursionTransactionItem";
    sql_data(ssql, function (result) {
        checkout_insert_tr_item_next(result, callback);
    });
}

function checkout_insert_tr_item_next(input, callback) {
    var data = input;
    var item = data[0];

    ssql = "INSERT INTO MFExcursionTransactionItem VALUES("
    ssql += "'" + item.idx_transaction + "',"
    ssql += "'" + SESSION.transaction_mf + "',"
    ssql += "'" + item.idx_contract + "',"
    ssql += "'" + item.chargetype + "',"
    ssql += "'" + item.pax + "',"
    ssql += "'" + item.age + "',"
    ssql += "'" + item.buyrate + "',"
    ssql += "'" + item.idx_currrencybuyrate + "',"
    ssql += "'" + item.salesrate + "',"
    ssql += "'" + item.idx_currencysalesrate + "',"
    ssql += "'" + item.rate + "',"
    ssql += "'" + item.totalbuyrate + "',"
    ssql += "'" + item.totalsalesrate + "',"
    ssql += "'" + item.idx_transactionitem + "',"
    ssql += "'" + item.crea_by + "',"
    ssql += "'" + item.crea_date + "',"
    ssql += "'" + item.modi_by + "',"
    ssql += "'" + item.modi_date + "',"
    ssql += "'" + "0" + "'); "

    sql(ssql, function (result) {
        if (result.rowsAffected == 1) {
            if (data.length != 0) {
                data.shift();
            }
            if (data.length != 0) {
                checkout_insert_tr_item_next(data, callback);
            } else {
                callback();
            }
        } else {
            $loader.hide();
            $app.alert('Error saving: ' + ssql, 'fn: checkout_insert_tr_item_next');
        }
    });
}

function checkout_insert_tr_surcharge(callback) {
    ssql = "SELECT * FROM TMP_MFExcursionSurcharge";
    sql_data(ssql, function (result) {
        if (result.length != 0) {
            checkout_insert_tr_surcharge_next(result, callback);
        } else {
            callback();
        }
    });
}

function checkout_insert_tr_surcharge_next(input, callback) {
    var data = input;
    var item = data[0];

    ssql = "INSERT INTO MFExcursionSurcharge VALUES("
    ssql += "'" + SESSION.transaction_mf + "',"
    ssql += "'" + item.exc_numb + "',"
    ssql += "'" + item.idx_transaction + "',"
    ssql += "'" + item.idx_supplement + "',"
    ssql += "'" + item.price + "',"
    ssql += "'" + item.idx_surcharge + "',"
    ssql += "'" + item.crea_by + "',"
    ssql += "'" + item.crea_date + "',"
    ssql += "'" + item.modi_by + "',"
    ssql += "'" + item.modi_date + "',"
    ssql += "'" + "0" + "')";

    sql(ssql, function (result) {
        if (result.rowsAffected == 1) {
            if (data.length != 0) {
                data.shift();
            }
            if (data.length != 0) {
                checkout_insert_tr_surcharge_next(data, callback);
            } else {
                callback();
            }
        } else {
            $loader.hide();
            $app.alert('Error saving: ' + ssql, 'fn: checkout_insert_tr_surcharge_next');
        }
    });
}

function checkout_insert_tr_discount(callback) {
    ssql = "SELECT * FROM TMP_MFExcursionTransactionDiscount";
    sql_data(ssql, function (result) {
        if (result.length != 0) {
            checkout_insert_tr_discount_next(result, callback);
        } else {
            callback();
        }
    });
}

function checkout_insert_tr_discount_next(input, callback) {
    var data = input;
    var item = data[0];

    ssql = "INSERT INTO MFExcursionTransactionDiscount VALUES("
    ssql += "'" + SESSION.transaction_mf + "',"
    ssql += "'" + item.idx_transaction + "',"
    ssql += "'" + item.idx_promo + "',"
    ssql += "'" + item.value_promo + "',"
    ssql += "'" + item.idx_trnpromo + "',"
    ssql += "'" + "0" + "')";

    sql(ssql, function (result) {
        if (result.rowsAffected == 1) {
            if (data.length != 0) {
                data.shift();
            }
            if (data.length != 0) {
                checkout_insert_tr_discount_next(data, callback);
            } else {
                callback();
            }
        } else {
            $loader.hide();
            $app.alert('Error saving: ' + ssql, 'fn: checkout_insert_tr_discount_next');
        }
    });
}

function checkout_insert_tr_namelist(callback) {
    result = guest_form_get();

    if (result.length != 0) {
        checkout_insert_tr_namelist_next(result, callback);
    } else {
        callback();
    }
}
function checkout_insert_tr_namelist_next(input, callback) {
    var data = input;
    var item = data[0];

    ssql = "INSERT INTO MFExcursionNameList VALUES("
    ssql += "'" + SESSION.transaction_mf + "',"
    ssql += "'" + item.id_transaction + "',"
    ssql += "'" + parseESC(item.guest_title) + "',"
    ssql += "'" + parseESC(item.guest_fullname) + "',"
    ssql += "'" + parseESC(item.guest_age) + "',"
    ssql += "'" + $SETTINGS.user.name + "',"
    ssql += "'" + SESSION.transaction_date + "',"
    ssql += "'" + $SETTINGS.user.name + "',"
    ssql += "'" + SESSION.transaction_date + "',"
    ssql += "'" + $.uuid() + "')";

    sql(ssql, function (result) {
        if (result.rowsAffected == 1) {
            if (data.length != 0) {
                data.shift();
            }
            if (data.length != 0) {
                checkout_insert_tr_namelist_next(data, callback);
            } else {
                callback();
            }
        } else {
            $loader.hide();
            $app.alert('Error saving: ' + ssql, 'fn: checkout_insert_tr_namelist_next');
        }
    });
}