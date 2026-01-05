function buffer_item_promotion(mode, data) {
    // not all company has percent or value selection
    // by default, the value is in percent or not in currency value
    // i'm dead :(
    // i'm dead :(
    // i'm dead :(

    // UPDATE 2018-11-14
    // i try to fix this!

    console.log('---promo---')
    console.log(data);

    var buffer = '';
    var code = mode == 'online' ? data.exc_number : data.code;
    var value = mode == 'online' ? data.promo : data.value;
    var type = '';
    //var label   = '';

    // akan selalu true karena database offline statik
    // baris [else] seharusnya bisa dihapus (belum ditest)
    //if(data.hasOwnProperty('promo_valprec')) {
    console.log('[promo_valprec] supported! (' + data.promo_valprec + ')');

    switch (data.promo_valprec) {
        case 'V':
            type = $SETTINGS.currency.name;
            break;
        case 'P':
        default:
            type = '%';
            break;
    }
    //}
    /*
    else {
        console.log('Doesn\'t support [promo_valprec] column!');

        switch(mode) {
            case 'offline': type = '%'; break;                
            case 'online':  type = $SETTINGS.currency.name; break;                
        }
    }
    */

    //label   = code+' (-'+value+type+')';

    buffer += '<li class="item-content" data-item=\'' + JSON.stringify(data) + '\' data-type="' + mode + '" data-code="' + code + '" data-value="' + value + '" >';
    buffer += '<div class="item-inner">';
    buffer += '  <div class="item-title">';
    if (mode == 'online') {
        buffer += '<p style="margin:0;"><b>' + (data.f_name + ' ' + data.l_name).toUpperCase() + '</b></p>';
        buffer += '<p style="margin:0; font-size:15px;">' + code + '</p>';
        //buffer += '<p style="margin:0; font-size:15px;">Discount value: '+'-'+value+type+'</p>';
    } else {
        buffer += '<p style="margin:0;"><b>' + code + '</b></p>';
        buffer += '<p style="margin:0; font-size:15px;">Discount value: ' + '-' + value + ' ' + type + '</p>';
    }
    buffer += '  </div>';
    buffer += '  <a href="#" class="button apply" style="width:80px"><b>Apply</b></a>';
    buffer += '</div>';
    buffer += '</li>';

    // dont show if promotion is expired
    //if(data.hasOwnProperty('exp_date_to')) {
    //    console.log('[exp_date_to] supported! ('+data.exp_date_to+')');
    //}

    return buffer;
}

