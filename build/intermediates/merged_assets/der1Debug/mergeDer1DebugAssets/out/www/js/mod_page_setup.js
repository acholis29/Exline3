function prompt_login() {
    $settings_view.router.load({
        url: 'setup_welcome.html'
    });
    app_page_view('.view-settings');
}

function get_company_info(domain, callback) {
    $loader.show();
    $status.set('LOADING COMPANY INFO');

    $.ajax({
        url: get_core_module(domain),
        data: 'act=settings-company-info',
        dataType: 'json',
        success: function(result)
        {
            var $input  = $('#settings-domain');

            $input.data('domain', $input.val());

            for(var i=0; i<result.length; i++) {
                // co_note1, co_note2 tidak digunakan

                // company info
                $f_settings.registration_id.set(result[i].co_index);
                $f_settings.company_active_date.set(result[i].active_date);
                $f_settings.company_name.set(result[i].co_name);
                $f_settings.company_alias.set(result[i].co_initial);
                $f_settings.address_of_company.set(result[i].co_address);
                $f_settings.phone.set(result[i].co_phone);
                $f_settings.hotline.set(result[i].co_hotline);
                $f_settings.tax_for_credit_card.set(result[i].cc_fee);
                $f_settings.cxl_policy.set(result[i].co_note3);
                $f_settings.other_information.set(result[i].co_note4);

            }

            callback(result);
        }
    });
}

function domain_apply(value, callback) {
    var $input      = $('#settings-domain');
    var http_domain = add_http(value.toLowerCase());

    if(!is_valid_domain(http_domain)) {
        $app.alert('Server or http domain is not valid!', 'Input required', function() {
            $input.data('domain', '');
            $input.val('').focus();
        });
        return false;
    }

    get_company_info(http_domain, function() {
        $f_settings.domain.set(http_domain);
        $f_settings.branch.set('', '');
        $f_settings.user.set('', '');
        $f_settings.market.set('', '');
        $f_settings.language.set('', '');
        $f_settings.currency.set('', '');

        callback();
    });
}

function user_login(callback) {
	var domain          = $('#settings-domain').data('domain');
	var $identity       = $('#login-input-userid');
	var $password       = $('#login-input-password');

	if($identity.val().length == 0) {
	    $app.alert('<b>User ID</b> is required!', $STRING.info_warning, function() {
	        $identity.focus();
	    });
        return false;
	}
	if($password.val().length == 0) {
	    $app.alert('<b>Password</b> is required!', $STRING.info_warning, function() {
	        $password.focus();
	    });
        return false;
	}

    $loader.show();
    $status.set('VERIFYING ACCOUNT');

    $.ajax({
        url: get_core_module(domain),
        data: '&act=settings-account-login&usr=' + $identity.val() + '&pwd=' + $password.val(),
        dataType: 'json',
		success: function(result)
        {
			callback(result);
        }
    });
}

function reset_and_sync(callback) {
    $progress.update('setup-main', null, 'Buffering information');
    $progress.update('setup-detail', null, 'Buffering information');

    list_table_name(function(data) {
    database_reset(data, true, function() {
        // list master data base on input in settings form
        var server  = $f_settings.domain.get();
        var user    = $f_settings.user.get();
        var date    = $f_settings.company_active_date.get();

        ms_list(server, user, date, function() {
        ms_sync_all(server, user, date, function() {

            settings_save(function() {
                app_page_view('.view-main');
                $main_view.router.back();

                // work around!
                $('#app-title').addClass('re-center');

                // optional
                if (typeof callback === "function") {
                    callback();
                }
            });

        });});

    });});
}

function database_reset(data, keep_config, callback) {
    var x_data      = data;
    var table_name  = x_data[0];

    if((keep_config && table_name=='config') || table_name=='ssql') {
        if(x_data.length != 0) {
            x_data.shift();
        }
        if(x_data.length != 0) {
            database_reset(x_data, keep_config, callback);
        } else {
            callback();
        }
    } else {
        ssql = " DELETE FROM "+table_name+"; ";
        sql(ssql, function() {
            if(x_data.length != 0) {
                x_data.shift();
            }
            if(x_data.length != 0) {
                database_reset(x_data, keep_config, callback);
            } else {
                callback();
            }
        });
    }
}

function get_paygate(callback) {
	var domain = $('#settings-domain').data('domain');

    $loader.show();
    $status.set('LOADING PAYMENT GATE');

    $.ajax({
        url: get_core_paygate(domain),
        data: '&act=list',
        dataType: 'json',
		success: function(result)
        {
            callback(result);
        }
    });
}

function save_paygate(callback) {
    var $checked = $('#login-input-paygate').find(':checked').parents('li');
    var data     = [];

    $checked.each(function(i,e) {
        var $this = $(e);
        var $data = $this.data('item');

        data.push($data);
    });

    paygate_remove(function() {
        if(data.length!=0) {
            paygate_insert(data, function() {
                callback();
            });
        } else {
            callback();
        }
    });
}

function paygate_remove(callback) {
    var ssql        = "DELETE FROM config_paygate;";
    sql(ssql, function() {
        callback();
    });
}

function paygate_insert(paygate, callback) {
    var paygates    = paygate;
    var data        = paygate[0];
    var ssql        = "INSERT INTO config_paygate VALUES('"+data.name_provider+"','"+data.url_post+"','"+data.param_pay+"','"+data.idx_comp+"','"+data.status_dev+"');";

    sql(ssql, function() {
        if(paygates.length != 0) {
            paygates.shift();
        }
        if(paygates.length != 0) {
            paygate_insert(paygates, callback);
        } else {
            callback();
        }
    });
}