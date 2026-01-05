var $manual_tourdate;
$( document ).ready(function() {

    $manual_tourdate = $app.calendar({
        input: '#manual-tourdate',
        closeOnSelect: true,
        minDate: new Date()
    });
    $('#manual-timepickup').mask('00:00');
    $('#manual-timepickup').on('change', function() {
        var $this   = $(this);
        try {
            if(!time_format($this.val())) {
                $app.alert('Invalid pickup time!', 'Input Required', function() {
                    $this.val('');
                });
            }
        } catch(e) {
            $app.alert('ERROR: '+e, 'Input Required');
        }
    });

    $('#manual-voucher-print').on('click', function() {
        var voucher     = parseESC($('#manual-vouchernumber').val().toUpperCase());
        var agent       = parseESC($('#manual-agent').val().toUpperCase());
        var excursion   = parseESC($('#manual-excursion').val().toUpperCase());
        var guest       = parseESC($('#manual-guestname').val().toUpperCase());
        var paxa        = parseInt($('#manual-i-booking-pax-adult').val());
        var paxc        = parseInt($('#manual-i-booking-pax-child').val());
        var paxi        = parseInt($('#manual-i-booking-pax-infant').val());
        var pax_total   = paxa+paxc+paxi;
        var pickup_area = parseESC($('#manual-pickuparea').val().toUpperCase());
        var pickup_date = $('#manual-tourdate').val();
        var pickup_time = $('#manual-timepickup').val();
        var total       = parseESC($('#manual-totalpayment').val().toUpperCase());
        var pay_method  = $('#manual-paymethod option:selected').text().toUpperCase();
        var remark      = parseESC($('#manual-remark').val().toUpperCase());

        if(agent.length==0) {
            $app.alert('Agent required!', 'Warning', function() {
                $('#manual-agent').focus();
            });
            return false;
        }
        if(excursion.length==0) {
            $app.alert('Excursion required!', 'Warning', function() {
                $('#manual-excursion').focus();
            });
            return false;
        }
        if(pickup_date.length==0) {
            $app.alert('Tour date required!', 'Warning', function() {
                setTimeout(function() {
                    $manual_tourdate.open();
                }, 100);
            });
            return false;
        }
        if(guest.length==0) {
            $app.alert('Guest required!', 'Warning', function() {
                $('#manual-guestname').focus();
            });
            return false;
        }
        if(pickup_area.length==0) {
            $app.alert('Pickup location required!', 'Warning', function() {
                $('#manual-pickuparea').focus();
            });
            return false;
        }
        if(pickup_time.length==0) {
            $app.alert('Pickup time required!', 'Warning', function() {
                $('#manual-timepickup').focus();
            });
            return false;
        }
        if(total.length==0) {
            $app.alert('Total payment required!', 'Warning', function() {
                $('#manual-totalpayment').focus();
            });
            return false;
        }

        var print_data =
        [
            'SEPARATOR',
            'Numb: '+voucher,
            'Date: '+date_format(get_date_time(), 'dd/MM/yyyy HH:mm'),
            'SEPARATOR',
            excursion,
            'SEPARATOR',
            guest,
            pax_total+' PAX [ '+paxa+'A | '+paxc+' | '+paxi+' ]',
            'SEPARATOR',
            pickup_area,
            'Pickup: '+date_format(pickup_date+' '+pickup_time, 'dd/MM/yyyy HH:mm'),
            'SEPARATOR',
            'Total payment: '+total,
            'SEPARATOR',
            'Method',
            pay_method,
            'SEPARATOR',
            'Rep Name: '+$SETTINGS.user.name,
            'Agent   : '+agent
        ];
        if(remark.length!=0) {
            print_data.push('SEPARATOR');
            print_data.push('Remark');
            print_data.push(remark);
        }

        printer_device_list(print_data, 'VOUCHER');
    });

});