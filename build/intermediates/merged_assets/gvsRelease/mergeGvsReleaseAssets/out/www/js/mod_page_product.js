function product_exist(name, source) {
    for(var i=0; i<source.length; i++) {
        console.log(name.trim().toUpperCase()+' == '+source[i].product.trim().toUpperCase())
        if(name.trim().toUpperCase() == source[i].product.trim().toUpperCase()) {
            return true;
        }
    }
    return false;
}

function product_price_match(name, price, source) {
    for(var i=0; i<source.length; i++) {
        if(name.trim().toUpperCase() == source[i].product.trim().toUpperCase()) {
        if(price == source[i].price) {
                return true;
        }}
    }
    return false;
}

function product_list_online(keyword, from_date, callback) {

    $loader.show();

    var module       = get_core_module();
    var serialize    = '&act=products-list'
        serialize   += '&search=' + keyword
        serialize   += '&date=' + from_date
        serialize   += '&usr=' + $SETTINGS.user.id;
        serialize   += '&idl=' + $SETTINGS.language.id;

    $.ajax({
        url: module,
        data: serialize,
        dataType: 'json',
        success: function(data) {

            var $table      = $('#price-list-server');
            var $table_sync = $('#price-list-server-sync');
            var $count      = $('#price-list-server-count');
            var $count_sync = $('#price-list-server-sync-count');
            var n_sync      = 0;
            var number      = 0;

            var buffer      = '';
            var buffer_done = '';
            var buffer_sync = '';
            var flag        = false;

            var tmp_price   = 0;

            ssql_load('LIST_CATALOG', 'ALL', function(ssql_data) {
                ssql = ssql_data.script;

                ssql = ssql.replace(/@:search:/g, keyword);
                ssql = ssql.replace(/@:date:/g, from_date);

                sql_data(ssql, function(offline) {

                console.log('online: '+data.length);
                console.log('offline: '+offline.length);

                for(var i=0; i<data.length; i++) {

                    var market_device = $SETTINGS.market.name.toUpperCase();
                    var market_online = '';

                    flag = false;

                    if(data[i].hasOwnProperty('market')) {
                        market_online = data[i].market.toUpperCase();
                    } else {
                        $app.alert('Market column is not exist in result.<br>'
                                  +'Module updates are necessary!', $STRING.info_warning);
                        callback();
                        return false;
                    }

                    // sometimes data comes in incorrect textcase!
                    // double check your saved settings
                    if($SETTINGS.market.name.toUpperCase() == data[i].market.toUpperCase()) {
                        tmp_price = data[i].price.split(' ');
                        tmp_price = tmp_price[0]+' '+format_currency(tmp_price[1], false);

                        number++;
                        buffer  = '<tr >';
                        buffer += '	<td style="position:relative; font-size:12px; padding:0 10px;">';
                        buffer += '  <p >' +data[i].product.toUpperCase()+'</p>';
                        buffer += '  <p style="float:right;"><b style="color:blue;">'+tmp_price+'</b></p>';

                        buffer += '	<div style="position:absolute; left:10px; bottom:15px; text-align:center; font-size:12px;">';

                            if(product_exist(data[i].product, offline)) {
                                // continue check price
                                if(product_price_match(data[i].product, data[i].price, offline)) {
                                    buffer += '<span style="background:green; color:white; border:1px solid green; border-radius:2px; padding:2px 4px;">VALID</span>';
                                } else {
                                    buffer += '<span style="color:red;">PRICE INVALID</span>';
                                    flag = true;
                                    n_sync++;
                                }
                            } else {
                                // product was deleted on server
                                // and should deleted on device
                                buffer += '<span style="color:blue;">NOT IN DEVICE</span>';
                                flag = true;
                                n_sync++;
                            }

                        buffer += ' </div>';

                        buffer += ' </td>';
                        buffer += '</tr>';

                        if(flag) {
                            buffer_sync += buffer;
                        } else {
                            buffer_done += buffer;
                        }
                    }
                }
                $table.empty();
                $table.append(buffer_done);
                $count.text('SHOWING '+number+' PRODUCT(S)');

                if(n_sync) {
                    $table_sync.empty();
                    $table_sync.append(buffer_sync);
                    $table_sync.show();

                    $count_sync.text(n_sync+' PRODUCT(S) NEED TO SYNCHRONIZE');
                    $count_sync.css('color', 'red');
                    $count_sync.show();
                } else {
                    $table_sync.hide();
                    $count_sync.hide();
                }
                callback();

                });
            });

        }
    });
}

