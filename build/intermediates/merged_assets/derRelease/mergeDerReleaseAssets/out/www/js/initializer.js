var SESSION = {
    transaction_mf: '', /* must generated at app reset */
    transaction_number: '', /* must generated at app reset */
    transaction_number_last: '', /* must initialize at app reset */
    transaction_id: '',
    transaction_date: '',
    transaction_voucher_code: '',
    transaction_voucher_disc: 0,
    transaction_payment: 0
}

var label_pot = 'Pay on Tour';

$(document).ready(function () {
    // nothing
});

function reset_session_variable() {
    // save last number
    SESSION.transaction_number_last = SESSION.transaction_number;

    // reset
    SESSION.transaction_mf = $.uuid().replace(/\-/g, '');
    SESSION.transaction_number = '';
    SESSION.transaction_id = '';
    SESSION.transaction_voucher_code = '';
    SESSION.transaction_voucher_disc = 0;
    SESSION.transaction_payment = 0;


}

function reset_form_field() {
    // clear main form
    RESET.input_location();
    RESET.input_excursion();
    RESET.input_agent();
    RESET.input_hotel_area();
    RESET.input_pickup_time();
    RESET.input_room();
    RESET.input_tour_date();
    RESET.input_pax();

    // re-enable
    $(div_search_agent).removeClass('disabled');

    // clear payment form
    $('#checkout-firstname').val('');
    $('#checkout-lastname').val('');
    $('#checkout-email').val('');
    $('#checkout-phone').val('');
}

function reset_transaction(is_online, callback) {
    $loader.show();
    //$status.set('RESETTING CART');

    // remove session to prevent continue booking at app start
    drop_incomplete_online_session(function () {
        // remove all cart items
        cart_item_remove(is_online, '', false, function () {
            callback();
        });
    });
}

function initialize_variable(is_online, callback) {
    $loader.show();
    //$status.set('INITIALIZE VARIABLES');

    reset_session_variable();
    reset_form_field();

    if ($SETTINGS.initial_company == 'GKT') {
        label_pot = 'Bill on Room';
    }

    // generate new session code
    get_voucher(is_online, function (voucher) {
        initialize_ui_info(null, is_online, function () {
            callback();
        });
    });
}


function initialize_loroparque(is_online, callback) {
    $SETTINGS.loroparque = '';
    var file_lp = '';
    if ($SETTINGS.lp_status == 'true') {
        $status.set('INITIALIZE LOROPARQUE');
        $.ajax({
            url: get_core_jsonfile('', $SETTINGS.lp_status_dev + '.json'),
            type: 'GET',
            dataType: 'json',
            success: function (result) {
                $SETTINGS.loroparque = result;

                $lp.init(result, function (r) {

                    $buffer_arrInsercion = [];
                    //$buffer_arrResultInsercion      = [];

                    $SETTINGS.loroparque.clienteAPI = {
                        "Id": result.login.id,
                        "Token": r.DatosResult
                    };
                    callback(result);

                })
            }, error: function (e) {
                console.log(e);
                if (e.status == '404') {
                    alert('Loroparque is not available, Please check on your setting, set NO in module integration loroparque')
                    $SETTINGS.lp_status = 'false';
                    $SETTINGS.loroparque = '';
                }
                callback();

                $loader.hide();
            }
        });
    } else {
        callback('lp_false')
    }
}

function review_unfinished_transaction(action) {
    cart_item_check(function (cart_item, is_valid, is_online) {
        var mode = is_online ? 'online' : 'offline';

        if (cart_item.length > 0 && is_valid) {

            $loader.hide();
            $app.modal({
                title: $STRING.info_confirmation,
                text: 'You have <b style="color:red;">' + cart_item.length + ' unfinished ' + mode + '</b> transaction!',
                buttons: [
                    {
                        text: 'Continue',
                        bold: true,
                        onClick: function () {
                            set_voucher(cart_item[0].exc_numb);
                            initialize_ui_info(cart_item, is_online, function () {
                                action.session_continue(cart_item);
                            });
                        }
                    },
                    {
                        text: 'Reset',
                        onClick: function () {
                            action.session_reset();
                        }
                    }]
            });

        } else {
            action.session_reset();
        }
    });
}

