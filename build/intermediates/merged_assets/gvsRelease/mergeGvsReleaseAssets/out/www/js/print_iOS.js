/*
function print_iOS(_data){
    alert(JSON.stringify(_data));
    scanPrint_iOS($data)
};
*/

function print_iOS($data, $title){
    var $_data = [];
    if(Array.isArray($data)) {
        $_data = $data;
    } else {
        $_data.push($data);
    };
    
    var $table  = $('#printer-list');
    var $button = $('#printer-print');
    var buffer  = '';
    var id_mac=[];
    //var buffer  = [];
    var i=0;

    $table.empty();
    $loader.show();
    
    function cekID(id){
        for(i=0; i<id_mac.length; i++){
            if(id_mac[i]==id){
                return true 
            }
        }
        return false;
    }

    
    ble.startScanWithOptions([], { reportDuplicates: false }, 
        
        function(devices) {
            if (!cekID(devices.id)){
                if(devices.name != undefined){
                    $table.append(printer_device_buffer_iOS(devices, i));
                    i+=1;    
                };
                id_mac.push(devices.id)
            }else{
                ble.stopScan(
                    function(sukses){console.log("scan complite")}, 
                    function(error){failure_print_iOS(error)}
                );
				$button.data('title', $title);
                $button.data('item', $_data);
                $app.popup('.popup-printer');       
                $loader.hide();
                i=0;
            }
        }, 
        function(error){
            failure_print_iOS(error)
            $app.alert('Couldn\'t find any paired bluetooth printer.<br>'
                      +'Please check your bluetooth connection!', $STRING.info_warning);
        }
    );

};

function failure_print_iOS(error){
    console.log(JSON.stringify(error))
};



function printer_device_buffer_iOS(data, i) {
    var device_name   = data.name;
    var divice_mac    = data.id;
    var buffer        = '';

    buffer += '<li data-item=\''+JSON.stringify(data)+'\'>'
    buffer += '<label class="label-checkbox item-content" style="padding-left:10px;">'
    buffer += '    <input type="checkbox" value="'+divice_mac+'" '+(i==0 ? 'checked="checked"' : '')+'>'
    buffer += '    <div class="item-media">'
    buffer += '        <i class="icon icon-form-checkbox"></i>'
    buffer += '    </div>'
    buffer += '    <div class="item-inner">'
    //buffer += '        <div class="item-title" style="margin-top:-10px; white-space:normal;">'+device_name+'</div>'
    buffer += '        <div class="item-title" style="margin-top:-10px; white-space:normal;">'
    buffer += '         <p ><b>'+device_name+'</b></p>'
    buffer += '         <p style="line-height:0;">'+divice_mac+'</p>'
    buffer += '        </div>'
    buffer += '    </div>'
    buffer += '</label>'
    buffer += '</li>'

    return buffer;
};


function printer_device_connect_iOS(device_print, callback) {
    if(device_print){
        
    console.log(JSON.stringify(device_print));

        
        ble.connect(device_print.id,
            function(status) {
                console.log(device.name+': '+status);
                callback(device_print);
            },
            function() {
                $app.alert('Turn on your printer before printing!<br>'
                          +'Failed to connect: <b>'+device.name+'</b>', $STRING.info_important);
            }
        );
        


    } else {
        $app.alert('Printer not selected!', $STRING.info_important);
    };
};

function printer_print_text_iOS(device_print, text, callback){

    ble.writeWithoutResponse(device_print.id, "18F0", "2AF1", 
    stringToBytes_iOS(text),
        function(result){
            callback();
            ble.disconnect(device_print.id, function(){},  function(){});
        } , 
        function(error){ 
            failure_print_iOS(error);
        }
    );
    
}

function printer_print_buffer_array_iOS(data, title) {
    var line        = '................................';

    buffer  = "\n"+title;
    buffer += "\nPRINTED ON "+date_format(get_date_time(), 'dd/MM/yyyy HH:mm');
    buffer += "\n";

    for(var i=0; i<data.length; i++) {
        switch(data[i]) {
            case 'SEPARATOR':
                buffer += "\n@:separator:";
                break;
            case 'NEWLINE':
                buffer += "\n";
                break;
            default:
                buffer += "\n"+data[i]
        }
    }
    // footer
    buffer += "\n@:separator:";
    buffer += "\n";
    buffer += "\n"+$SETTINGS.branch.name.toUpperCase();
    buffer += "\n"+$SETTINGS.string.address_of_branch.toUpperCase();
    buffer += "\nPhone   : "+$SETTINGS.string.phone;
    if($SETTINGS.string.hotline.length) {
    buffer += "\nHotline : "+$SETTINGS.string.hotline;
    }

    // printer space
    buffer += "\n\n\n";
    buffer += "\n-- cut here --";
    buffer += "\n\n";
    return buffer.replace(/@:separator:/g, line);
}