function buffer_item_currency(data, type, checked, disabled) {
    console.log('buffer_item_currency', JSON.stringify(data));
    console.log(type);

    var paycode = '';
    var prefix = '';
    var label = '';
    var buffer = '';

    var is_currency_match = type == 'credit_card' && checked ? (data.set_default ? true : false) : $SETTINGS.currency.id == data.idx_currency;

    switch (type) {
        case 'cash':
            paycode = 'CASH'; //CA 3.0.17
            prefix = 'CASH';
            break;
        case 'credit_card':
            paycode = 'CC';
            prefix = 'CREDIT CARD';
            break;
        case 'pay_on_tour':
            paycode = 'POT';
            prefix = label_pot.toUpperCase(); //'PAY ON TOUR';
            break;
    }

    label = '<span style=\'font-weight:100;\'>' + prefix + '/</span>' + data.code;
    buffer = '';

    buffer += '<li class="root" data-item=\'' + JSON.stringify(data) + '\' data-type="' + type + '" data-code="' + paycode + '">';
    buffer += '<div class="item-content ' + (disabled && !string_to_boolean($SETTINGS.payment_manual) ? 'disabled' : '') + '">';
    buffer += ' <div class="item-inner">';
    buffer += '    <div class="item-title label">';

    buffer += '       <div class="list-block" style="margin:0; font-size:inherit;">';
    buffer += '           <ul style="padding:0;">';
    buffer += '           <li >';
    buffer += '               <label class="label-checkbox item-content">';
    buffer += '                   <input type="checkbox" data-type="' + type + '" ' + (is_currency_match ? (checked ? ' checked="checked" ' : '') : '') + ' >';
    buffer += '                   <div class="item-media">';
    buffer += '                       <i class="icon icon-form-checkbox"></i>';
    buffer += '                   </div>';
    buffer += '                   <div class="item-inner border-clear">';
    buffer += '                       <div class="item-title" style="margin-top:-10px; white-space:normal;">';
    buffer += '                         <b id="' + type + '_' + data.idx_currency + '_label" data-label="' + label + '">' + label + ' ' + (is_currency_match && type == 'cash' ? '<i style="font-size:50%; font-weight:normal;">(default)</i>' : '') + '</b>';
    buffer += '                       </div>';
    buffer += '                   </div>';
    buffer += '               </label>';
    buffer += '           </li>';
    buffer += '           </ul>';
    buffer += '       </div>';

    buffer += '    </div>';
    buffer += '    <div class="item-input">';
    buffer += '        <input id="' + type + '_' + data.idx_currency + '_original_value" type="hidden" value="' + (is_currency_match ? (checked ? SESSION.transaction_payment : 0) : 0) + '" />';
    buffer += '        <input id="' + type + '_' + data.idx_currency + '_exchange_value" type="number" value="' + (is_currency_match ? (checked ? rates_convert($SETTINGS.currency.id, data.idx_currency, type, SESSION.transaction_payment) : 0) : 0) + '" placeholder="value" ' + (is_currency_match ? (checked ? 'class="focus-text"' : '') : '') + ' ' + (is_currency_match ? (!checked ? 'disabled' : '') : 'disabled') + '>'; //type == 'credit_card'
    buffer += '    </div>';
    buffer += ' </div>';
    buffer += '</div>';
    buffer += '</li>';
    return buffer;
}
function buffer_item_guest(id, aci, age) {
    var buffer = '';
    var $aci = aci.substring(0, 1)
    console.log(aci, age)

    buffer += '<ul class="guest" data-id="' + id + '" style="position:relative; top:-20px;">';
    buffer += ' <li style="background:#ddd; color:#000;">';
    buffer += '     <div class="item-content" style="min-height:0;">';
    buffer += '         <div class="item-inner" style="min-height:0; padding-top:0; padding-bottom:0;">';
    buffer += '             <div class="item-title label">' + aci + '</div>';
    buffer += '             <div class="item-input"></div>';
    buffer += '         </div>';
    buffer += '     </div>';
    buffer += ' </li>';
    buffer += ' <li>';
    buffer += '     <div class="item-content">';
    buffer += '         <div class="item-inner">';
    buffer += '             <div class="item-title label">Title</div>';
    buffer += '             <div class="item-input">';
    buffer += '                 <select class="guest-title">';
    console.log($aci)
    var buffer1 = ''
    switch ($aci) {
        case 'A':
            buffer1 = '                 <option value="MR">Mr.</option>';
            buffer1 += '                 <option value="MRS">Mrs.</option>';
            buffer1 += '                 <option value="MS">Ms.</option>';
            break;
        case 'C':
            buffer1 = '                 <option value="CHD" selected>Chd</option>';
            break;
        case 'I':
            buffer1 = '                 <option value="INF" selected>Inf</option>';
            break;
    }
    buffer += buffer1
    buffer += '                 </select>';
    buffer += '             </div>';
    buffer += '         </div>';
    buffer += '     </div>';
    buffer += ' </li>';
    buffer += ' <li>';
    buffer += '     <div class="item-content">';
    buffer += '         <div class="item-inner">';
    buffer += '             <div class="item-title label">Full Name</div>';
    buffer += '             <div class="item-input">';
    buffer += '                 <input class="guest-fullname" type="text" placeholder="Guest" value="">';
    buffer += '             </div>';
    buffer += '         </div>';
    buffer += '     </div>';
    buffer += ' </li>';
    /*
    buffer += ' <li>';
    buffer += '     <div class="item-content">';
    buffer += '         <div class="item-inner">';
    buffer += '             <div class="item-title label">Age</div>';
    buffer += '             <div class="item-input">';
    buffer += '                 <input type="number" placeholder="Age" value="">';
    buffer += '             </div>';
    buffer += '         </div>';
    buffer += '     </div>';
    buffer += ' </li>';
    */
    buffer += '</ul>';
    return buffer;
}
function buffer_item_cart(data) {
    /*
        TOLD BY: PAK ANANG (2018-02-28)
    
        4th discount only available if transaction items are less than 3 in cart!
        OR can't be applied if promo field is not zero.
    
        In online mode, 3th & 4th discount are come in [promo] field,
        In offline mode, 3th discount is come in [disc1] field,
        In offline mode, 4th discount is come in SESSION.transaction_voucher_disc,
        In offline mode, 3th & 4th discount must saved in [promo] field
    */

    var n_promotion = !isNaN(parseFloat(data.promotion)) ? data.promotion : 0;
    var n_discount_online = !isNaN(parseFloat(data.promo)) ? data.promo : 0;
    var n_discount_offline = !isNaN(parseFloat(data.disc1)) ? data.disc1 : 0;
    var n_discount = 0;

    switch ($MODE) {
        case 'online':
            n_discount = n_discount_online;
            break;
        default:
            /* offline */
            if (n_discount_offline == 0) {
                n_discount = SESSION.transaction_voucher_disc;
            } else {
                n_discount = n_discount_offline;
            }
    }

    var n_total_disc = parseFloat(n_promotion) + parseFloat(n_discount);

    var n_total_price_pax = data.total_price_pax;
    var n_total_price_surcharge = data.total_price_surcharge;

    var n_amount = $MODE == 'online' ? data.amount : data.price;
    var n_subtotal = parseFloat(n_amount) - n_total_disc;
    n_subtotal = n_subtotal.toFixed(2); // 3.0.47
    var buffer = '';

    console.log(n_promotion)

    var format_date = '';
    if ($MODE == 'online') {
        // skip formatting
        // why? don't risk yourself for error :)
        format_date = data.pickup.substr(0, 10);
    } else {
        format_date = date_format(data.pickup, 'dd/MM/yyyy');
    }

    //var dt_buffer_lp = '';
    //if($SETTINGS.lp_status=='true'){
    //    dt_buffer_lp = JSON.stringify($paramInsercion);
    // }
    console.log(data)
    buffer += '<li id="li-item-' + data.idx_transaction + '" data-item=\'' + JSON.stringify(data) + '\' style="margin-bottom:10px; padding:10px; background:#fff;">';
    buffer += ' <b >' + data.excursion + '</b>';
    buffer += ' <br><i>on ' + format_date + '</i>';
    buffer += ' <hr>';
    buffer += ' <b >Details</b>';
    buffer += ' <br><span style="font-size:14px;">Pickup at <i>' + data.hotel + '</i></span>';
    buffer += ' <br><span style="font-size:14px;">Pickup on <i>' + data.pickup.substr(11, 5) + '</i></span>';
    buffer += ' <br><span style="font-size:14px;">For <i>' + data.adult + 'x adult</i>, <i>' + data.child + 'x child</i>, <i>' + data.infant + 'x infant</i></span>';
    buffer += ' <table >';
    buffer += '     <tr >';
    buffer += '         <td><b >Total price of pax</b></td>';
    buffer += '         <td style="text-align:right;"><i style="font-size:14px;">' + format_currency(n_total_price_pax, false) + ' ' + data.currency + '</i></td>';
    buffer += '     </tr>';
    buffer += '     <tr >';
    buffer += '         <td><b >Total price of surcharge</b></td>';
    buffer += '         <td style="text-align:right;"><i style="font-size:14px;">' + format_currency(n_total_price_surcharge, false) + ' ' + data.currency + '</i></td>';
    buffer += '     </tr>';
    /*
    buffer += '     <tr >';
    buffer += '         <td><b >Normal price</b></td>';
    buffer += '         <td style="text-align:right;"><i style="font-size:14px;">'+n_amount+' '+data.currency+'</i></td>';
    buffer += '     </tr>';
    */
    if (string_to_boolean($SETTINGS.discount_split_view)) {
        /*
        buffer += '     <tr >';
        buffer += '         <td><b>Voucher</b></td>';
        buffer += '         <td style="text-align:right;"><i style="font-size:14px; color:red;">-'+n_voucher+' '+data.currency+'</i></td>';
        buffer += '     </tr>';
        */
        buffer += '     <tr >';
        buffer += '         <td><b>Promotional</b></td>';
        buffer += '         <td style="text-align:right;"><i style="font-size:14px; color:red;">-' + format_currency(n_promotion, false) + ' ' + data.currency + '</i></td>';
        buffer += '     </tr>';
        buffer += '     <tr >';
        buffer += '         <td><b>Discount</b></td>';
        buffer += '         <td style="text-align:right;"><i style="font-size:14px; color:red;">-' + format_currency(n_discount, false) + ' ' + data.currency + '</i></td>';
        buffer += '     </tr>';
    } else {
        buffer += '     <tr >';
        buffer += '         <td><b>Discount</b></td>';
        buffer += '         <td style="text-align:right;"><i style="font-size:14px; color:red;">-' + format_currency(n_total_disc, false) + ' ' + data.currency + '</i></td>';
        buffer += '     </tr>';
    }
    buffer += '     <tr >';
    buffer += '         <td><b >Subtotals</b></td>';
    buffer += '         <td style="text-align:right;"><b style="font-size:16px; color:green;">' + format_currency(n_subtotal, false) + ' ' + data.currency + '</b></td>';
    buffer += '     </tr>';
    buffer += ' </table>';
    buffer += ' <div style="padding: 10px 0;">';
    buffer += '     <div style="width:100px; display:inline-block;">';
    buffer += '         <a href="#" class="button remove button-fill color-red">Remove</a>';
    buffer += '     </div>';
    buffer += ' </div>';
    buffer += '</li>';

    // calculate total payment & discount
    SESSION.transaction_payment += parseFloat(n_subtotal); // data.total isn't correct !
    //SESSION.transaction_promotion   += parseFloat(n_promotion);
    //SESSION.transaction_discount    += parseFloat(n_discount);

    return buffer;

}
function buffer_item_surcharge(data) {

    var buffer_surcharge = '';
    var mandatory = '1';

    // hotel surcharge doesn't has mandatory column
    // and it should mandatory by system

    if (data.hasOwnProperty('mandatory')) {
        mandatory = string_to_boolean(data.mandatory);
    }

    // no different between online & offline :)

    buffer_surcharge += '<tr data-item=\'' + JSON.stringify(data) + '\'>';
    buffer_surcharge += '   <td style="padding:0;">';
    buffer_surcharge += '       <div class="list-block" style="margin:0; font-size:inherit;">';
    buffer_surcharge += '           <ul>';
    buffer_surcharge += '           <li>';
    buffer_surcharge += '               <label class="label-checkbox item-content" style="padding-left:10px;">';
    buffer_surcharge += '                   <input type="checkbox" value="' + data.idx_surcharge + '" ' + (mandatory ? 'checked="checked" disabled' : '') + ' >';
    buffer_surcharge += '                   <div class="item-media">';
    buffer_surcharge += '                       <i class="icon icon-form-checkbox"></i>';
    buffer_surcharge += '                   </div>';
    buffer_surcharge += '                   <div class="item-inner">';
    buffer_surcharge += '                       <div class="item-title" style="margin-top:-10px; white-space:normal;">' + data.surcharge + '</div>';
    buffer_surcharge += '                   </div>';
    buffer_surcharge += '               </label>';
    buffer_surcharge += '           </li>';
    buffer_surcharge += '           </ul>';
    buffer_surcharge += '       </div>';
    buffer_surcharge += '   </td>';
    buffer_surcharge += '   <td style="text-align:center;">' + (mandatory ? 'YES' : 'NO') + '</td>';
    buffer_surcharge += '   <td style="text-align:right;">' + format_currency(data.price, false) + ' ' + $SETTINGS.currency.name + '</td>';
    buffer_surcharge += '</tr>';

    //console.log(buffer_surcharge)
    return buffer_surcharge;
}
function buffer_item_pax(data, locked_to_zero) {
    var buffer_item = '';
    var aci_type = charge_type($MODE == 'online' ? data.chargetype : data.charge_type);
    var pax_info = get_pax_info();
    var locked_to_zero = pax_info[0].charge_type == 'S' ? true : false;

    var x_data = data;

    // update !
    // test only
    if ($MODE != "online") {
        if ((data.charge_type != 'S') && (locked_to_zero)) {
            x_data.rate = 0;
            x_data.total = 0;
        }
    }

    // buffer !
    if ($MODE == "online") {

        buffer_item += '<tr data-item=\'' + JSON.stringify(data) + '\'>';
        switch (aci_type) {
            case 'child':
            case 'infant':
                buffer_item += '<td style="padding:10px;">' + data.pax + 'x ' + aci_type + '<br><i style="font-size:10px;">' + data.age + ' years old</i></td>';
                break;
            case 'adult':
                buffer_item += '<td style="padding:10px;">' + data.pax + 'x ' + aci_type + '</td>';
                break;
            default:
                buffer_item += '<td style="padding:10px;">' + aci_type + '</td>';
        }
        buffer_item += '	<td style="text-align:center;">' + format_currency(data.sales, false) + ' ' + $SETTINGS.currency.name + '</td>';
        buffer_item += '	<td style="text-align:right;">' + format_currency(data.sales_total, false) + ' ' + $SETTINGS.currency.name + '</td>';
        buffer_item += '</tr>';

    } else {

        buffer_item += '<tr data-item=\'' + JSON.stringify(data) + '\'>';
        switch (aci_type) {
            case 'child':
            case 'infant':
                buffer_item += '<td style="padding:10px;">' + data.pax + 'x ' + aci_type + '<br><i style="font-size:10px;">' + data.age + ' years old</i></td>';
                break;
            case 'adult':
                buffer_item += '<td style="padding:10px;">' + data.pax + 'x ' + aci_type + '</td>';
                break;
            default:
                buffer_item += '<td style="padding:10px;">' + aci_type + '</td>';
        }
        buffer_item += '	<td style="text-align:center;">' + format_currency(data.rate, false) + ' ' + $SETTINGS.currency.name + '</td>';
        buffer_item += '	<td style="text-align:right;">' + format_currency(data.total, false) + ' ' + $SETTINGS.currency.name + '</td>';
        buffer_item += '</tr>';

    }

    return buffer_item;
}
function buffer_input_pax(aci, min_pax, max_pax, min_age, max_age) {
    var item = '';

    var val = (charge_type(aci) == 'adult' ? min_pax : 0); //NEW: 3.0.42 //OLD: (2)
    var min_pax = (charge_type(aci) == 'adult' ? min_pax : 0); //NEW: 3.0.42 //OLD: (1) min_pax BUKAN dari parameter lagi!

    if (max_pax != 0) {
        item += '<div class="pax input-stepper" style="position:relative;">';
        item += '   <input type="text" value="' + val + '" min="' + min_pax + '" max="' + max_pax + '" min-age="' + min_age + '" max-age="' + max_age + '" readonly id="i-booking-pax-' + charge_type(aci) + '">';
        item += '   <label>'
        item += '       <p style="margin:0;">' + charge_type(aci) + '(s)'
        item += '       <p style="margin:0; font-size:10px; font-weight:100;">' + min_pax + '-' + max_pax + '</p>'
        item += '   </label>';
        item += '   <div class="stepper-control row">';
        item += '       <div class="col-50"><a href="#" class="button" data-input-stepper-increase>+</a></div>';
        item += '       <div class="col-50"><a href="#" class="button" data-input-stepper-decrease>-</a></div>';
        item += '   </div>';
        item += '   <div id="div-age-of-' + charge_type(aci) + '"></div>'
        item += '</div>';
    }

    return item;
}
function buffer_input_age(ci, min, max) {
    var item = '';

    item = '<div class="age input-stepper ' + ci + '" style="position:relative;">'

    item += '	<input type="text" value="' + min + '" min="' + min + '" max="' + max + '" readonly style="font-weight:100;">';
    item += '	<label style="font-weight:100; font-style:italic;">'
    item += '       <p style="margin:0;">years old</p>'
    item += '       <p style="margin:0; font-size:10px; font-weight:100;">' + min + '-' + max + '</p>'
    item += '   </label>';
    item += '	<div class="stepper-control row">';
    item += '		<div class="col-50"><a href="#" class="button" data-input-stepper-increase>+</a></div>';
    item += '		<div class="col-50"><a href="#" class="button" data-input-stepper-decrease>-</a></div>';
    item += '	</div>';

    item += '</div>';

    return item;
}
function buffer_item_exchangerates(data) {
    console.log(JSON.stringify(data))
    var rate = parseFloat(data.rate);
    var ratedate = data.ratedate.substr(0, 10);

    if ($MODE == 'online') {
        // format required, the date comes in dd/MM/yyyy
        ratedate = ratedate.split('/');
        ratedate = ratedate[2] + '-' + ratedate[1] + '-' + ratedate[0];
    }

    var diff = get_date_different(ratedate, get_date().substr(0, 10));
    var item = '';

    var ca_rate = parseInt(rate) != 0 ? rate.toFixed(2) : rate.toFixed(6);

    var cc_rate = parseFloat(ca_rate) + get_percent_value(ca_rate, $SETTINGS.tax_for_credit_card);
    cc_rate = parseInt(cc_rate) != 0 ? cc_rate.toFixed(2) : cc_rate.toFixed(6);

    var prefix = $SETTINGS.currency.name == data.codefrom ? '<b style="color:red;">' : '';
    var suffix = $SETTINGS.currency.name == data.codefrom ? '</b>' : '';;

    item += '<tr data-item=\'' + JSON.stringify(data) + '\'>';
    item += '<td>' + prefix + data.codefrom + ' to ' + data.codeto + suffix + '</td>';
    item += '<td>' + prefix + ca_rate + suffix + '</td>';
    item += '<td>' + prefix + cc_rate + suffix + '</td>';
    item += '</tr>';

    $('.rates-date').data('date', ratedate);
    $('.rates-date').text('Rates: ' + date_format(ratedate, "dd MONTH yyyy") + ' (' + diff + ' day[s] old)');

    return item;
}