function initialize_ui_info(cart_item, is_online, callback) {
    var username = $SETTINGS.user.name.trim();
    username = username.length > 12 ? username.split(' ')[username.split(' ').length - 1] : username;

    var cart_count = !is_empty_object(cart_item) ? cart_item.length : 0;

    $MODE = is_online ? 'online' : 'offline';

    $('#lbl-nav-info-user').text(username);
    $('#lbl-nav-info-code').text(SESSION.transaction_number);
    $('#lbl-nav-info-cart').text(cart_count);
    $('#lbl-nav-info-mode').text($MODE.toUpperCase());
    $('#switch-mode').prop('checked', $MODE == 'online' ? true : false);

    if (cart_count > 0) {
        if (is_online) {
            SESSION.transaction_mf = cart_item[0].idx_mfexcursion;
        }

        initialize_input_agent(cart_item[0].idx_client, function () {
            callback();
        });
    } else {
        callback();
    }
}

function initialize_input_agent(id, callback) {
    var ssql = "SELECT UPPER(name_a) AS agent, UPPER(idx_a) AS idx_agent FROM MSAgent WHERE idx_a = '" + id + "';";
    sql_data(ssql, function (result) {
        $agent.value = result;

        $(div_search_agent).find('input[type=text]').val(result[0].agent);
        $(div_search_agent).find('input[type=hidden]').val(id);
        $(div_search_agent).addClass('disabled');

        callback();
    });
}

function set_voucher(number) {
    SESSION.transaction_number = number;
}
function get_voucher(is_online, callback) {

    $status.set('GENERATING SESSION NUMBER');

    if (($MODE == "offline" && is_online) || ($MODE == "online" && is_online)) {
        $loader.show();

        var module = get_core_module();
        var serialize = '&act=form-generate-number'
        serialize += '&idrep=' + $SETTINGS.user.id
        serialize += '&idcom=' + $SETTINGS.branch.id

        $.ajax({
            url: module,
            data: serialize,
            dataType: 'json',
            success: function (result) {
                SESSION.transaction_number = result[0].exnumber;
                callback(result[0].exnumber);
            }
        });
    } else {
        ssql_load('GET_TRANSACTION_NUMBER', 'ALL', function (ssql_data) {
            ssql = ssql_data.script;

            ssql = ssql.replace(/@:initial:/g, $SETTINGS.initial_user);
            ssql = ssql.replace(/@:year:/g, date_format(get_date(), 'yyMMdd'));
            ssql = ssql.replace(/@:nik_len:/g, $SETTINGS.length_of_voucher_number);
            ssql = ssql.replace(/@:nik_len_min1:/g, parseInt($SETTINGS.length_of_voucher_number) - 1);

            sql(ssql, function (result) {
                SQL_ROWS = result.rows;
                SQL_ARRAY = arr_props_to_lower(SQL_ROWS._array);

                SESSION.transaction_number = SQL_ARRAY[0].random;
                callback(SQL_ARRAY[0].random);
            });
        });
    }
}

function read_incomplete_online_session(callback) {
    var today = get_date();
    var ssql = "SELECT value, description FROM config WHERE name='incomplete_online_session';";
    sql_data(ssql, function (result) {
        if (result.length > 0) {
            if (result[0].value == today) {
                callback(result, true);
            } else {
                callback(result, false);
            }
        } else {
            callback(result, false);
        }
    });
}
function push_incomplete_online_session(callback) {
    read_incomplete_online_session(function (result, is_valid_session) {
        save_incomplete_online_session(result.length > 0, function () {
            callback();
        });
    });
}
function save_incomplete_online_session(exist, callback) {
    var today = get_date();
    var ssql_insert = "INSERT INTO config VALUES('incomplete_online_session', 'string', '" + today + "', '" + SESSION.transaction_mf + "');";
    var ssql_update = "UPDATE config SET value='" + today + "', description='" + SESSION.transaction_mf + "' WHERE name='incomplete_online_session';";
    var ssql = exist ? ssql_update : ssql_insert;

    sql(ssql, function (result) {
        callback();
    });
}
function drop_incomplete_online_session(callback) {
    var ssql = "DELETE FROM config WHERE name='incomplete_online_session';";

    sql(ssql, function (result) {
        callback();
    });


    if ($SETTINGS.lp_status == 'true') {
        exec_Sql(dbwebsql_lp, "DELETE FROM trx_header");
        exec_Sql(dbwebsql_lp, "DELETE FROM trx_item");
        exec_Sql(dbwebsql_lp, "DELETE FROM trx_itemBono");
    }
}