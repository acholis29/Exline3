    function cart_open() {
        var is_online   = $MODE == 'online' ? true : false;
        var count       = $('#lbl-nav-info-cart').text();

        if(count=='0') {
            $app.alert('Cart is empty!', $STRING.info_information);
            return false;
        }

        cart_item_list(is_online, function() {
            $main_view.router.loadPage('#cart');
            $loader.hide();
        });       
    }

    function cart_item_count() {
        return $('#cart-items li').length;
    }

    function cart_item_check(callback) {
        read_incomplete_online_session(function(result, is_valid_session) {
            if(is_valid_session) {
                $status.set('CHECKING CART ITEMS');
                $.ajax({
                    url: get_core_module(),
                    data: '&act=tmp-mf-header-list&idmf=' + result[0].description,
                    dataType: 'json',
                    success: function(result)
                    {
                        callback(result, true, true);
                    }
                });
            } else {
                var ssql = "SELECT * FROM TMP_MFExcursionTransactionHeader;";
                sql_data(ssql, function(result) {
                    if(result.length>0) {
                        var booking_date = result[0].crea_date.substr(0, 10);
                        var today        = get_date();

                        if(booking_date==today) {
                            // valid session
                            callback(result, true, false);
                        } else {
                            // expired
                            callback(result, false, false);
                        }
                    } else {
                        callback(result, false, false);
                    }
                });
            }
        });
    }

    function cart_item_remove_confirm() {
        var $root = $(this).parent().parent().parent();
        var $data = $root.data('item');
                        
        $app.modal({
            title:  'Remove Transaction',
            text: 'Are you sure to remove <br /><b>'+$data.excursion+'</b> from cart item(s)?',
            buttons: [
            {
                text: 'Yes',
                bold: true,
                onClick: function() {
                    var is_online = $MODE == 'online' ? true : false;

                    cart_item_remove(is_online, $data.idx_transaction, true, function() {
                        cart_item_list(is_online, function() {
                            if(cart_item_count() == 0) {
                                // reset all required!
                                checkout_reset(is_online, function() {
                                    $main_view.router.back();
                                    $loader.hide();
                                });
                            } else {
                                $loader.hide();
                            }
                        });
                    });
                }
            },
            {
                text: 'No',
                onClick: function() {
                    console.log('Action aborted!');
                }
            }]
        });        
    }
    
    function cart_item_remove(is_online, id_transaction, show_alert, callback) {
    
        $loader.show();
        $status.set(id_transaction ? 'REMOVING ITEM' : 'RESETING CART');

        if(!id_transaction.length) {
            $('#lbl-nav-info-cart').text('0');
        }

        if(($MODE=="offline" && is_online) || ($MODE=="online" && is_online)) {
			$.ajax({
				url: get_core_module(),
				data: '&act=form-cart-remove&idmf=' + SESSION.transaction_mf + '&idtr=' + id_transaction,
				success: function(result)
				{
                    // remove web SQL loroparque
                    if($SETTINGS.lp_status=='true'){
                       $lp.delete_trx_websql(SESSION.transaction_mf, id_transaction)
                    }

                    if(show_alert) {
                        $loader.hide();
                        $app.alert('Transaction was removed!', 'Success', function() {
                            callback();
                        });
                    } else {
                        callback();
                    }
                    
				}
			});            
        } else {
            
            cart_item_remove_promotion(id_transaction, function() {

            ssql_load('DELETE_TMP_SURCHARGE', 'ALL', function(ssql_data) {
                ssql = ssql_data.script;
                ssql = ssql.replace(/@:id_transaction:/g, id_transaction);
                sql(ssql, function(result) {
                         
            ssql_load('DELETE_TMP_ITEM', 'ALL', function(ssql_data) {
                ssql = ssql_data.script;
                ssql = ssql.replace(/@:id_transaction:/g, id_transaction);
                sql(ssql, function(result) {
                                   
            ssql_load('DELETE_TMP_HEADER', 'ALL', function(ssql_data) {
                ssql = ssql_data.script;
                ssql = ssql.replace(/@:id_transaction:/g, id_transaction);
                sql(ssql, function(result) {
                    
                    if(show_alert) {
                        $loader.hide();
                        if(result.rowsAffected > 0) {
                            $app.alert('Transaction was removed!', 'Success', function() {
                                callback();
                            });
                        } else {
                            $app.alert('Operation failed!', 'Failed', function() {
                                callback();
                            });
                        }
                    } else {
                        callback();
                    }
    
            }); }); }); }); }); }); });
        }
        
    }
    
    function cart_item_list(is_online, callback) {

        $status.set('LISTING CART ITEMS');

        var need_promotion_reapply = false;
        
        // total payment reset
        SESSION.transaction_payment = 0;
        
        $loader.show();
        if(($MODE=="offline" && is_online) || ($MODE=="online" && is_online)) {

            var promo_code = SESSION.transaction_voucher_code; // remember, only for HOF code

            $.ajax({
                url: get_core_module(),
                data: '&act=form-cart-list&mf=' + SESSION.transaction_mf + '&pr=' + promo_code + '&idl='+$SETTINGS.language.id,
                dataType: 'json',
                success: function(result)
                {
                    var buffer  = '';
                    var data    = arr_props_to_lower(result);

                    $('#lbl-nav-info-cart').text(data.length);
                    $('#lbl-len-info-cart').text(data.length+' '+$MODE+' '+'transaction(s)');

                    for(var i=0; i<data.length; i++) {
                        buffer += buffer_item_cart(data[i]);
                    }

                    // calc in buffer, this code must be here after looping
                    // then make it only two decimal
                    SESSION.transaction_payment = SESSION.transaction_payment.toFixed(2);
                    $('.cart-total-payment').text(format_currency(SESSION.transaction_payment, false)+' '+$SETTINGS.currency.name);

                    $('#cart-items').empty();
                    $('#cart-items').append(buffer);

                    callback();
                }
            });

        } else {
            /*
                column description:
                - promo:        appear in the promotional line, generated by applying [voucher] // deprecated
                - promotion:    appear in the promotional line, generated by applying [p-code]
                - disc1:        appear in the discount line, generated automatically by the script
                                (discountvalue x pax)

                note: promo, promotion, disc1 are combinable

                ssql parameter note:
                - @:promo_code: is useless, because all promotion is handled manually by me
            */

            ssql_load('LIST_CART_DCPI', 'ALL', function(ssql_data) {
                ssql = ssql_data.script;

                ssql = ssql.replace(/@:id_mf:/g,        SESSION.mf_booking);
                ssql = ssql.replace(/@:promo_code:/g,   '');
                ssql = ssql.replace(/@:id_market:/g,    $SETTINGS.market.id);

                sql(ssql, function(result) {
                    var discount_combination = []
                    var buffer  = '';

                    SQL_ROWS    = result.rows;
                    SQL_ARRAY   = arr_props_to_lower(SQL_ROWS._array);

                    $('#lbl-nav-info-cart').text(SQL_ROWS.length);
                    $('#lbl-len-info-cart').text(SQL_ROWS.length+' '+$MODE+' '+'transaction(s)');

                    for(var i=0; i<SQL_ARRAY.length; i++) {
                        buffer += buffer_item_cart(SQL_ARRAY[i]);

                        // discount combination update (buffer)
                        //
                        // 4th discount only available if transaction items are less than 3 in cart!
                        // OR can't be applied if promo field is not zero.
                        var n_discount  = !isNaN(parseFloat(SQL_ARRAY[i].disc1))? SQL_ARRAY[i].disc1                : 0;
                            n_discount  = n_discount == 0                       ? SESSION.transaction_voucher_disc  : n_discount;
                        discount_combination.push({
                            id_transaction: SQL_ARRAY[i].idx_transaction,
                            value: n_discount
                        });

                    }

                    console.log(discount_combination)
                    // discount combination update (update)
                    cart_item_apply_combination(discount_combination, function() {

                        // calc in buffer, this code must be here after looping
                        SESSION.transaction_payment = SESSION.transaction_payment.toFixed(2); // 3.0.47
                        $('.cart-total-payment').text(format_currency(SESSION.transaction_payment, false)+' '+$SETTINGS.currency.name);

                        $('#cart-items').empty();
                        $('#cart-items').append(buffer);

                        callback();

                    });

                });
            });
        }
    }

    function cart_item_insert_header(date, callback) {
        var id_mf   = 'MF_INDEX'; //-- online
        
        if($MODE=="online") {
        
        } else {
            ssql_load('INSERT_TMP_HEADER', 'ALL', function(ssql_data) {
                ssql = ssql_data.script;
                
                ssql = ssql.replace(/@:tr_number:/g,        $('#lbl-nav-info-code').text());
                ssql = ssql.replace(/@:id_excursion:/g,     $excursion.value[0].idx_excursion);
                ssql = ssql.replace(/@:id_excursub:/g,      $excursion.value[0].idx_sub);
                ssql = ssql.replace(/@:time_pickup:/g,      $('#i-allotment-calendar').val()+' '+$('#i-pickuptime').val());
                ssql = ssql.replace(/@:id_hotel:/g,         $hotel_area.value[0].idx_hotel);
                ssql = ssql.replace(/@:room:/g,             parseESC($('#i-room').val()));
                ssql = ssql.replace(/@:id_agent:/g,         $agent.value[0].idx_agent);
                ssql = ssql.replace(/@:id_supplier:/g,      $excursion.value[0].idx_supplier);
                ssql = ssql.replace(/@:remark:/g,           parseESC($('#detail-remark1').val()));
                ssql = ssql.replace(/@:remark_supplier:/g,  parseESC($('#detail-remark2').val()));
                ssql = ssql.replace(/@:id_transaction:/g,   SESSION.transaction_id);
                ssql = ssql.replace(/@:id_market:/g,        $SETTINGS.market.id);
                ssql = ssql.replace(/@:user:/g,             $SETTINGS.user.name);
                ssql = ssql.replace(/@:date:/g,             date);
                ssql = ssql.replace(/@:lbl_excursion:/g,    $excursion.value[0].excursion);
                ssql = ssql.replace(/@:lbl_hotel:/g,        $hotel_area.value[0].hotel);
                ssql = ssql.replace(/@:lbl_currency:/g,     $SETTINGS.currency.name);
                ssql = ssql.replace(/@:lbl_price:/g,        get_total_price_detail(false));
                ssql = ssql.replace(/@:lbl_excursub:/g,     $excursion.value[0].sub_excursion);
                ssql = ssql.replace(/@:proceed_allotment:/g, '0');
                      //SELECTED.tmp.allotment_index+'|'+SELECTED.tmp.allotment_available+'|'+SELECTED.tmp.allotment_used
                
                sql(ssql, function(result) {
                    SQL_ROWS = result.rows;
                    
                    if(result.rowsAffected == 1) {
                        callback();
                    } else {
                        $app.alert('Error saving: '+ssql, 'fn: cart_item_insert_header');
                    }
                });
            });
        }
    }
    
    function cart_item_insert_all(date, data, callback) {
        
        if(data.length == 0) {
            console.log('No data to be save! See cart_item_insert_all() for details.');
            callback();
        }
    
        switch(data[0].type) {
            case 'pax':
                cart_item_insert_pax(date, data[0].price, data[0].charge_type, data[0].pax, data[0].age, function() {
                                
                    if(data.length != 0) {
                        data.shift();
                    }
                                  
                    if(data.length != 0) {
                        cart_item_insert_all(date, data, callback);
                    } else {
                        callback();
                    }
    
                });
                break;
            case 'surcharge':
                cart_item_insert_surcharge(date, data[0].price, data[0].id_surcharge, function() {
                                 
                    if(data.length != 0) {
                        data.shift();
                    }
                                       
                    if(data.length != 0) {
                        cart_item_insert_all(date, data, callback);
                    } else {
                        callback();
                    }
    
                });
                break;
            default:
                console.log('case error: cart_item_insert_all')
        }
    
    }
    function cart_item_insert_pax(date, price, aci, pax, age, callback) {
        var uuid        = $.uuid();
        var total_price = get_pupp() == 'Per Pax' ? parseInt(pax) * parseFloat(price) : parseFloat(price);
        
        if($MODE=="online") {
            
        } else {
            ssql_load('INSERT_TMP_ITEM', 'ALL', function(ssql_data) {
                ssql = ssql_data.script;
                      
                ssql = ssql.replace(/@:id_transaction:/g,   SESSION.transaction_id);
                ssql = ssql.replace(/@:aci:/g,              aci);
                ssql = ssql.replace(/@:pax_qty:/g,          pax);
                ssql = ssql.replace(/@:age:/g,              age);
                ssql = ssql.replace(/@:salesrate:/g,        price);
                ssql = ssql.replace(/@:id_currency:/g,      $SETTINGS.currency.id);
                ssql = ssql.replace(/@:total_salesrate:/g,  total_price);
                ssql = ssql.replace(/@:newid:/g,            uuid);
                ssql = ssql.replace(/@:user:/g,             $SETTINGS.user.name);
                ssql = ssql.replace(/@:date:/g,             date);
                      
                sql(ssql, function(result) {
                    SQL_ROWS = result.rows;
                          
                    if(result.rowsAffected == 1) {
                        callback();
                    } else {
                        $app.alert('Error saving: '+ssql, 'fn: cart_item_insert_pax');
                    }
                });
            });
        }
    }
    function cart_item_insert_surcharge(date, price, id_surcharge, callback) {
        var uuid        = $.uuid();
        
        if($MODE=="online") {
            
        } else {
            ssql_load('INSERT_TMP_SURCHARGE', 'ALL', function(ssql_data) {
                ssql = ssql_data.script;
                      
                ssql = ssql.replace(/@:tr_number:/g,        $('#lbl-nav-info-code').text());
                ssql = ssql.replace(/@:id_transaction:/g,   SESSION.transaction_id);
                ssql = ssql.replace(/@:id_surcharge:/g,     id_surcharge);
                ssql = ssql.replace(/@:price:/g,            price);
                ssql = ssql.replace(/@:newid:/g,            uuid);
                ssql = ssql.replace(/@:user:/g,             $SETTINGS.user.name);
                ssql = ssql.replace(/@:date:/g,             date);
                      
                sql(ssql, function(result) {
                    SQL_ROWS = result.rows;
                          
                    if(result.rowsAffected == 1) {
                        callback();
                    } else {
                        $app.alert('Error saving: '+ssql, 'fn: cart_item_insert_surcharge');
                    }    
                });
            });
        }
    }

    /*  VOUCHER & PROMOTIONAL 
        MODULES
    
    */

    function cart_promotion_dialog(reapply, type, code, value, pv, id) {
        $('#promotion-select').text(code);
        $('#promotion-select').data('type', type);
        $('#promotion-select').data('code', code);
        $('#promotion-select').data('value', value);
        $('#promotion-select').data('pv', pv);
        $('#promotion-select').data('id', id);

        if(!reapply) {
            $('#promotion-info-reapply').hide();
            $('#promotion-close').show();
        } else {
            $('#promotion-info-reapply').show();
            $('#promotion-close').hide();
        }

        cart_list_validate_promotion(code, function(result) {
            cart_list_validate_confirm(result, function() {
                $loader.hide();
                $app.popup('.popup-promotion');
            });
        });
    }
    
    function cart_promotion_apply(array_data, callback) {
        console.log('cart promotion')
        console.log(array_data[0])
        var $apply_to   = array_data;
        var $li         = $apply_to[0];
        var $promotion  = $('#promotion-select');
        var promo_type  = $promotion.data('type');
        var promo_code  = $promotion.data('code');
        var promo_id    = $promotion.data('id');
        var promo_value = $promotion.data('value');
        var promo_pv    = $promotion.data('pv'); // promo 'P' only
        
        if(promo_type == 'online') {
    
            cart_item_apply_voucher($li.idx_transaction, promo_code, promo_value, function() {
                if($apply_to.length != 0) {
                    $apply_to.shift();
                }
                    
                if($apply_to.length != 0) {
                    cart_promotion_apply($apply_to, callback);
                } else {
                    callback();
                }
            });
    
        } else {
            // only 'P' discount was allowed to be stored in tmp_discount table, 
            // the rest is only stored in tmp_header

            var n_amount    = $MODE == 'online' ? $li.amount : $li.price;
            var x_value     = 0;

            if(string_to_boolean($SETTINGS.discount_before_surcharge)) {
                // calc from total pax only
                n_amount    = $MODE == 'online' ? $li.total_price_pax : $li.total_price_pax;
                //x_value     = get_percent_value( parseFloat(n_amount), parseInt(promo_value) );
            } else {
                // calc from total pax + total surcharge
                n_amount    = $MODE == 'online' ? $li.amount : $li.price;
                //x_value     = get_percent_value( parseFloat(n_amount), parseInt(promo_value) );
            }

            // 3.0.40 (fail on gvi)
            //x_value     = promo_pv == 'P' ? get_percent_value(parseFloat(n_amount), parseFloat(promo_value)) : parseFloat(promo_value);

            // 3.0.45 (2019-01-02)
            switch(promo_pv) {
            case 'V':
                x_value = parseFloat(promo_value);
                break;
            case 'P':
            default:
                x_value = get_percent_value(parseFloat(n_amount), parseFloat(promo_value));
                break;
            }

            cart_item_apply_promotion($li.idx_transaction, promo_id, x_value, function() {
                if($apply_to.length != 0) {
                    $apply_to.shift();
                }
                    
                if($apply_to.length != 0) {
                    cart_promotion_apply($apply_to, callback);
                } else {
                    callback();
                }
            });
        }
    }
    
    function cart_list_find_checked() {
        var buffer = [];
        $('#promotion-apply-to li').each(function(i, e) {
            var $this       = $(e),
                $data       = $this.data('item'),
                $checbox    = $this.find('input[type=checkbox]');
    
            if($checbox.is(':checked')) {
                buffer.push($data);
            }
        }); 
        return buffer;
    }

    // discount validation
    // will deprecated: mts is only for test, please delete
    /*
    function cart_list_validate_exception() {
        var exception = [
            'GVI','GVS'
        ];

        for(var i=0; i<exception.length; i++) {
            if($SETTINGS.initial_company.toUpperCase() == exception[i]) {
                return true;
            }
        }
        return false;
    }
    */

    function cart_list_validate_promotion(code, callback) {
        var $li = $('#cart-items li');
        var arr = [];
        //var ide = '';

        //if(!cart_list_validate_exception()) {
        if(string_to_boolean($SETTINGS.discount_validation)) {
            $li.each(function(i,e) {
                var $this = $(e);
                var $data = $this.data('item');

                arr.push($data.idx_excursion);
            });
            //ide = arr.join('~');

            $loader.show();
            $status.set('VALIDATING CODE');

            var module       = get_core_module();
            var serialize    = '&act=form-cart-promotion-validate'
                serialize   += '&code='+code
                serialize   += '&ida='+$agent.value[0].idx_agent
                serialize   += '&ide='+arr.join('~')

            $.ajax({
                url: module,
                data: serialize,
                dataType: 'json',
                success: function(data) {

                    callback(data);

                }
            });
        } else {
            // exception match!
            // skip online validation, show all cart item

            $li.each(function(i,e) {
                var $this = $(e);
                var $data = $this.data('item');

                arr.push({'idx_excursion' : $data.idx_excursion});
            });
            callback(arr);
        }
    }

    function cart_list_validate_confirm(result, callback) {
        var $li     = $('#cart-items li');
        var buffer  = '';
    
        $li.each(function(i,e) {
            var $this = $(e);
            var $data = $this.data('item');

            if(find_array_by_key($data.idx_excursion, result, 'idx_excursion')) {
            buffer += '<li data-item=\''+JSON.stringify($data)+'\'>';
            buffer += '<label class="label-checkbox item-content">';
            buffer += '    <input type="checkbox" checked '+($('#promotion-select').data('type') == 'online' ? 'disabled' : '')+'>';
            buffer += '    <div class="item-media">';
            buffer += '        <i class="icon icon-form-checkbox"></i>';
            buffer += '    </div>';
            buffer += '    <div class="item-inner border-clear">';
            buffer += '        <div class="item-title" style="margin-top:-10px; white-space:normal;">';
            buffer += '            <b >['+$data.pickup.substr(0, 10)+'] <span style="font-weight:100;">'+$data.excursion+'</span></b>';
            buffer += '        </div>';
            buffer += '    </div>';
            buffer += '</label>';
            buffer += '</li>';
            }
        });

        if(buffer.length == 0) {
            buffer += '<li >';
            buffer += '<label class="label-checkbox item-content disabled">';
            buffer += '    <input type="checkbox" >';
            buffer += '    <div class="item-media">';
            buffer += '        <i class="icon icon-form-checkbox"></i>';
            buffer += '    </div>';
            buffer += '    <div class="item-inner border-clear">';
            buffer += '        <div class="item-title" style="margin-top:-10px; white-space:normal;">';
            buffer += '            <b >NO VALID PRODUCT</b>';
            buffer += '        </div>';
            buffer += '    </div>';
            buffer += '</label>';
            buffer += '</li>';
        }
    
        $('#promotion-apply-to').empty();
        $('#promotion-apply-to').append(buffer);
    
        callback();
    }

    function cart_item_apply_combination(records, callback) {
        // DISCOUNT COMBINATION UPDATER
        //
        console.log('DISCOUNT COMBINATION UPDATER');

        if($MODE == 'online') {
            // no need to do this
            // done in stored procedure
        } else {
            if(records.length) {
                var record          = records;
                var record_active   = record[0];

                var ssql_update = "UPDATE TMP_MFExcursionTransactionHeader SET promo = '"+record_active.value+"' WHERE idx_transaction LIKE '%"+record_active.id_transaction+"%'; ";

                sql(ssql_update, function(result) {
                    // next
                    if(record.length!=0) {
                        record.shift();
                    }

                    if(record.length!=0) {
                        cart_item_apply_combination(record, callback);
                    } else {
                        callback();
                    }
                });
            } else {
                callback();
            }
        }
    }

    function cart_item_apply_voucher(id_transaction, code, value, callback) {
        // PROMO HOF UPDATER
        console.log('PROMO HOF UPDATER');

        if($MODE == 'online') {

            $status.set('UPDATING PROMOTION');

            // promo HOF doesn't need to update
            // stored procedure (APP3X_CART_LIST) will do it automatically

            SESSION.transaction_voucher_code = code;
            SESSION.transaction_voucher_disc = value;
            callback();

        } else {
            var ssql_update = "UPDATE TMP_MFExcursionTransactionHeader SET promo = '"+value+"' WHERE idx_transaction LIKE '%"+id_transaction+"%'; ";

            sql(ssql_update, function(result) {
                SESSION.transaction_voucher_code = code;
                SESSION.transaction_voucher_disc = value;

                callback();
            });
        }
    }
    
    function cart_item_apply_promotion(id_transaction, id_promotion, value, callback) {
        // only 'P' discount was allowed to be stored in tmp_discount table, 
        // the rest is only stored in tmp_header
        var uuid        = $.uuid();
    
        cart_item_remove_promotion(id_transaction, function() {

            $status.set('APPLYING PROMOTION');

            if($MODE == 'online') {
                var buffer   = '';
                buffer		+= " DELETE FROM TMP_MFExcursionTransactionDiscount "
                buffer      += " WHERE idx_transaction = '"+id_transaction+"'; "

                buffer		+= " INSERT INTO TMP_MFExcursionTransactionDiscount SELECT "
                buffer      += " '"+SESSION.transaction_mf+"', "
                buffer      += " '"+id_transaction+"', "
                buffer      += " '"+id_promotion+"', "
                buffer      += " '"+value+"', "
                buffer      += " '"+$.uuid()+"'; "

                var module       = get_core_module();
                var serialize    = '&act=form-cart-promotion-add'
                    serialize   += '&data='+(buffer)
    
                $.ajax({
                    url: module,
                    data: serialize,
                    success: function(data) {
        
                        callback(); 
        
                    }
                });
            } else {
                ssql_load('INSERT_TMP_DISCOUNT', 'ALL', function(ssql_data) {
                    ssql = ssql_data.script;
                            
                    ssql = ssql.replace(/@:id_mf:/g,            '');
                    ssql = ssql.replace(/@:id_transaction:/g,   id_transaction);
                    ssql = ssql.replace(/@:id_promo:/g,         id_promotion);
                    ssql = ssql.replace(/@:promo_value:/g,      value);
                    ssql = ssql.replace(/@:newid:/g,            uuid);
                                
                    sql(ssql, function(result) {
                        if(result.rowsAffected == 1) {
                            callback();
                        } else {
                            $app.alert('Error saving: '+ssql, 'fn: cart_item_apply_promotion', function() {
                                callback();
                            });
                        }    
                    });
                });
            }
                
        });
    }

    function cart_item_remove_voucher(callback) {
        SESSION.transaction_voucher_code = '';
        SESSION.transaction_voucher_disc = 0;

        cart_item_apply_voucher('', '', '0', function() {
            callback();
        });
    }

    function cart_item_remove_promotion(id_transaction, callback) {

        $loader.show();
        $status.set('RESETING PROMOTION');

        if($MODE == 'online') {
            
            if(id_transaction) {
                // skip, do it directly when applying
                callback(); 
            } else {
                // reset only
                var buffer   = '';
                buffer		+= " DELETE FROM TMP_MFExcursionTransactionDiscount "
                buffer      += " WHERE idx_mfexcursion = '"+SESSION.transaction_mf+"';" // bersambung
            
                var module       = get_core_module();
                var serialize    = '&act=form-cart-promotion-remove'
                    serialize   += '&data='+(buffer)

                $.ajax({
                    url: module,
                    data: serialize,
                    success: function(data) {
        
                        callback(); 
        
                    }
                });
            } 

        } else {
            ssql_load('DELETE_TMP_DISCOUNT', 'ALL', function(ssql_data) {
                ssql = ssql_data.script;
                ssql = ssql.replace(/@:id_transaction:/g, id_transaction);
                sql(ssql, function(result) {
    
                    callback();
    
                });
            });
        }

    }

    function cart_promotion_search(keyword) {
        var buffer = '';

        ssql     = " SELECT * FROM MSPromotion WHERE Code LIKE '%"+ keyword +"%' "
        //ssql    += " AND date(exp_date)>=date('"+get_date()+"') ";
    
        sql(ssql, function(result) {
            SQL_ROWS  = result.rows;
            SQL_ARRAY = arr_props_to_lower(SQL_ROWS._array);
    
            if(SQL_ARRAY.length != 0) {
                // search offline
    
                for(var i=0; i<SQL_ARRAY.length; i++) {
                    buffer += buffer_item_promotion('offline', SQL_ARRAY[i]);
                }
                $('#promotion-info').empty();
                $('#promotion-info').append('Search result for \'<b>'+keyword+'</b>\'.');
                $('#promotion-list').empty();
                $('#promotion-list').append(buffer);
                
            } else {
                // search online

                // UPDATE 2018-02-28
                // This feature only available in online mode and
                // cant be applied in offline mode due the system limitation

                if($MODE == 'online') {

                    if(keyword.length < 4) {
                        $('#promotion-list').empty();
                        $('#promotion-info').text((4-keyword.length)+' more character(s) to search online!');
                        return false;
                    }

                    $('#promotion-info').empty();
                    $('#promotion-info').append('Searching for \'<b>'+keyword+'</b>\' on server.');
                    $loader.show();
                    $.ajax({
                        dataType: 'json',
                        url: get_core_module(),
                        data: '&act=form-cart-promotion-list&search='+encodeURIComponent(keyword),
                        success: function(result)
                        {
                            for(var i=0; i<result.length; i++) {
                                buffer += buffer_item_promotion('online', result[i]);
                            }

                            $('#promotion-info').empty();
                            if(result.length != 0) {
                                $('#promotion-info').append('Search result for \'<b>'+keyword+'</b>\'.');
                            } else {
                                $('#promotion-info').append('Nothing found.');
                            }

                            $('#promotion-list').empty();
                            $('#promotion-list').append(buffer);
                            $loader.hide();
                        }
                    });

                } else {
                    $('#promotion-info').empty();
                    $('#promotion-info').append('Search result for \'<b>'+keyword+'</b>\'.');
                    $('#promotion-list').empty();
                }
            }
    
        });
        
    }

    function cart_insert_after() {
        var $label      = $('#lbl-nav-info-cart');
        var item_count  = parseInt($label.text());

        // update cart item count
        item_count++;
        $label.text(item_count);

        // disable agent & clear required fields
        $(div_search_agent).addClass('disabled');
        RESET.input_location();
        RESET.input_excursion();
        RESET.input_pickup_time();
        RESET.input_tour_date();
        
      


        $('#detail-remark1').val('');
        $('#detail-remark2').val('');

        // back to main form
        $main_view.router.back();

         // ask user for action
        $app.modal({
            title:  $STRING.save_success,
            text:   $STRING.cart_save_success,
            buttons: [
            {
                text: 'Continue',
                onClick: function() {
                    // direct open excursion search
                    $excursion.open();
                }
            },
            {
                text: 'Checkout',
                bold: true,
                onClick: function() {
                    // open cart, review booking!
                    cart_open();
                }
            }]
        });

        //----- reset relogin LP
        /*
        if ($SETTINGS.lp_status=='true'){
            $lp.init($SETTINGS.loroparque, function (r) {
                $SETTINGS.loroparque.clienteAPI = {
                    "Id": $SETTINGS.loroparque.login.id,
                    "Token": r.DatosResult
                };
                
               

            });
        }else{
            // ask user for action
            $app.modal({
                title:  $STRING.save_success,
                text:   $STRING.cart_save_success,
                buttons: [
                {
                    text: 'Continue',
                    onClick: function() {
                        // direct open excursion search
                        $excursion.open();
                    }
                },
                {
                    text: 'Checkout',
                    bold: true,
                    onClick: function() {
                        // open cart, review booking!
                        cart_open();
                    }
                }]
            });
        }
        */
        
    }