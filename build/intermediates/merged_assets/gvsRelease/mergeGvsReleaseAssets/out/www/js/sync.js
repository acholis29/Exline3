$( document ).ready(function() {
    $('#sync-transaction-all').on('click', sync_transaction_execute);
    $('#sync-master-all').on('click', sync_master_execute);
    $('#view-sync-transaction').on('click', sync_transaction_refresh);

    $('#view-sync-master').on('click', function() {
        sync_master_refresh(function() {
            $app.showTab('#tab-sync-master');
            $loader.hide();
        });
    });

    $('#sync-transaction-list').on('click', '.delete', function() {
        var $print  = $(this);
        var $data   = $print.parents('tr').data('item');
        console.log(JSON.stringify($data));
       
        // ask user for action
        $app.modal({
            title:  $STRING.info_confirmation,
            text:   $STRING.booking_remove.replace(/@:voucher:/g, $data.number),
            buttons: [
            {
                text: 'Yes',
                bold: true,
                onClick: function() {
                    var obj_update = tr_sync_status_buffer($data.idx_mfexcursion, 'x');
    
                    $loader.show();
                    $status.set('UPDATING SYNC STATUS');

                    tr_sync_status(obj_update, function() {
                        tr_list(function() {
                            $loader.hide();
                        });
                    });
                }
            },
            {
                text: 'No',
                onClick: function() {

                }
            }]
        });
    });
    
});

function update_sync_date(name, callback) {

    $loader.show();
    $status.set('UPDATING SYNC DATE');

    var now = get_date_time();

    ssql = "UPDATE config SET value = '"+now+"' WHERE name = '"+name+"';";
    sql(ssql, function(result) {
        if(result.rowsAffected == 1) {
            switch(name) {
                case 'last-sync-db-daily':
                    var $count      = $('#sync-daily-info');

                        $SETTINGS.last_sync_db_daily = now;
                        $('#sync-daily-last-date').text(now);

                        $count.text('Already synchronized for today');
                        $count.css('color', 'green');
                    break;
                case 'last-sync-db-master':
                    var $count      = $('#sync-master-info');

                        $SETTINGS.last_sync_db_master = now;
                        $('#sync-master-last-date').text(now);

                        $count.text('Already synchronized for today');
                        $count.css('color', 'green');
                    break;
                case 'last-sync-transact':
                    var $count      = $('#sync-transaction-info');
                    var $tr         = $('#sync-transaction-list tr');

                        $SETTINGS.last_sync_transact = now;
                        $('#sync-transaction-last-date').text(now);

                        if($tr.first().data('item') == undefined) {
                            $count.text('No transaction need to sync');
                            $count.css('color', 'green');
                        } else {
                            $count.text($tr.length+' transaction(s) need to sync!');
                            $count.css('color', 'red');
                        }
                    break;
            }

            callback(now);
        } else {
            $loader.hide();
            $app.alert('Error saving: '+ssql, 'fn: update_sync_date');
        }
    });
}

function sync_master_refresh(callback) {
    var server  = $SETTINGS.server;
    var user    = $SETTINGS.user.id;
    var date    = $SETTINGS.last_sync_db_master != '' ? $SETTINGS.last_sync_db_master : $SETTINGS.company_active_date;

    $loader.show();
    ms_list(server, user, date, function() {
        product_list_unused(function() {
            callback();
        });
    });
}

function sync_master_execute() {
    var server  = $SETTINGS.server;
    var user    = $SETTINGS.user.id;

    if($('#sync-master-unused tr').first().data('item') == undefined) {
        // No need to reset
        $loader.show();
        ms_sync_all(server, user, $SETTINGS.last_sync_db_master, function(current_date) {
            ms_list(server, user, current_date, function() {
                $loader.hide();
            });
        });
    } else {
        $loader.hide();
        $app.alert($STRING.apps_complete_reset, $STRING.info_information, function() {

            $loader.show();
            $status.set('RESETING DATABASE');

            list_table_name(function(data) {
                database_reset(data, true, function() {
                    // list master data base on input in settings form
                    var server  = $f_settings.domain.get();
                    var user    = $f_settings.user.get();
                    var date    = $f_settings.company_active_date.get();

                    ms_list(server, user, date, function() {
                        ms_sync_all(server, user, date, function() {

                            $('#view-sync-master').trigger('click');

                        });
                    });

                });
            });

        });
    }
}

function sync_transaction_refresh() {
    tr_list(function() {
        $app.showTab('#tab-sync-transaction');
        $loader.hide();
    });
}

function sync_transaction_execute() {
    if($('#sync-transaction-list tr').first().data('item') == undefined) {
        $app.alert('No transaction need to sync!', $STRING.info_data_not_available);
        return false;
    }

    $app.modal({
        title:  'Confirmation',
        text: 'A stable internet connection is required to prevent data corruption during synchronization. <br /><br />Do you want to <b>sync now</b>?',
        buttons: [
        {
            text: 'Sync now',
            bold: true,
            onClick: function() {
                tr_sync_start(function() {
                    // update sync date
                    update_sync_date('last-sync-transact', function() {
                        tr_list(function() {
                            $loader.hide();
                        });
                    });
                });
            }
        },
        {
            text: 'Later',
            onClick: function() {

            }
        }]
    });
}