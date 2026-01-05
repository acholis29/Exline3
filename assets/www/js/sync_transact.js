function tr_list(callback) {
    var $table  = $('#sync-transaction-list');
    var $count  = $('#sync-transaction-info');
    var buffer  = '';

    if($SETTINGS.last_sync_transact.length >= 10) {
        //$('#sync-transaction-last-date').empty();
        $('#sync-transaction-last-date').text($SETTINGS.last_sync_transact);
    }

    $loader.show();
    ssql_load('LIST_TRANSACTION_SYNC', 'ALL', function(ssql_data) {
        ssql = ssql_data.script;
    
        ssql = ssql.replace(/@:status:/g, '0');

        sql(ssql, function(result) {
            SQL_ROWS    = result.rows;
            SQL_ARRAY   = arr_props_to_lower(SQL_ROWS._array);

            if(SQL_ARRAY.length != 0) {
            for(var i=0; i<SQL_ARRAY.length; i++) {
				buffer += '<tr data-item=\''+JSON.stringify(SQL_ARRAY[i])+'\'>';
                //buffer += ' <td style="text-align:center;">';
                //buffer += '     <span>'+SQL_ARRAY[i].count+'</span>';
                //buffer += ' </td>';
                buffer += '	<td style="padding:10px;">';
                buffer += '	    <span ><b>'+SQL_ARRAY[i].number+'</b> - '+SQL_ARRAY[i].gender+' '+SQL_ARRAY[i].fname+' '+SQL_ARRAY[i].lname+' ('+SQL_ARRAY[i].count+')</span><br />';
                buffer += '     <span style="font-size:10px;">'+date_format(SQL_ARRAY[i].date, 'dd MONTH yyyy')+'</span>';
                buffer += '     <div style="width:100%; display:inline-block; margin-top:10px;">';
                buffer += '     <a href="#" class="button delete" style="width:100px;">Delete</a>';
                buffer += '     </div>';
                buffer += '	</td>';
				buffer += '</tr>';
            }
            } else {
				buffer += '<tr ><td style="padding:10px;">NO DATA</td></tr>';
            }
            $table.empty();
            $table.append(buffer);
            if(SQL_ARRAY.length) {
                $count.text(SQL_ARRAY.length+' transaction(s) need to sync!');
                $count.css('color', 'red');
            } else {
                $count.text('No transaction need to sync');
                $count.css('color', 'green');
            }
            callback();
        });
    });
}

function tr_sync_mail_buffer(id, result) {
    
    $status.set('PREPARING MAIL MESSAGE');

    ssql_load('LIST_TRANSACTION_INDEX', 'ALL', function(ssql_data) {
        ssql = ssql_data.script;
        ssql = ssql.replace(/@:idx_mfexcursion:/g, id);  

        sql_data(ssql, function(data) {
            console.log('Mail data: '+JSON.stringify(data));
            if(data.length) {
                result(data);
            } else {
                $loader.hide();
                $app.alert('Mailing aborted!', $STRING.info_data_not_available, function() {
                    result([]);
                });
            }
        });
    });
}

function tr_sync_mail_create(data) {
    // remember, one transaction could has more than one product booking!
    var buffer = '';
    for(var i=0; i<data.length; i++) {
        buffer += (data[i].email1 != ''? data[i].email1 : '') +','
        buffer += (data[i].idx_transaction) +','
        buffer += ($SETTINGS.company.id) +','
        buffer += (data[i].email2 != ''? data[i].email2 : '') +'|';
    }
 	if(buffer.length) {
 	    return buffer.slice(0, - 1); // remove last vertical bar
 	} else {
 	    return buffer;
 	}
}

function tr_sync_mail(id, callback) {
    tr_sync_mail_buffer(id, function(data) {

        var module       = get_core_module();
        var serialize    = '&act=mail-send'
            serialize   += '&arlist='+(tr_sync_mail_create(data));

        $status.set('SENDING MAIL: '+data[0].exc_numb);

        $.ajax({
            timeout: 60000, /* 60 sec */
            url: module,
            data: serialize,
            success: function(result) {

                // check for error
                if(result == 'MAILSENT') {
                    // updating status
                    var obj_update = tr_sync_status_buffer(data[0].idx_mfexcursion, '1');
                    tr_sync_status(obj_update, function() {
                        callback();
                    });
                } else {
                    $loader.hide();
                    log_show('Failed to send email!', result);
                    //$app.alert('Mail error!', $STRING.info_important);
                }

            }
        });
    });
}

