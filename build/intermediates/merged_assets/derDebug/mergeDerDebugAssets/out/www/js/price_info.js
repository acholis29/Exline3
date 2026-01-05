function get_pax_info() {
    var paxa    = parseInt($('#i-booking-pax-adult').val());
    var paxc    = parseInt($('#i-booking-pax-child').val());
    var paxi    = parseInt($('#i-booking-pax-infant').val());
    var pupp    = get_pupp();
    
    var pax_info = [];
    
    switch(pupp) {
        case 'Per Unit':
            pax_info.push({
                charge_type: 'S',
                pax: $SETTINGS.initial_company == 'GKT' ? (paxa+paxc+paxi) : '1',
                age: 0
            });
        case 'Per Pax':
            pax_info.push({
                charge_type: 'A',
                pax: paxa,
                age: 0
            });
            
            if(paxc>0) {
                $('#div-age-of-child > .age').each(function(i,e) {
                    pax_info.push({
                        charge_type: 'C',
                        pax: '1',
                        age: $(this).find('input[type=text]').val()
                    });
                });
            }
            if(paxi>0) {
                $('#div-age-of-infant > .age').each(function(i,e) {
                    pax_info.push({
                        charge_type: 'I',
                        pax: '1',
                        age: $(this).find('input[type=text]').val()
                    });
                });
            }
    }

    return pax_info;
}

function get_total_price_detail(currency) {
    var total = parseFloat(0);
    
    if($MODE=="online") {
        $('#detail-price-pax tr').each(function(i, e) {
            var $this = $(e),
                $data = $this.data('item');

            total += parseFloat($data.sales_total);
        });

        $('#detail-price-surcharge tr').each(function(i, e) {
            var $this = $(e),
                $data = $this.data('item');

            if($this.find('input[type=checkbox]').prop('checked')) {
                total += parseFloat($data.price);
            }
        });
    } else {
        $('#detail-price-pax tr').each(function(i, e) {
            var $this = $(e),
                $data = $this.data('item');
                                       
            total += parseFloat($data.total);
        });
        
        $('#detail-price-surcharge tr').each(function(i, e) {
            var $this = $(e),
                $data = $this.data('item');
                                             
            if($this.find('input[type=checkbox]').prop('checked')) {
                total += parseFloat($data.price);
            }
        });
    }
    
    return total+(currency ? ' '+$SETTINGS.currency.name : '');
}

function show_price_item(callback) {

    var paxa    = $('#i-booking-pax-adult').length != 0 ? parseInt($('#i-booking-pax-adult').val()) : 0;
    var paxc    = $('#i-booking-pax-child').length != 0 ? parseInt($('#i-booking-pax-child').val()) : 0;
    var paxi    = $('#i-booking-pax-infant').length != 0 ? parseInt($('#i-booking-pax-infant').val()) : 0;
        
    $loader.show();
    $status.set('LOADING PRICE INFO');

    $('#detail-pax').hide();
    $('#detail-surcharge').hide();
    $('#detail-remark').hide();
    $('#detail-remark-fields').hide();
    $('#detail-button').hide();

    $('#detail-price-pax').empty();
    $('#detail-price-surcharge').empty();

    /* Variable total pax for loroparque */
    $SETTINGS.loroparque.Cantidad = parseInt(paxa) + parseInt(paxc) + parseInt(paxi);

    if($MODE=="online") {
        /* legacy 3.0.17 (older) */
        /*
        get_price_of_chargetype_online(get_pax_info(), function() {
            get_price_of_surcharge_pax_online(paxa, paxc, function() {
                get_price_of_surcharge_hotel_online(paxa, paxc, paxi, function() {
                    callback();
                });
            });
        });
        */
        get_price_online_all(get_pax_info(), paxa, paxc, paxi, function() {
            callback();
        });
    } else {
       var item    = '';
        
        //preparing date (yyyy-MM-dd)
        var d       = new Date($tour_calendar.value[0]),
            year    = d.getFullYear(),
            month   = d.getMonth()+1,
            day     = d.getDate();
            date    = '';
        
            month	= month < 10 ? '0'+month : month;
            day	    = day < 10 ? '0'+day : day;
            date    = year+'-'+month+'-'+day;
                
        get_price_of_chargetype_all(date, get_pax_info(), function() {
            get_price_of_surcharge_pax(date, paxa, paxc, paxi, function(data_surpax) {
                for(var i=0; i<data_surpax.length; i++) {
                    $('#detail-price-surcharge').append(buffer_item_surcharge(data_surpax[i]));
                } 
                get_price_of_surcharge_hotel(date, paxa, paxc, function(data_surtel) {
                    for(var i=0; i<data_surtel.length; i++) {
                        $('#detail-price-surcharge').append(buffer_item_surcharge(data_surtel[i]));
                    }
                    callback();
                });
            });
        });
        
    }
}