function printer_print_buffer_iOS(data) {
    var line        = '--------------------------------';
    var line_bottom = '________________________________';
    var number      = 0;
    var buffer      = '';

    //var guest       = (data.title + ' ' + data.fname + ' ' +data.lname).toUpperCase();
    var pax         = (parseInt(data.paxa)+parseInt(data.paxc)+parseInt(data.paxi)) + ' PAX [ '+ data.paxa + 'A | ' + data.paxc + 'C | ' +data.paxi + 'I ]';
    var promosum    = parseFloat(data.promo); // discount+promo_p
    var namelist    = "";
    var surcharges  = "";

    // check for support of namelist column
    if(data.hasOwnProperty('namelist')) {
        namelist    = data.namelist;
        namelist    = namelist.replace(/\([^\)]*\)/g, '');  // remove age
        namelist    = namelist.replace(/<[^>]*>/g, ',');    // remove html tag

        // format namelist
        namelist    = namelist.split(',');
        for(var j=0; j<namelist.length; j++) {
            var name = namelist[j].trim();

            if(name.length > 4) {
                number++;
                buffer += '\n '+number+'. '+name.toUpperCase();
            }
        }
        namelist    = buffer;
    }

    // check for surcharge existence (prevent error)
    if(data.surcharge_detail) {
        surcharges      = data.surcharge_detail.split(',');
        buffer          = "";
        for(var j=0; j<surcharges.length; j++) {
            var name = surcharges[j].trim();

            if(name.length) {
                buffer += '\n+ '+name.toUpperCase();
            }
        }
        // remove last {br}
        surcharges = buffer;
    }

    var total       = data.currency+' '+data.totalsales;
    var payment     = data.val_payment;
        payment     = payment.replace(/<[^>]*>/g, ',');

    buffer  = "            VOUCHER"
    buffer += "\n@:separator:"
    buffer += "\nNumb: "+data.voucher
    buffer += "\nDate: "+data.date_tr
    buffer += "\n@:separator:"
    buffer += "\n"+data.excursion_alias.toUpperCase()
    buffer += "\n@:separator:"
    buffer += "\n"+data.guestname.toUpperCase();
    buffer += "\n"+pax
    if(namelist.length) {
    buffer  += "\n@:separator:"
    buffer  += "\nGuest list:"
    buffer  += namelist
    }

    buffer += "\n@:separator:"
    buffer += "\n"+data.hotel.toUpperCase()
    buffer += "\nRoom   : "+data.hotel_room.toUpperCase()
    buffer += "\nPickup : "+data.pickup

    buffer += "\n@:separator:"
    buffer += "\nExcursion : "+data.currency+' '+data.salesrate

    if(promosum>0) {
    buffer += '\nDiscount  : '+data.currency+' -'+promosum
    }

    if(surcharges.length) {
    buffer  += "\nSurcharge :"
    buffer  += surcharges
    }

    buffer += "\n@:separator:"
    buffer += "\nTotal payment: "+total
    buffer += "\n@:separator:"
    buffer += "\nMethod:"
    buffer += "\n"+data.val_payment
    if($SETTINGS.string.cancellation.length) {
        var cancellation = $SETTINGS.string.cancellation.split('|');
            buffer += "\n@:separator:"
        for(var i=0; i<cancellation.length; i++) {
            buffer += "\n"+cancellation[i];
        }
    }
    buffer += "\n@:separator:"
    buffer += "\nRep.Name : "+data.rep.toUpperCase()
    buffer += "\nAgent    : "+data.agent.toUpperCase()
    buffer += "\nSupplier : "+data.supplier.toUpperCase()
    buffer += "\n@:separator:"
    buffer += "\n \n \n \n "
    buffer += "\nSIGN:"+(line_bottom.slice(0,-5))
    buffer += "\n"+$SETTINGS.branch.name.toUpperCase()
    buffer += "\n"+$SETTINGS.string.address_of_branch.toUpperCase()
    buffer += "\nPhone   : "+$SETTINGS.string.phone_branch
    if($SETTINGS.string.hotline.length) {
    buffer += "\nHotline : "+$SETTINGS.string.hotline
    }
    if($SETTINGS.string.other_information.length) {
        var others = $SETTINGS.string.other_information.split('|');
            buffer += "\n@:separator:"
        for(var i=0; i<others.length; i++) {
            buffer += "\n"+others[i];
        }
    }
    buffer += "\n \n \n \n "
    return buffer.replace(/@:separator:/g, line);
}




// ASCII only
function stringToBytes_iOS(string) {
    var array = new Uint32Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
     }
     return array.buffer;
 }
 
 // ASCII only
 function bytesToString_iOS(buffer) {
     return String.fromCharCode.apply(null, new Uint8Array(buffer));
 }