function tr_sync_start(callback) {
    var buffer = tr_sync_item_buffer();
    $loader.show();
    tr_sync_item(buffer, buffer.length, 'new', function() {
        $loader.hide();
        $app.alert('Successfully sent!', 'Complete', function() {
            callback();
        });
    });
}

function tr_sync_status_buffer(id, status) {
/*
    y - DELETED / CANCELED
    0 - NEVER SYNC
    1 - SYNC OK
    2 - SYNC OK & MAIL SENT

 */
    var ssql_update_mf_header       = "UPDATE MFExcursionHeader SET status = '"+status+"' WHERE idx_mfexcursion = '"+id+"'";
    var ssql_update_mf_contact      = "UPDATE MFExcursionContactDetail SET status = '"+status+"' WHERE idx_mfexcursion = '"+id+"'";
    var ssql_update_mf_payment      = "UPDATE MFExcursionPaymentDetail SET status = '"+status+"' WHERE idx_mfexcursion = '"+id+"'";
    var ssql_update_tr_header       = "UPDATE MFExcursionTransactionHeader SET status = '"+status+"' WHERE idx_mfexcursion = '"+id+"'";
    var ssql_update_tr_item         = "UPDATE MFExcursionTransactionItem SET status = '"+status+"' WHERE idx_mfexcursion = '"+id+"'";
    var ssql_update_tr_surcharge    = "UPDATE MFExcursionSurcharge SET status = '"+status+"' WHERE idx_mfexcursion = '"+id+"'";
    var ssql_update_tr_discount     = "UPDATE MFExcursionTransactionDiscount SET status = '"+status+"' WHERE idx_mfexcursion = '"+id+"'";
    
    var ssql_array  = [];

    ssql_array.push(ssql_update_mf_header);
    ssql_array.push(ssql_update_mf_contact);
    ssql_array.push(ssql_update_mf_payment);
    ssql_array.push(ssql_update_tr_header);
    ssql_array.push(ssql_update_tr_item);
    ssql_array.push(ssql_update_tr_surcharge);
    ssql_array.push(ssql_update_tr_discount);

    return ssql_array;
}
function tr_sync_status(items, callback) {
    if(items[0]!=undefined) {
        var item        = items;
        var item_active = item[0];

        sql(item_active, function(result) {
            
            if(item.shift()) {
                tr_sync_status(item, callback);
            } else {
                callback();
            }

        });
    } else {
        callback();
    }
}
function tr_sync_item_buffer() {
    var buffer = [];
    $('#sync-transaction-list tr').each(function (i, e) {
        var $tr     = $(e);
        var data    = $tr.data('item');
        buffer.push(data);
    });
    return buffer;
}
function tr_sync_item(items, size, status, callback) {
    
    if(items[0]!=undefined) {
        //sync start
        var item        = items;
        var item_active = item[0].number;
        var mf          = item[0].idx_mfexcursion;
        var voucher     = item_active.split('/')[0];

        if(status == 'del') {
            $status.set('Synchronizing deleted transaction['+((size-items.length)+1)+' of '+size+']:<br>'+voucher+'.');
        } else {
            $status.set('Synchronizing created transaction['+((size-items.length)+1)+' of '+size+']:<br>'+voucher+'.');
        }
        
        var ssql_mf_header      = "SELECT * FROM MFExcursionHeader WHERE idx_mfexcursion = '"+mf+"'";
        var ssql_mf_contact     = "SELECT * FROM MFExcursionContactDetail WHERE idx_mfexcursion = '"+mf+"'";
        var ssql_mf_payment     = "SELECT * FROM MFExcursionPaymentDetail WHERE idx_mfexcursion = '"+mf+"'";
        var ssql_tr_header      = "SELECT * FROM MFExcursionTransactionHeader WHERE idx_mfexcursion = '"+mf+"'";
        var ssql_tr_item        = "SELECT b.idx_transaction, b.idx_mfexcursion, b.idx_contract, b.ChargeType, b.Pax, b.Age, b.BuyRate, b.idx_CurrrencyBuyRate, b.SalesRate, b.idx_currencySalesRate, b.Rate, b.TotalBuyRate, b.TotalSalesRate, b.idx_transactionItem, b.crea_by, b.crea_date, b.modi_by, b.modi_date,a.idx_excursion,a.idx_sub_excursion,a.pickup,a.idx_from,b.status FROM MFExcursionTransactionHeader a INNER JOIN MFExcursionTransactionItem b ON a.idx_mfexcursion=b.idx_mfexcursion AND a.idx_transaction=b.idx_transaction WHERE a.idx_mfexcursion = '"+mf+"'";
        var ssql_tr_surcharge   = "SELECT * FROM MFExcursionSurcharge WHERE idx_mfexcursion = '"+mf+"'";
        var ssql_tr_discount    = "SELECT a.* FROM MFExcursionTransactionDiscount a INNER JOIN MFExcursionTransactionHeader b ON a.idx_mfexcursion = b.idx_mfexcursion AND a.idx_mfexcursion = '"+mf+"'";
        var ssql_mf_meta        = "SELECT * FROM MFExcursionMETA WHERE mf = '"+mf+"'";
        var ssql_mf_namelist    = "SELECT * FROM MFExcursionNameList WHERE idx_mfexcursion = '"+mf+"'";

        /*
        var ssql_mf_header      = "SELECT * FROM MFExcursionHeader WHERE Exc_number LIKE '%"+voucher+"%'";
        var ssql_mf_contact     = "SELECT * FROM MFExcursionContactDetail WHERE exc_numb LIKE '%"+voucher+"%'";
        var ssql_mf_payment     = "SELECT * FROM MFExcursionPaymentDetail WHERE exc_numb LIKE '%"+voucher+"%'";
        var ssql_tr_header      = "SELECT * FROM MFExcursionTransactionHeader WHERE exc_numb LIKE '%"+voucher+"%'";
        var ssql_tr_item        = "SELECT b.idx_transaction, b.idx_mfexcursion, b.idx_contract, b.ChargeType, b.Pax, b.Age, b.BuyRate, b.idx_CurrrencyBuyRate, b.SalesRate, b.idx_currencySalesRate, b.Rate, b.TotalBuyRate, b.TotalSalesRate, b.idx_transactionItem, b.crea_by, b.crea_date, b.modi_by, b.modi_date,a.idx_excursion,a.idx_sub_excursion,a.pickup,a.idx_from,b.status FROM MFExcursionTransactionHeader a INNER JOIN MFExcursionTransactionItem b ON a.idx_mfexcursion=b.idx_mfexcursion AND a.idx_transaction=b.idx_transaction WHERE a.exc_numb LIKE '%"+voucher+"%'";
        var ssql_tr_surcharge   = "SELECT * FROM MFExcursionSurcharge WHERE exc_numb LIKE '%"+voucher+"%'";
        var ssql_tr_discount    = "SELECT a.* FROM MFExcursionTransactionDiscount a INNER JOIN MFExcursionTransactionHeader b ON a.idx_mfexcursion = b.idx_mfexcursion AND b.exc_numb = '"+voucher+"'";
        var ssql_mf_meta        = "SELECT * FROM MFExcursionMETA WHERE voucher LIKE '%"+voucher+"%'";
        var ssql_mf_namelist    = "SELECT * FROM MFExcursionNameList WHERE voucher LIKE '%"+voucher+"%'";
        */

        sql_data(ssql_mf_header,    function(mf_header) {
        sql_data(ssql_mf_contact,   function(mf_contact) {
        sql_data(ssql_mf_payment,   function(mf_payment) {
        sql_data(ssql_tr_header,    function(tr_header) {
        sql_data(ssql_tr_item,      function(tr_item) {
        sql_data(ssql_tr_surcharge, function(tr_surcharge) {
        sql_data(ssql_tr_discount,  function(tr_discount) {
        sql_data(ssql_mf_meta,      function(mf_meta) {
        sql_data(ssql_mf_namelist,  function(mf_namelist) {

            var json_mf_header      = mf_header;
            var json_mf_contact     = mf_contact;
            var json_mf_payment     = mf_payment;
            var json_tr_header      = tr_header;
            var json_tr_item        = tr_item;
            var json_tr_surcharge   = tr_surcharge;
            var json_tr_discount    = tr_discount;
            var json_mf_meta        = mf_meta;
            var json_mf_namelist    = mf_namelist;

            var ssql_mf_header	    = '';
            var ssql_mf_contact	    = '';
            var ssql_mf_payment	    = '';
            var ssql_tr_header	    = '';
            var ssql_tr_item		= '';
            var ssql_tr_surcharge	= '';
            var ssql_tr_discount	= '';
            var ssql_mf_meta        = '';
            var ssql_mf_namelist    = '';

            var ssql_join           = '';

            if(json_mf_header.length != 0) {
                ssql_mf_header		     = " declare @vcnumb nvarchar(50);"
                ssql_mf_header		    += " insert into MFExcursionHeader select "
                ssql_mf_header 		    += "''"+json_mf_header[0].exc_number+"'',"
                ssql_mf_header 		    += "''"+json_mf_header[0].datetransaksi+"'',"
                ssql_mf_header 		    += "''"+json_mf_header[0].datejatuhtempo+"'',"
                ssql_mf_header 		    += "''"+json_mf_header[0].currency+"'',"
                ssql_mf_header 		    += "''"+json_mf_header[0].amount+"'',"
                ssql_mf_header 		    += "''"+json_mf_header[0].idx_userbooking+"'',"
                ssql_mf_header 		    += "''"+json_mf_header[0].categoryuserbooking+"'',"
                ssql_mf_header 		    += "''"+json_mf_header[0].idx_mfexcursion+"'',"
                ssql_mf_header 		    += "''"+json_mf_header[0].idx_comp+"'',"
                ssql_mf_header 		    += "''"+json_mf_header[0].idx_branch+"'',"
                ssql_mf_header 		    += "''"+json_mf_header[0].remark+"'',"
                ssql_mf_header 		    += "''"+json_mf_header[0].remark_guest+"'',"
                ssql_mf_header 		    += "''"+json_mf_header[0].crea_by+"'',"
                ssql_mf_header 		    += "''"+json_mf_header[0].crea_date+"'',"
                ssql_mf_header 		    += "''"+json_mf_header[0].modi_by+"'',"
                ssql_mf_header 		    += "''"+json_mf_header[0].modi_date+"'';"
            } else {
                $loader.hide();
                $app.alert('<b>MF HEADER</b> for <b style="color:red;">'+voucher+'</b> is not exist!', 'Error');
                return false;
            }
            
            if(json_mf_contact.length != 0) {
                ssql_mf_contact		     = " insert into MFExcursionContactDetail select "
                ssql_mf_contact 	    += "''"+json_mf_contact[0].idx_mfexcursion+"'',"
                ssql_mf_contact 	    += "''"+json_mf_contact[0].exc_numb+"'',"
                ssql_mf_contact 	    += "''"+json_mf_contact[0].gender+"'',"
                ssql_mf_contact 	    += "''"+json_mf_contact[0].firstname+"'',"
                ssql_mf_contact 	    += "''"+json_mf_contact[0].familyname+"'',"
                ssql_mf_contact 	    += "''"+json_mf_contact[0].email+"'',"
                ssql_mf_contact 	    += "''"+json_mf_contact[0].confirmemail+"'',"
                ssql_mf_contact 	    += "''"+json_mf_contact[0].phone+"'',"
                ssql_mf_contact 	    += "''"+json_mf_contact[0].mobile+"'',"
                ssql_mf_contact 	    += "''"+json_mf_contact[0].fax+"'',"
                ssql_mf_contact 	    += "''"+json_mf_contact[0].idx_contact_detail+"'',"
                ssql_mf_contact 	    += "''"+json_mf_contact[0].crea_by+"'',"
                ssql_mf_contact 	    += "''"+json_mf_contact[0].crea_date+"'',"
                ssql_mf_contact 	    += "''"+json_mf_contact[0].modi_by+"'',"
                ssql_mf_contact 	    += "''"+json_mf_contact[0].modi_date+"'';"
            } else {
                $loader.hide();
                $app.alert('<b>MF CONTACT</b> for <b style="color:red;">'+voucher+'</b> is not exist!', 'Error');
                return false;
            }

            if(json_mf_payment.length != 0) {

                for(var i=0; i<json_mf_payment.length; i++) {
                    ssql_mf_payment		+= " insert into MFExcursionPaymentDetail select "
                    ssql_mf_payment 	+= "''"+json_mf_payment[i].idx_mfexcursion+"'',"
                    ssql_mf_payment 	+= "''"+json_mf_payment[i].exc_numb+"'',"
                    ssql_mf_payment 	+= "''"+json_mf_payment[i].idx_paymenttype+"'',"
                    ssql_mf_payment 	+= "''"+json_mf_payment[i].namecreditcard+"'',"
                    ssql_mf_payment 	+= "''"+json_mf_payment[i].billingaddress1+"'',"
                    ssql_mf_payment 	+= "''"+json_mf_payment[i].billingaddress2+"'',"
                    ssql_mf_payment 	+= "''"+json_mf_payment[i].idx_country+"'',"
                    ssql_mf_payment 	+= "''"+json_mf_payment[i].idx_state+"'',"
                    ssql_mf_payment 	+= "''"+json_mf_payment[i].zipcode+"'',"
                    ssql_mf_payment 	+= "''"+json_mf_payment[i].creditcardtype+"'',"
                    ssql_mf_payment 	+= "''"+json_mf_payment[i].creditcradnumber+"'',"
                    ssql_mf_payment 	+= "''"+json_mf_payment[i].expireddate+"'',"
                    ssql_mf_payment 	+= "''"+json_mf_payment[i].securitycode+"'',"
                    ssql_mf_payment 	+= "''"+exponential_expand(json_mf_payment[i].amount)+"'',"
                    ssql_mf_payment 	+= "''"+json_mf_payment[i].idx_currency+"'',"
                    ssql_mf_payment 	+= "''0'',"
                    ssql_mf_payment 	+= "''"+json_mf_payment[i].idx_paymentdetail+"'',"
                    ssql_mf_payment 	+= "''"+json_mf_payment[i].crea_by+"'',"
                    ssql_mf_payment 	+= "''"+json_mf_payment[i].crea_date+"'',"
                    ssql_mf_payment 	+= "''"+json_mf_payment[i].modi_by+"'',"
                    ssql_mf_payment 	+= "''"+json_mf_payment[i].modi_date+"'';"
                }

            } else {
                $loader.hide();
                $app.alert('<b>MF PAYMENT</b> for <b style="color:red;">'+voucher+'</b> is not exist!', 'Error');
                return false;
            } 

            if(json_tr_header.length != 0) {

                for(var i=0; i<json_tr_header.length; i++) {
                    ssql_tr_header		+= " select @vcnumb=lastVCNumb from fnLastVCnumber(''"+$SETTINGS.user.id+"'',''"+$SETTINGS.branch.id+"''); "
                    ssql_tr_header		+= " insert into MFExcursionTransactionHeader select "
                    ssql_tr_header 		+= "''"+json_tr_header[i].idx_mfexcursion+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].exc_numb+"'',"
                    ssql_tr_header 		+= "''"+$SETTINGS.company.id+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].idx_excursion+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].idx_sub_excursion+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].refnumber+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].pickup+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].idx_hotel+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].room_no+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].idx_client+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].idx_supplier+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].confirmby+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].remark+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].remark_supplier+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].usedunitroom+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].idx_contract+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].stsactive+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].idx_transaction+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].idx_from+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].category+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].promo+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].crea_by+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].crea_date+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].modi_by+"'',"
                    ssql_tr_header 		+= "''"+json_tr_header[i].modi_date+"'',"
                    ssql_tr_header 		+= ""+"@vcnumb"+";"
                }

            } else {
                $loader.hide();
                $app.alert('<b>TR HEADER</b> for <b style="color:red;">'+voucher+'</b> is not exist!', 'Error');
                return false;
            }

            if(json_tr_item.length != 0) {

                for(var i=0; i<json_tr_item.length; i++) {
                    ssql_tr_item		+= " insert into MFExcursionTransactionitem select "
                    ssql_tr_item 		+= "''"+json_tr_item[i].idx_transaction+"'',"
                    ssql_tr_item 		+= "''"+json_tr_item[i].idx_mfexcursion+"'',"
                    ssql_tr_item 		+= "''"+json_tr_item[i].idx_contract+"'',"
                    ssql_tr_item 		+= "''"+json_tr_item[i].chargetype+"'',"
                    ssql_tr_item 		+= "''"+json_tr_item[i].pax+"'',"
                    ssql_tr_item 		+= "''"+json_tr_item[i].age+"'',"
                    ssql_tr_item 		+= "''"+json_tr_item[i].buyrate+"'',"
                    ssql_tr_item 		+= "''"+json_tr_item[i].idx_currrencybuyrate+"'',"
                    ssql_tr_item 		+= "''"+json_tr_item[i].salesrate+"'',"
                    ssql_tr_item 		+= "''"+json_tr_item[i].idx_currencysalesrate+"'',"
                    ssql_tr_item 		+= "''"+json_tr_item[i].rate+"'',"
                    ssql_tr_item 		+= "''"+json_tr_item[i].totalbuyrate+"'',"
                    ssql_tr_item 		+= "''"+json_tr_item[i].totalsalesrate+"'',"
                    ssql_tr_item 		+= "''"+json_tr_item[i].idx_transactionitem+"'',"
                    ssql_tr_item 		+= "''"+json_tr_item[i].crea_by+"'',"
                    ssql_tr_item 		+= "''"+json_tr_item[i].crea_date+"'',"
                    ssql_tr_item 		+= "''"+json_tr_item[i].modi_by+"'',"
                    ssql_tr_item 		+= "''"+json_tr_item[i].modi_date+"'';"
                }

            } else {
                $loader.hide();
                $app.alert('<b>TR ITEM</b> for <b style="color:red;">'+voucher+'</b> is not exist!', 'Error');
                return false;
            }

            // BELOW IS OPTIONAL

            for(var i=0; i<json_tr_surcharge.length; i++) {
                ssql_tr_surcharge		+= " insert into MFExcursionSurcharge select "
                ssql_tr_surcharge 		+= "''"+json_tr_surcharge[i].idx_mfexcursion+"'',"
                ssql_tr_surcharge 		+= "''"+json_tr_surcharge[i].exc_numb+"'',"
                ssql_tr_surcharge 		+= "''"+json_tr_surcharge[i].idx_transaction+"'',"
                ssql_tr_surcharge 		+= "''"+json_tr_surcharge[i].idx_supplement+"'',"
                ssql_tr_surcharge 		+= "''"+json_tr_surcharge[i].price+"'',"
                ssql_tr_surcharge 		+= "''"+json_tr_surcharge[i].idx_surcharge+"'',"
                ssql_tr_surcharge 		+= "''"+json_tr_surcharge[i].crea_by+"'',"
                ssql_tr_surcharge 		+= "''"+json_tr_surcharge[i].crea_date+"'',"
                ssql_tr_surcharge 		+= "''"+json_tr_surcharge[i].modi_by+"'',"
                ssql_tr_surcharge 		+= "''"+json_tr_surcharge[i].modi_date+"'';"
            }

            for(var i=0; i<json_tr_discount.length; i++) {
                ssql_tr_discount		+= " insert into MFExcursionTransactionDiscount select "
                ssql_tr_discount 		+= "''"+json_tr_discount[i].idx_mfexcursion+"'',"
                ssql_tr_discount 		+= "''"+json_tr_discount[i].idx_transaction+"'',"
                ssql_tr_discount 		+= "''"+json_tr_discount[i].idx_promo+"'',"
                ssql_tr_discount 		+= "''"+json_tr_discount[i].value_promo+"'',"
                ssql_tr_discount 		+= "''"+json_tr_discount[i].idx_trnpromo+"'';"
            }

            if(json_mf_meta.length != 0) {
                ssql_mf_meta             = " insert into MFExcursionMETA select "
                ssql_mf_meta            += "''"+json_mf_meta[0].created+"'',"
                ssql_mf_meta            += "''"+json_mf_header[0].idx_mfexcursion+"'',"
                ssql_mf_meta            += "''"+json_mf_meta[0].voucher+"'',"
                ssql_mf_meta            += "''"+json_mf_meta[0].imei+"'',"
                ssql_mf_meta            += "''"+json_mf_meta[0].geo_latitude+"'',"
                ssql_mf_meta            += "''"+json_mf_meta[0].geo_longitude+"'',"
                ssql_mf_meta            += "''"+json_mf_meta[0].geo_country+"'',"
                ssql_mf_meta            += "''"+json_mf_meta[0].geo_city+"'',"
                ssql_mf_meta            += "''"+json_mf_meta[0].geo_postal+"'',"
                ssql_mf_meta            += "''"+json_mf_meta[0].geo_address+"'',"
                ssql_mf_meta            += "''"+json_mf_meta[0].os+"'',"
                ssql_mf_meta            += "''"+json_mf_meta[0].app+"'';"
            }

            for(var i=0; i<json_mf_namelist.length; i++) {
                ssql_mf_namelist        += "insert into MFExcursionNameList select "
                ssql_mf_namelist        += "''"+json_mf_namelist[i].idx_mfexcursion+"'',"
                ssql_mf_namelist        += "''"+json_mf_namelist[i].idx_transaction+"'',"
                ssql_mf_namelist        += "''"+json_mf_namelist[i].suffix+"'',"
                ssql_mf_namelist        += "''"+json_mf_namelist[i].guest_name+"'',"
                ssql_mf_namelist        += "''"+json_mf_namelist[i].age+"'',"
                ssql_mf_namelist        += "''"+json_mf_namelist[i].crea_by+"'',"
                ssql_mf_namelist        += "''"+json_mf_namelist[i].crea_date+"'',"
                ssql_mf_namelist        += "''"+json_mf_namelist[i].modi_by+"'',"
                ssql_mf_namelist        += "''"+json_mf_namelist[i].modi_date+"'',"
                ssql_mf_namelist        += "''"+json_mf_namelist[i].idx_mfnamelist+"'';";
            }

            /*
                WARNING! NEW PROCEDURE ON 2017-10-23
                INSERT_MFEXCURSION_NEW_2    
            */

            ssql_join   = " APP3X_SYNC_OFFLINE_TRANSACTION '"
            ssql_join  += json_mf_header[0].idx_mfexcursion+"','"
            ssql_join  += json_mf_header[0].exc_number+"','"
            ssql_join  += $SETTINGS.user.id+"','"
            ssql_join  += $SETTINGS.branch.id+"','"
            ssql_join  += ssql_mf_header
            ssql_join  += ssql_mf_contact
            ssql_join  += ssql_mf_payment
            ssql_join  += ssql_tr_header
            ssql_join  += ssql_tr_item
            ssql_join  += ssql_tr_surcharge
            ssql_join  += ssql_tr_discount
            ssql_join  += ssql_mf_meta
            ssql_join  += ssql_mf_namelist+"'";

            console.log('DEBUG: '+ssql_join);

            $.ajax({
                url: get_core_module(),
                data: '&act='+(status=='del'?'sync-offline-transaction-del':'sync-offline-transaction')+'&data=' + encodeURIComponent(ssql_join),
                success: function(data)
                {
                    if(status=='del') {
                        // no need to send email,
                        // but update the status to (-1)

                        var obj_update = tr_sync_status_buffer(json_mf_header[0].idx_mfexcursion, '-1');
                        
                        tr_sync_status(obj_update, function() {
                            setTimeout(function() {
                                if(item.shift()) {
                                    tr_sync_item(item, size, status, callback);
                                } else {
                                   callback();
                                }
                            }, 100);
                        });
                    } else {
                        // send mail, and update the status after sending with (1)
                        tr_sync_mail(json_mf_header[0].idx_mfexcursion, function() {
                            setTimeout(function() {
                                if(item.shift()) {
                                    tr_sync_item(item, size, status, callback);
                                } else {
                                   callback();
                                }
                            }, 100);
                        });
                    }
                }
            });

        });});});});});});});});});
            
    } else {
        //sync tidal bisa dilanjutkan
        //$('#progress-info').empty().append('Finishing.');
        callback();
    }    
}