function get_price_info() {
    var price_info = [];
    
    $('#detail-price-pax tr').each(function(i,e) {
        var $this   = $(e);
        var item    = $this.data('item');
                    
        if($MODE=="online") {
                                   
        } else {
            price_info.push({
                type: 'pax',
                charge_type: item.charge_type,
                age: item.age,
                pax: item.pax,
                price: item.rate,
                total: item.total
            });
        }
    });
    
    $('#detail-price-surcharge tr').each(function(i,e) {
        var $this   = $(e);
        var item    = $this.data('item');
        
        if($this.find('input[type=checkbox]').prop('checked')) {
            if($MODE=="online") {
                                         
            } else {
                price_info.push({
                    type: 'surcharge',
                    id_surcharge: item.idx_surcharge,
                    price: item.price
                });
            }
        }
    });
    
    return price_info;
}

function get_price_of_chargetype_all(date, data, callback) {
    
    get_price_of_chargetype(date, data[0].charge_type, data[0].pax, data[0].age, function(result) {
        
        $('#detail-price-pax').append(buffer_item_pax(result));
        
        if(data.length != 0) {
            data.shift();
        }
        
        if(data.length != 0) {
            get_price_of_chargetype_all(date, data, callback);
        } else {
            callback();
        }
        
    });
    
}

function get_price_of_surcharge_pax(date, paxa, paxc, paxi, callback) {
    var SURPAX_SQL = $SETTINGS.initial_company == 'GKT' ? 'GET_PRICE_SURPAX_GKT' : 'GET_PRICE_SURPAX';

    ssql_load(SURPAX_SQL, 'ALL', function(ssql_data) {
        ssql = ssql_data.script;

        ssql = ssql.replace(/@:id_excur:/g, $excursion.value[0].idx_excursion);
        ssql = ssql.replace(/@:id_excursub:/g, $excursion.value[0].idx_sub);
        ssql = ssql.replace(/@:id_market:/g, $SETTINGS.market.id);
        ssql = ssql.replace(/@:id_currency:/g, $SETTINGS.currency.id);
        ssql = ssql.replace(/@:date:/g, date);
        ssql = ssql.replace(/@:paxa:/g, paxa);
        ssql = ssql.replace(/@:paxc:/g, paxc);
        ssql = ssql.replace(/@:paxi:/g, paxi);
        ssql = ssql.replace(/@:paxac_total:/g, (parseInt(paxa)+parseInt(paxc)+parseInt(paxi)));
              
        sql(ssql, function(result) {
            SQL_ROWS  = result.rows;
            SQL_ARRAY = arr_props_to_lower(SQL_ROWS._array);

            callback(SQL_ARRAY);
        });
    });
}

function get_price_of_surcharge_hotel(date, paxa, paxc, callback) {
    ssql_load('GET_PRICE_SURTEL', 'ALL', function(ssql_data) {
        ssql = ssql_data.script;
              
        ssql = ssql.replace(/@:id_excur:/g, $excursion.value[0].idx_excursion);
        ssql = ssql.replace(/@:id_excursub:/g, $excursion.value[0].idx_sub);
        ssql = ssql.replace(/@:id_market:/g, $SETTINGS.market.id);
        ssql = ssql.replace(/@:id_currency:/g, $SETTINGS.currency.id);
        ssql = ssql.replace(/@:date:/g, date);
        ssql = ssql.replace(/@:paxa:/g, paxa);
        ssql = ssql.replace(/@:paxc:/g, paxc);
        ssql = ssql.replace(/@:id_hotel:/g, $hotel_area.value[0].idx_hotel);
              
        sql(ssql, function(result) {
            SQL_ROWS  = result.rows;
            SQL_ARRAY = arr_props_to_lower(SQL_ROWS._array);
                  
            callback(SQL_ARRAY);
        });
    });
}

function get_price_of_chargetype(date, aci, pax, age, callback) {
    
    var price  = {charge_type: aci, pax: pax, age: age, rate: 0, total: 0};
    
    ssql_load('GET_PRICE', 'ALL', function(ssql_data) {
        ssql = ssql_data.script;
              
        ssql = ssql.replace(/@:id_excur:/g, $excursion.value[0].idx_excursion);
        ssql = ssql.replace(/@:id_excursub:/g, $excursion.value[0].idx_sub);
        ssql = ssql.replace(/@:id_market:/g, $SETTINGS.market.id);
        ssql = ssql.replace(/@:id_currency:/g, $SETTINGS.currency.id);
        ssql = ssql.replace(/@:date:/g, date);
        ssql = ssql.replace(/@:aci:/g, aci);
        ssql = ssql.replace(/@:pax:/g, pax);
              
        if(aci != 'A') {
            ssql += " AND c_agefrom <= '"+age+"' ";
            ssql += " AND c_ageto >= '"+age+"' ";
        }
        ssql += " ORDER BY rowid DESC ";
              
        sql(ssql, function(result) {
            SQL_ROWS  = result.rows;
            SQL_ARRAY = arr_props_to_lower(SQL_ROWS._array);
            
            if(SQL_ROWS.length > 0) {
                price.rate  = SQL_ARRAY[0].hjual_asli;
                price.total = SQL_ARRAY[0].xprice;
            }
            
            callback(price);
        });
    });
}