function get_price_online_all(pax_info, paxa, paxc, paxi, callback) {
    $status.set('LOADING PRICE');

    var module       = get_core_module();
    var serialize    = '&act=form-check-price-all-v2'
        serialize   += '&f='+generate_parameters('price_pax')
        serialize   += '&ide='+$excursion.value[0].idx_excursion
        serialize   += '&ids='+$excursion.value[0].idx_sub
        serialize   += '&idcom='+$SETTINGS.company.id
        serialize   += '&idhtl='+$hotel_area.value[0].idx_hotel
        serialize   += '&idcur='+$SETTINGS.currency.id
        serialize   += '&idgen='+$agent.value[0].idx_agent
        serialize   += '&td='+$('#i-allotment-calendar').val()
        serialize   += '&pa='+paxa
        serialize   += '&pc='+paxc
        serialize   += '&pi='+paxi

    $.ajax({
        url: module,
        data: serialize,
        dataType: 'json',
        success: function(data) {
            var excursion   = data.excursion;
            var surpax      = data.surcharge_excursion;
            var surtel      = data.surcharge_hotel;
            var buffer      = '';

            if(excursion.length) {
                if(get_pupp() == 'Per Unit') {
                    excursion[0].chargetype = 'S';
                    buffer += buffer_item_pax(excursion[0]);

                    for(var i=0; i<pax_info.length; i++) {
                        // skip service type, because we have one already
                        if(pax_info[i].charge_type != 'S') {
                            excursion[0].chargetype  = pax_info[i].charge_type;
                            excursion[0].pax         = pax_info[i].pax;
                            excursion[0].age         = pax_info[i].age;
                            //---
                            excursion[0].buyrate         = 0;
                            excursion[0].buyrate_total   = 0;
                            excursion[0].orisales        = 0;
                            excursion[0].sales           = 0;
                            excursion[0].sales_total     = 0;
                            excursion[0].markup          = 0;
                            buffer += buffer_item_pax(excursion[0]);
                        }
                    }
                } else {
                    for(var i=0; i<excursion.length; i++) {
                        buffer += buffer_item_pax(excursion[i]);
                    }
                }
                $('#detail-price-pax').append(buffer);

                buffer = '';
                for(var i=0; i<surpax.length; i++) {
                    buffer += buffer_item_surcharge(surpax[i]);
                }
                for(var i=0; i<surtel.length; i++) {
                    buffer += buffer_item_surcharge(surtel[i]);
                }
                $('#detail-price-surcharge').append(buffer);

            } else {
                $loader.hide();
                $app.alert('No price available for this request!<br>'
                        +'Please contact the company.', $STRING.info_data_not_found);
            }
            callback();
        },
        timeout: 15000 // 15 second is safe
    });
}