function product_list_offline(keyword, from_date, callback) {
    var $table      = $('#price-list-device');
    var $table_sync = $('#price-list-device-sync');
    var $count      = $('#price-list-device-count');
    var $count_sync = $('#price-list-device-sync-count');
    var buffer      = '';
    var buffer_sync = '';

    var name        = '';
    var type        = '';
    var n_sync      = 0;

    var tmp_price   = 0;

    $loader.show();
    ssql_load('LIST_CATALOG', 'ALL', function(ssql_data) {
        ssql = ssql_data.script;

        ssql = ssql.replace(/@:search:/g, keyword);
        ssql = ssql.replace(/@:date:/g, from_date);
        ssql = ssql.replace(/@:id_language:/g, $SETTINGS.language.id);

        sql(ssql, function(result) {
            SQL_ROWS  = result.rows;
            SQL_ARRAY = arr_props_to_lower(SQL_ROWS._array);

            for(var i=0; i<SQL_ARRAY.length; i++) {
                // null check, error prevention!
                name    = SQL_ARRAY[i].product ? SQL_ARRAY[i].product.toUpperCase() : SQL_ARRAY[i].product;
                type    = SQL_ARRAY[i].type ? SQL_ARRAY[i].type.toUpperCase() : SQL_ARRAY[i].type;

                tmp_price = SQL_ARRAY[i].price.split(' ');
                tmp_price = tmp_price[0]+' '+format_currency(tmp_price[1], false);

                if(!SQL_ARRAY[i].product || !SQL_ARRAY[i].type || !SQL_ARRAY[i].price) {
                    // error exist
                    buffer_sync += '<tr >';
                    buffer_sync += '	<td style="font-size:12px; padding:0 10px;">';
                    buffer_sync += '  <p >'  +name+'</p>';
                    buffer_sync += '  <p style="float:right;"><b style="color:blue;">'+tmp_price+'</b>/<i style="font-size:5px;">'+type+'</i></p>';
                    buffer_sync += ' </td>';
                    buffer_sync += '</tr>';
                    n_sync++;
                } else {
                    buffer += '<tr >';
                    buffer += '	<td style="font-size:12px; padding:0 10px;">';
                    buffer += '  <p >'  +name+'</p>';
                    buffer += '  <p style="float:right;"><b style="color:blue;">'+tmp_price+'</b>/<i style="font-size:5px;">'+type+'</i></p>';
                    buffer += ' </td>';
                    buffer += '</tr>';
                }
            }

            $table.empty();
            $table.append(buffer);
            $count.text('SHOWING '+SQL_ARRAY.length+' PRODUCT(S)');

            if(n_sync) {
                $table_sync.empty();
                $table_sync.append(buffer_sync);
                $table_sync.show();

                $count_sync.text(n_sync+' PRODUCT(S) NEED TO SYNCHRONIZE');
                $count_sync.css('color', 'red');
                $count_sync.show();
            } else {
                $table_sync.hide();
                $count_sync.hide();
            }

            callback();
        });
    });
}

function product_list_unused(callback) {

    $status.set('CHECKING FOR UNUSED ITEMS');

    var search_date  = get_date();

    var module       = get_core_module();
    var serialize    = '&act=products-list';
        serialize   += '&search=';
        serialize   += '&date=' + search_date;
        serialize   += '&usr=' + $SETTINGS.user.id;
        serialize   += '&idl=' + $SETTINGS.language.id;

    $.ajax({
        url: module,
        data: serialize,
        dataType: 'json',
        success: function(data) {

            var $table      = $('#sync-master-unused');
            var buffer      = '';

            ssql_load('LIST_CATALOG', 'ALL', function(ssql_data) {
                ssql = ssql_data.script;

                ssql = ssql.replace(/@:search:/g, '');
                ssql = ssql.replace(/@:date:/g, search_date);

                sql_data(ssql, function(offline) {

                for(var i=0; i<offline.length; i++) {

                        if(!product_exist(offline[i].product, data)) {
                            // product is not available anymore on server
                            buffer += '<tr data-item=\''+JSON.stringify(offline[i])+'\'>'
                            buffer += '<td style="padding:10px;">';
                            buffer += '    <span>'+offline[i].product+'</span>';
                            buffer += '</td>';
                            buffer += '</tr>'
                        }

                }

                if(buffer.length == 0) {
                    buffer += '<tr >'
                    buffer += '<td style="padding:10px;">';
                    buffer += '    <span>NO DATA</span>';
                    buffer += '</td>';
                    buffer += '</tr>'
                }

                $table.empty();
                $table.append(buffer);

                callback();

                });
            });

        }
    });
}