function buffer_item_transaction_header(data, next, prev) {
    var guest = data.guestname.replace(/ *\([^)]*\) */g, "").toUpperCase();
    var date_voucher = data.date_tr + ' - ' + data.voucher + '/' + data.barcode;
    var excursion = (data.excursion_alias !== '' ? data.excursion_alias : data.excursion);
    var pickup = '  PICKUP : ' + data.pickup;
    var pax_total = parseInt(data.paxa) + parseInt(data.paxc) + parseInt(data.paxi);
    //var pax_info        = data.paxa+'A+'+data.paxc+'C+'+data.paxi+'I';
    var pax = '  PAX    : ' + pax_total; //+' ['+pax_info+']';
    var price = '  TOTAL  : ' + data.currency + ' ' + format_currency(data.totalsales, false);

    var buffer = '';

    var print_header = ['SEPARATOR', guest, date_voucher];
    var print_body = ['NEWLINE', excursion, pickup, pax, price];

    if (data.idx_mfexcursion) {
        if (prev != data.voucher) {
            buffer += '<div class="content-block-title" style="margin-top:-10px !important;">'
            buffer += ' <span style="font-size:14px; font-weight:bold;">' + guest + '</span><br>'
            buffer += ' <span style="font-size:10px; ">Phone : ' + data.telp + '</span><br>'
            buffer += ' <span style="font-size:10px;">' + date_voucher + (data.stat == 'CANCELED' ? ' <i style="color:red;">CANCELED</i>' : '') + '</span><br>'
            buffer += '</div>'
            buffer += '<div class="list-block">'
            buffer += ' <ul data-print=\'' + JSON.stringify(print_header) + '\' style="border-radius:5px;">'
            prev = data.voucher;
        }

        buffer += ' <li data-item=\'' + JSON.stringify(data) + '\'>'
        buffer += ' <a  data-print=\'' + JSON.stringify(print_body) + '\' href="#" class="item-content item-link">'
        buffer += '     <div class="item-inner">'
        buffer += '         <div class="item-input">'
        buffer += '             <div class="item-title" style="font-size:11px; padding:10px 0;">'
        buffer += '                 <span >' + excursion + '</span><br>'
        buffer += '                 <span style="font-size:8px;">' + pickup + '</span><br>'
        buffer += '                 <span style="font-size:8px;">' + pax + '</span><br>'
        buffer += '                 <span style="font-size:8px;">' + price + '</span><br>'
        buffer += '             </div>'
        buffer += '         </div>'
        buffer += '     </div>'
        buffer += ' </a>'
        buffer += ' </li>'

        if (prev != next) {
            buffer += ' </ul>'
            buffer += '</div>'
        }
    }
    return buffer;
}