function get_price_of_chargetype_online(pax_info, callback) {

    $status.set('LOADING PRICE OF CHARGE TYPE');

    var module       = get_core_module();
    var serialize    = '&act=form-check-price'
        serialize   += '&f='+generate_parameters('price_pax')

    $.ajax({
        url: module,
        data: serialize,
        dataType: 'json',
        success: function(data) {

            var buffer = '';
            if(data) {
                if(get_pupp() == 'Per Unit') {
                    data[0].chargetype = 'S';
                    buffer += buffer_item_pax(data[0]);

                    for(var i=0; i<pax_info.length; i++) {
                        // skip service type, because we have one already
                        if(pax_info[i].charge_type != 'S') {
                            data[0].chargetype  = pax_info[i].charge_type;
                            data[0].pax         = pax_info[i].pax;
                            data[0].age         = pax_info[i].age;
                            //---
                            data[0].buyrate         = 0;
                            data[0].buyrate_total   = 0;
                            data[0].orisales        = 0;
                            data[0].sales           = 0;
                            data[0].sales_total     = 0;
                            data[0].markup          = 0;
                            buffer += buffer_item_pax(data[0]);
                        }
                    }
                } else {
                    for(var i=0; i<data.length; i++) {
                        buffer += buffer_item_pax(data[i]);
                    }
                }
                $('#detail-price-pax').append(buffer);
            } else {
                $loader.hide();
                $app.alert('No price available for this request!<br>'
                        +'Please contact the company.', $STRING.info_data_not_found);
            }
            callback(); 

        }
    });
}
function get_price_of_surcharge_pax_online(paxa, paxc, callback) {

    $status.set('LOADING PRICE OF PAX SURCHARGE');

    var module       = get_core_module();
    var serialize    = '&act=form-check-surcharge-pax'
        serialize   += '&ide='+$excursion.value[0].idx_excursion
        serialize   += '&ids='+$excursion.value[0].idx_sub
        serialize   += '&idcom='+$SETTINGS.company.id
        serialize   += '&idcur='+$SETTINGS.currency.id
        serialize   += '&idgen='+$agent.value[0].idx_agent
        serialize   += '&td='+$('#i-allotment-calendar').val()
        serialize   += '&pa='+paxa
        serialize   += '&pc='+paxc

    $.ajax({
        url: module,
        data: serialize,
        dataType: 'json',
        success: function(data) {

            var buffer = '';
            for(var i=0; i<data.length; i++) {
                buffer += buffer_item_surcharge(data[i]);
            }
            $('#detail-price-surcharge').append(buffer);
            callback(); 

        }
    });
}
function get_price_of_surcharge_hotel_online(paxa, paxc, paxi, callback) {
    
    $status.set('LOADING PRICE OF HOTEL SURCHARGE');
    
    var module       = get_core_module();
    var serialize    = '&act=form-check-surcharge-hotel'
        serialize   += '&ide='+$excursion.value[0].idx_excursion
        serialize   += '&ids='+$excursion.value[0].idx_sub
        serialize   += '&idhtl='+$hotel_area.value[0].idx_hotel
        serialize   += '&idcur='+$SETTINGS.currency.id
        serialize   += '&idgen='+$agent.value[0].idx_agent
        serialize   += '&td='+$('#i-allotment-calendar').val()
        serialize   += '&pa='+paxa
        serialize   += '&pc='+paxc
        serialize   += '&pi='+paxi

    $.ajax({
        url: module,
        data: serialize,
        dataType: 'json',
        success: function(data) {

            var buffer = '';
            for(var i=0; i<data.length; i++) {
                buffer += buffer_item_surcharge(data[i]);
            }
            $('#detail-price-surcharge').append(buffer);
            callback(); 

        }
    });
}

function cart_item_insert_online(callback) {
    
    $status.set('SAVING TO ONLINE CART');
    
    var module       = get_core_module();
    var serialize    = '&act=form-cart-add&f='+generate_parameters('add_to_cart')

    $.ajax({
        url: module,
        data: serialize,
        success: function(data) {

            push_incomplete_online_session(function() {
                callback();
            });

        }
    });
}