function buffer_item_transaction(data, unsync) {
    var number = 0;
    var buffer = '';

    var guestname = data.guestname; //data.fname+' '+data.lname;
    var totalpax = parseInt(data.paxa) + parseInt(data.paxc) + parseInt(data.paxi);
    //var hotelroom   = (data.hotel+(data.room!='' && data.room!='.'? '/'+data.room : '')).toUpperCase();
    var hotelroom = data.hotel.toUpperCase();
    var tourdate = data.pickup.split(' ')[0];
    var pickuptime = data.pickup.split(' ')[1];

    var promosum = parseFloat(data.promo); // discount+promo_p

    var namelist = "";
    var surcharges = "";

    // check for support of namelist column
    if (data.hasOwnProperty('namelist')) {
        namelist = data.namelist;
        namelist = namelist.replace(/\([^\)]*\)/g, '');  // remove age
        namelist = namelist.replace(/<[^>]*>/g, ',');    // remove html tag

        // format namelist
        namelist = namelist.split(',');
        for (var j = 0; j < namelist.length; j++) {
            var name = namelist[j].trim();

            if (name.length > 4) {
                number++;
                buffer += number + '. ' + name.toUpperCase() + '<br>';
            }
        }
        // remove last {br}
        namelist = buffer.slice(0, - 4);
    }

    // check for surcharge existence (prevent error)
    if (data.surcharge_detail) {
        surcharges = data.surcharge_detail.split(',');
        buffer = "";
        for (var j = 0; j < surcharges.length; j++) {
            var name = surcharges[j].trim();

            if (name.length) {
                buffer += '+ ' + name.toUpperCase() + '<br>';
            }
        }
        // remove last {br}
        surcharges = buffer.slice(0, - 4);
    }

    buffer = '<tr data-item=\'' + JSON.stringify(data) + '\'>';
    buffer += ' <td style="text-align:center; width:150px;">';
    buffer += '     <b>' + data.voucher + '</b>';
    buffer += '     <br><span style="font-size:10px;">' + data.date_tr + '</span>';
    if (data.hasOwnProperty('stat')) {
        buffer += '     <br><br>';
        buffer += '     <span style="font-size:14px;">';
        switch (data.stat) {
            case 'x':
            case 'y':
                buffer += '<span style="font-weight:100; color:red;">(DELETED)</span>';
                break;
            case '0':
            case '1':
            case '':
                buffer += '';
                break;
            default:
                buffer += '<span style="font-weight:100; ' + (data.stat.toUpperCase() == 'PAID' ? 'color:green;' : 'color:red;') + '">(' + data.stat + ')</span>';
        }
        buffer += '     </span>';
    }
    buffer += ' </td>';
    buffer += '	<td >';
    buffer += '	    <span style="font-size:16px;"><b>' + data.excursion + '</b></span>';
    buffer += '	    <br><span style="font-size:10px;">TOUR DATE: ' + tourdate + '</span>';
    //buffer += '		<hr><span style="position:relative; top:-5px; font-size:10px;">'+data.title.toUpperCase()+'</span>';
    buffer += '		<br><span style="position:relative; display:block; padding:5px 0;">' + guestname + '</span>';
    buffer += '		<span style="font-size:10px;">' + hotelroom + ' on ' + pickuptime + '</span>';
    buffer += '		<br><span style="font-size:10px;">' + data.paxa + 'x adult, ' + data.paxc + 'x child, ' + data.paxi + 'x infant</span>';

    if (namelist.length) {
        buffer += '     <hr><span >Guest list</span>'
        buffer += '     <br><span style="font-size:10px;">' + namelist + '</span>'
    }

    buffer += '		<hr><span >Payment detail</span>';
    buffer += '     <br><span style="font-size:10px;">Excursion: <i>' + data.currency + '</i> ' + format_currency(data.salesrate, false) + '</span>'

    if (promosum > 0) {
        buffer += '     <br><span style="font-size:10px;">Discount: <b style="color:red; font-weight:normal;"><i>' + data.currency + '</i> -' + format_currency(promosum, false) + '</b></span>'
    }

    if (surcharges.length) {
        buffer += '     <br><span style="font-size:10px;">Surcharge</span>'
        buffer += '     <br><span style="font-size:10px;">' + surcharges + '</span>'
    }

    buffer += '		<hr><span >Total payment</span>';
    buffer += '		<br><span style="font-size:16px;"><b>' + data.currency + ' ' + format_currency(data.totalsales, false) + '</b></span>';
    buffer += '		<hr><span >Method</span>';
    buffer += '     <br><span style="font-size:10px;">' + data.val_payment;
    buffer += '         </span>';
    buffer += '		<hr><span >by ' + data.supplier + ' / ' + data.agent + '</span>';
    buffer += '		<hr>';
    buffer += '     <p><a href="#" class="button button-fill print">Print as Voucher</a></p>';

    if (unsync && data.stat == '1') {
        buffer += '     <p><a href="#" class="button unsync">Unsync / Resync</a></p>';
    }

    buffer += '	</td>';
    buffer += '</tr>';

    return buffer;
}