function generate_parameters(act) {
    var buffer = '';
    switch(act) {
        case 'checkout':
            var pot_remark  = 'PAY ON TOUR';
            var pot_paid    = $('#checkout-paymethod option:selected').val() == 'pot' ? pot_remark : 'PAID';
            var ratedate    = $('.rates-date').data('date') ? $('.rates-date').data('date') : get_date();

            // header
            buffer       = " APP3X_FORM_PAYMENT_CHECKOUT '"
            buffer      += SESSION.transaction_mf+"','"
            buffer		+= SESSION.transaction_number + "','" 
            buffer      += $SETTINGS.user.id + "','" 
            buffer      += $SETTINGS.branch.id + "','"
            buffer		+= "insert into MFExcursionHeader select "
            buffer 		+= "''"+SESSION.transaction_number+"'',"
            buffer 		+= "''"+SESSION.transaction_date+"'',"
            buffer 		+= "''"+ratedate+"'',";
            buffer 		+= "''"+$SETTINGS.currency.id+"'',"
            buffer 		+= "''"+SESSION.transaction_payment+"'',"
            buffer 		+= "''"+$SETTINGS.user.id+"'',"
            buffer 		+= "''"+'R'+"'',"
            buffer 		+= "''"+SESSION.transaction_mf+"'',"
            buffer 		+= "''"+$SETTINGS.company.id+"'',"
            buffer 		+= "''"+$SETTINGS.branch.id+"'',"
            buffer 		+= "''"+pot_paid+"'',"
            buffer 		+= "''"+pot_paid+"'',"
            buffer 		+= "''"+$SETTINGS.user.name+"'',"
            buffer 		+= "''"+SESSION.transaction_date+"'',"
            buffer 		+= "''"+$SETTINGS.user.name+"'',"
            buffer 		+= "''"+SESSION.transaction_date+"'';"            

            // contact
                buffer		+= "insert into MFExcursionContactDetail select "
                buffer 		+= "''"+SESSION.transaction_mf+"'',"
                buffer 		+= "''"+SESSION.transaction_number+"'',"
                buffer 		+= "''"+encodeURIComponent(parseESC($('#checkout-title option:selected').val()))+"'',"
                buffer 		+= "''"+encodeURIComponent(parseESC($('#checkout-firstname').val()))+"'',"
                buffer 		+= "''"+encodeURIComponent(parseESC($('#checkout-lastname').val()))+"'',"
                buffer 		+= "''"+encodeURIComponent(parseESC($('#checkout-email').val()))+"'',"
                buffer 		+= "''"+''+"'',"
                buffer 		+= "''"+encodeURIComponent(parseESC($('#checkout-phone').val()))+"'',"
                buffer 		+= "''"+encodeURIComponent(parseESC($('#checkout-phone').val()))+"'',"
                buffer 		+= "''"+''+"'',"
                buffer 		+= "''"+$.uuid()+"'',"
                buffer 		+= "''"+$SETTINGS.user.name+"'',"
                buffer 		+= "''"+SESSION.transaction_date+"'',"
                buffer 		+= "''"+$SETTINGS.user.name+"'',"
                buffer 		+= "''"+SESSION.transaction_date+"'';"
            // payment
            $('#pay-input li.root').each(function(i,e) {
                var $li             = $(e);
                var $checkbox       = $li.find('input[type=checkbox]');
                var $data           = $li.data('item');
                var input_fullname  = $('#checkout-firstname').val()+' '+$('#checkout-lastname').val();
                var input_price     = $li.find('input[type=number]').val();
                var input_currency  = $data.idx_currency;
                var input_paycode   = $li.data('code');
                    input_paycode   = input_paycode == 'CA' ? 'CASH' : input_paycode;
                    

                if($checkbox.is(':checked')) {
                buffer		+= "insert into MFExcursionPaymentDetail select "
                buffer 		+= "''"+SESSION.transaction_mf+"'',"
                buffer 		+= "''"+SESSION.transaction_number+"'',"
                buffer 		+= "''"+input_paycode+"'',"
                buffer 		+= "''"+encodeURIComponent(parseESC(input_fullname))+"'',"
                buffer 		+= "''"+''+"'',"
                buffer 		+= "''"+''+"'',"
                buffer 		+= "''"+''+"'',"
                buffer 		+= "''"+''+"'',"
                buffer 		+= "''"+''+"'',"
                buffer 		+= "''"+''+"'',"
                buffer 		+= "''"+''+"'',"
                buffer 		+= "''"+''+"'',"
                buffer 		+= "''"+''+"'',"
                buffer 		+= "''"+input_price+"'',"
                buffer 		+= "''"+input_currency+"'',"
                buffer 		+= "''0'',"
                buffer 		+= "''"+$.uuid()+"'',"
                buffer 		+= "''"+$SETTINGS.user.name+"'',"
                buffer 		+= "''"+SESSION.transaction_date+"'',"
                buffer 		+= "''"+$SETTINGS.user.name+"'',"
                buffer 		+= "''"+SESSION.transaction_date+"'';"
                }
            });

            // name list
            if($SETTINGS.required_guest_details =='true'){
                var $data = guest_form_get();
                for(var i=0; i<$data.length; i++) {
                    var $guest_title        = encodeURIComponent(parseESC($data[i].guest_title));
                    var $guest_fullname     = encodeURIComponent(parseESC($data[i].guest_fullname));
                    var $guest_age          = encodeURIComponent(parseESC($data[i].guest_age));
                    var $fullname           = encodeURIComponent(parseESC($('#checkout-firstname').val()))+ ' ' +encodeURIComponent(parseESC($('#checkout-lastname').val())); 

                    $guest_title = ($guest_title==='' ? encodeURIComponent(parseESC($('#checkout-title option:selected').val())) : $guest_title);
                    $guest_fullname = ($guest_fullname==='' ? $fullname : $guest_fullname);


                    buffer      += "insert into MFExcursionNameList select "
                    buffer      += "''"+SESSION.transaction_mf+"'',"
                    buffer      += "''"+$data[i].id_transaction+"'',"
                    buffer      += "''"+$guest_title+"'',"
                    buffer      += "''"+$guest_fullname+"'',"
                    buffer      += "''"+$guest_age+"'',"
                    buffer      += "''"+$SETTINGS.user.name+"'',"
                    buffer      += "''"+SESSION.transaction_date+"'',"
                    buffer      += "''"+$SETTINGS.user.name+"'',"
                    buffer      += "''"+SESSION.transaction_date+"'',"
                    buffer      += "''"+$.uuid()+"'';";
                }
            }
            buffer          += "'";
            return buffer;

        case 'add_to_cart':
            //SESSION.transaction_id      = $.uuid();
            //SESSION.transaction_date    = get_date();

            // mf header
            buffer		 = "insert into TMP_MFExcursionTransactionHeader select "
            buffer 		+= "''"+SESSION.transaction_mf+"'',"
            buffer 		+= "''"+SESSION.transaction_number+"'',"
            buffer 		+= "''"+$SETTINGS.company.id+"'',"
            buffer 		+= "''"+$excursion.value[0].idx_excursion+"'',"
            buffer 		+= "''"+$excursion.value[0].idx_sub+"'',"
            buffer 		+= "''"+''+"'',"
            buffer 		+= "''"+$('#i-allotment-calendar').val()+' '+$('#i-pickuptime').val()+"'',"
            buffer 		+= "''"+$hotel_area.value[0].idx_hotel+"'',"
            buffer 		+= "''"+encodeURIComponent($('#i-room').val())+"'',"
            buffer 		+= "''"+$agent.value[0].idx_agent+"'',"
            buffer 		+= "''"+$excursion.value[0].idx_supplier+"'',"
            buffer 		+= "''"+''+"'',"
            buffer 		+= "''"+encodeURIComponent(parseESC($('#detail-remark1').val()))+"'',"
            buffer 		+= "''"+encodeURIComponent(parseESC($('#detail-remark2').val()))+"'',"
            buffer 		+= "''"+'0'+"'',"
            buffer 		+= "''"+$('#detail-price-pax tr:first-child').data('item').idx_contract+"'',"
            buffer 		+= "''"+'PR'+"'',"
            buffer 		+= "''"+SESSION.transaction_id+"'',"
            buffer 		+= "''"+$SETTINGS.market.id+"'',"
            buffer 		+= "''"+'M'+"'',"
            buffer 		+= "''"+'0'+"'',"
            buffer 		+= "''"+$SETTINGS.user.name+"'',"
            buffer 		+= "''"+SESSION.transaction_date+"'',"
            buffer 		+= "''"+$SETTINGS.user.name+"'',"
            buffer 		+= "''"+SESSION.transaction_date+"'',"
            buffer 		+= "''0'';"			

            // item
            $('#detail-price-pax tr').each(function(i,e) {
                var $tr     = $(e);
                var item    = $tr.data('item');

                buffer	    += "insert into TMP_MFExcursionTransactionitem select "
                buffer 		+= "''"+SESSION.transaction_id+"'',"
                buffer 		+= "''"+SESSION.transaction_mf+"'',"
                buffer 		+= "''"+item.idx_contract+"'',"
                buffer 		+= "''"+item.chargetype+"'',"
                buffer 		+= "''"+item.pax+"'',"
                buffer 		+= "''"+item.age+"'',"
                buffer 		+= "''"+'0'+"'',"
                buffer 		+= "''"+item.idx_currbuy+"'',"
                buffer 		+= "''"+item.sales+"'',"
                buffer 		+= "''"+$SETTINGS.currency.id+"'',"
                buffer 		+= "''"+''+"'',"
                buffer 		+= "''"+''+"'',"
                buffer 		+= "''"+item.sales_total+"'',"
                buffer 		+= "''"+$.uuid()+"'',"
                buffer 		+= "''"+$SETTINGS.user.name+"'',"
                buffer 		+= "''"+SESSION.transaction_date+"'',"
                buffer 		+= "''"+$SETTINGS.user.name+"'',"
                buffer 		+= "''"+SESSION.transaction_date+"'';"
            });

            // surcharge
            $('#detail-price-surcharge tr').each(function(i, e) {
                var $tr     = $(e);
                var item    = $tr.data('item');

                if($tr.find('input[type=checkbox]').prop('checked')) {
                buffer		+= "insert into TMP_MFExcursionSurcharge select "
                buffer 		+= "''"+SESSION.transaction_mf+"'',"
                buffer 		+= "''"+SESSION.transaction_number+"'',"
                buffer 		+= "''"+SESSION.transaction_id+"'',"
                buffer 		+= "''"+item.idx_surcharge+"'',"
                buffer 		+= "''"+item.price+"'',"
                buffer 		+= "''"+$.uuid()+"'',"
                buffer 		+= "''"+$SETTINGS.user.name+"'',"
                buffer 		+= "''"+SESSION.transaction_date+"'',"
                buffer 		+= "''"+$SETTINGS.user.name+"'',"
                buffer 		+= "''"+SESSION.transaction_date+"'';"
                }
            });

            // disc
            /* diurus di cart !
		    buffer		+= "insert into TMP_MFExcursionTransactionDiscount select "
            buffer 		+= "''"+[SESSION.transaction.mf_index]+"'',"
            buffer 		+= "''"+[tr_index]+"'',"	
            buffer 		+= "''"+[id_promo]+"'',"	
            buffer 		+= "''"+[value]+"'',"	
            buffer 		+= "''"+[$.newUUID()]+"'';"
            */

            return buffer;
        case 'price_pax':
            if(get_pupp() == 'Per Pax') {
                // adult
                buffer += '~'
                buffer += '|'+ $('#i-allotment-calendar').val()
                buffer += '|'+ $excursion.value[0].idx_excursion
                buffer += '|'+ (!$excursion.value[0].idx_sub ? '.' : $excursion.value[0].idx_sub)
                buffer += '|'+ 'A'
                buffer += '|'+ $('#i-booking-pax-adult').val()
                buffer += '|'+ '0'
                buffer += '|'+ $SETTINGS.currency.id
                buffer += '|'+ $agent.value[0].idx_agent
                buffer += '|';

                // child
                var $child = $('#div-age-of-child > div');
                $child.each(function(i, e) {
                    var $this = $(e);
                    buffer += '~'
                    buffer += '|'+ $('#i-allotment-calendar').val()
                    buffer += '|'+ $excursion.value[0].idx_excursion
                    buffer += '|'+ (!$excursion.value[0].idx_sub ? '.' : $excursion.value[0].idx_sub)
                    buffer += '|'+ 'C'
                    buffer += '|'+ '1'
                    buffer += '|'+ $this.find('input').val()
                    buffer += '|'+ $SETTINGS.currency.id
                    buffer += '|'+ $agent.value[0].idx_agent
                    buffer += '|';
                });

                // infant
                var $infant = $('#div-age-of-infant > div');
                $infant.each(function(i, e) {
                    var $this = $(e);
                    buffer += '~'
                    buffer += '|'+ $('#i-allotment-calendar').val()
                    buffer += '|'+ $excursion.value[0].idx_excursion
                    buffer += '|'+ (!$excursion.value[0].idx_sub ? '.' : $excursion.value[0].idx_sub)
                    buffer += '|'+ 'I'
                    buffer += '|'+ '1'
                    buffer += '|'+ $this.find('input').val()
                    buffer += '|'+ $SETTINGS.currency.id
                    buffer += '|'+ $agent.value[0].idx_agent
                    buffer += '|';
                });
                return buffer;
            } else {
                // Per Unit
                buffer += '~'
                buffer += '|'+ $('#i-allotment-calendar').val()
                buffer += '|'+ $excursion.value[0].idx_excursion
                buffer += '|'+ (!$excursion.value[0].idx_sub ? '.' : $excursion.value[0].idx_sub)
                buffer += '|'+ 'S'
                // pax value isn't important for service request, fill it with any integer value
                buffer += '|'+ (parseInt($('#i-booking-pax-adult').val())+parseInt($('#i-booking-pax-child').val())+parseInt($('#i-booking-pax-infant').val()))
                buffer += '|'+ '0'
                buffer += '|'+ $SETTINGS.currency.id
                buffer += '|'+ $agent.value[0].idx_agent
                buffer += '|';
                return buffer;
            }

        default:
            alert('Invalid parameters')
    }
}