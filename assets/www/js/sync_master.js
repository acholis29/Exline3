/*
    IMPORTANT

    Some company have a different set of column,
    ie: mspromotion for gvi doesn't has [exp_date_to], [promo_valprec], [idx_currency]

    If you encounter an error, check the table first!
*/

function ms_list(server, user, date, callback) {

    //var date = $SETTINGS.last_sync_db_master;
    var newdate = new Date();
    var datelastyear //= date_format(new Date(newdate.setDate(newdate.getDate() - 365)), 'yyyy-MM-dd');
    //date = datelastyear;
    datelastyear = date;
    console.log(datelastyear);

    if (date.length < 10) {
        $app.alert('<b>Last synchronized</b> date is not set correctly in <b>Settings</b>!', 'Settings required');
        return false;
    }

    //$('#sync-master-last-date').empty();
    $('#sync-master-last-date').text(datelastyear);

    //$loader.show();
    $status.set('ASKING MASTER DATA<br><b>FROM ' + date_format(date, 'dd/MM/yyyy') + '</b>');
    $progress.update('setup-detail', null, 'Fetching data: <b>' + date_format(date, 'dd/MM/yyyy') + '</b>');

    var module = get_core_master(server);
    var serialize = '&tgl=' + encodeURIComponent(datelastyear);
    serialize += '&usr=' + encodeURIComponent(user);

    $.ajax({
        url: module,
        data: serialize,
        dataType: 'json',
        success: function (data) {
            var $table = $('#sync-master-list'),
                $count = $('#sync-master-info');

            var last_sync = $SETTINGS.last_sync_db_master;
            last_sync = last_sync.length > 10 ? last_sync.substr(0, 10) : last_sync;
            var today = get_date();

            var buffer = '';

            $table.empty();

            if (data.length > 0) {

                for (var i = 0; i < data.length; i++) {
                    buffer += '<tr data-item=\'' + JSON.stringify(data[i]) + '\'>';
                    //buffer += '<td style="text-align:center;">'+data[i].rec_count+'</td>';
                    buffer += '<td style="padding:10px;">';
                    buffer += '    <span>' + data[i].descr + ' (<b>' + data[i].rec_count + '</b>)</span>';
                    buffer += '</td>';
                    buffer += '</tr>';
                }

                $table.append(buffer);

            } else {
                $table.append('<tr ><td style="padding:10px;">NO DATA</td></tr>');
            }

            if (last_sync != today) {
                $count.text(data.length + ' item(s) need to sync!');
                $count.css('color', 'red');
            } else {
                $count.text('Already synchronized for today');
                $count.css('color', 'green');
            }
            callback();
        },
        error: function () {
            // dont use [log details] to prevent popup close!
            $loader.hide();
            $app.alert('Network not available', 'Internet Disconnected', function () {
                $('#setup-synchronize-retry').show();
            });
        }
    });

}

function ms_sync_all(server, user, date, callback) {
    var master_data = ms_sync_item_buffer();
    ms_sync_start(server, user, date, master_data, function () {
        // update sync date
        update_sync_date('last-sync-db-master', function (current_date) {

            //$f_settings.last_synchronized.set(current_date);
            callback(current_date);

        });
    });
}

function ms_sync_start(server, user, date, buffer, callback) {
    var sync_items = buffer;
    console.log(sync_items)
    //$loader.show();
    if (sync_items[0] != undefined) {
        ms_sync_clear_description(function () {
            ms_sync_item(server, user, date, sync_items, sync_items.length, function () {
                $loader.hide();
                $app.alert('Database successfully updated!', 'Synchronize Complete', function () {
                    callback();
                });
            });
        });
    } else {
        $loader.hide();

        $app.alert('Database successfully updated!', 'Synchronize Complete', function () {
            callback();
        });
    }
}
function ms_sync_item_buffer() {
    var buffer = [];
    $('#sync-master-list tr').each(function (i, e) {
        var $tr = $(e);
        var data = $tr.data('item');
        buffer.push(data);
    });
    console.log(buffer)
    return buffer;
}

function ms_sync_clear_description(callback) {
    $status.set('CLEARING ALL DESCRIPTION');

    ssql = "UPDATE msexcursion SET descr = ''";
    sql(ssql, function (result) {
        callback();
    });
}


function ms_sync_clear_table(module, callback) {
    switch (module.toLowerCase()) {
        case 'msdestination':
            ssql = " DELETE FROM MSDestination WHERE idx_rep = '" + $SETTINGS.user.id + "'; ";
            break;
        case 'ms_employeeagent':
            ssql = " DELETE FROM MS_EmployeeAgent WHERE idx_user = '" + $SETTINGS.user.id + "'; ";
            break;
        case 'mfallotment':
            // ssql = " DELETE FROM MFALLOTMENT where date(dateallot)<datetime('now', 'localtime'); ";

            // since 3.0.4 we don't need offline allotment data anymore,
            // allotment will automatically go online
            ssql = " DELETE FROM MFALLOTMENT; ";
            break;
        case 'msexchangerate':
            // clear exchangerates because the backoffice always generate new uuid
            ssql = " DELETE FROM MSExchangeRate; ";
            break;
        default:
            ssql = "";
    }

    if (ssql != "") {
        $status.set('CLEARING TABLE: ' + module);
        //$progress.update('setup-main', 0, 'cleaning table: '+module);
        //$progress.update('setup-detail', 0, 'calculating');

        sql(ssql, function () {

            callback();

        });
    } else {
        callback();
    }
}
function ms_sync_item_query(records, name_of_table, beginning_size_of_records, items, beginning_size_of_items, label, callback) {
    if (records.length) {
        var record = records;
        var record_active = record[0];

        var key_column_name = record_active.COL;
        var key_column_val = record_active.IDX;
        /*
        var update          = (record_active.ACTION[1].UPDATESSQL).split('syc_').join('');
        var update_ar       = update.split(' ');
        var update_wh       = update_ar[update_ar.length-1];
            update_wh       = ms_sync_fix_column(name_of_table, update_wh);

        var select_column   = update_wh.split('=')[0];
        */
        var progress_count = (beginning_size_of_records - records.length);
        var progress = ((progress_count / beginning_size_of_records) * 100).toFixed(1);

        var progress_main = ((((beginning_size_of_items - items.length) + 1) / beginning_size_of_items) * 100);
        var progress_detail = ((progress_count / beginning_size_of_records) * 100);

        $status.set('Applying modules [' + ((beginning_size_of_items - items.length) + 1) + ' of ' + beginning_size_of_items + ']:<br>' + label + ' ' + progress + '%');
        if (records.length == 1) {
            $progress.update('setup-main', parseInt(progress_main), progress_main.toFixed(1) + '% - Applying modules [' + ((beginning_size_of_items - items.length) + 1) + ' of ' + beginning_size_of_items + ']');
        }
        $progress.update('setup-detail', parseInt(progress_detail), progress_detail.toFixed(1) + '% - Updating: <b>' + label.toLowerCase().replace(/syc_ms/g, '').replace(/_/g, '') + '</b>');

        // special condition

        switch (name_of_table) {
            case 'msexcursion_language':
                key_column_val = key_column_val.split(',');
                ssql = " DELETE FROM " + name_of_table + " WHERE idx_excursion='" + key_column_val[0] + "' AND idx_language='" + key_column_val[1] + "'";
                break;
            default:
                ssql = " DELETE FROM " + name_of_table + " WHERE " + key_column_name + "='" + key_column_val + "'";
        }


        // try delete first, then insert
        //ssql = " DELETE FROM "+name_of_table+" WHERE "+key_column_name+"='"+key_column_val+"'";
        sql(ssql, function (result_of_delete) {

            // insert
            //ssql = (record_active.ACTION[0].INSERTSSQL).split('syc_').join('');
            ssql = (record_active.ACTION[0].INSERTSSQL).replace('@:table_name:', name_of_table);
            sql(ssql, function (result_of_insert) {
                if (result_of_insert.rowsAffected == 0) {
                    // try update if no affected row
                    alert('SSQL ERROR: ' + ssql);
                } else {
                    // next
                    if (record.length != 0) {
                        record.shift();
                    }

                    if (record.length != 0) {
                        ms_sync_item_query(record, name_of_table, beginning_size_of_records, items, beginning_size_of_items, label, callback);
                    } else {
                        callback();
                    }
                }
            });

        });
    } else {
        console.log('No data for ' + name_of_table);
        callback();
    }
}

function ms_sync_fix_table(name_of_table) {
    /*
        We will verified the table here
    */
    switch (name_of_table) {
        case 'msexcursion_maxpax':
            return 'MSExcursionMaxPax';
        default:
            return name_of_table;
    }
}

function ms_sync_fix_column(name_of_table, input) {
    switch (name_of_table) {
        case 'mfallotment':
            return input.replace(/mfallotment/g, 'idx_allotment');
        default:
            return input;
    }
}

function ms_sync_item_apply(modules, items, beginning_size_of_items, label, callback) {
    if (modules.length) {
        var module = modules;
        var module_active = module[0];
        var name_of_table = ms_sync_fix_table(((module_active.PROCEDUR).toLowerCase()).replace('syc_', ''));
        var records = module_active.RECORD;

        is_table_exist(name_of_table, function (result) {
            if (result.length) {
                // empty spesific table first
                ms_sync_clear_table(name_of_table, function () {
                    if (records.length) {
                        ms_sync_item_query(records, name_of_table, records.length, items, beginning_size_of_items, label, function () {

                            if (module.length != 0) {
                                module.shift();
                            }

                            if (module.length != 0) {
                                ms_sync_item_apply(module, items, beginning_size_of_items, label, callback);
                            } else {
                                callback();
                            }

                        });
                    } else {
                        console.log('No data for ' + name_of_table);
                        //alert("RECORD NOT FOUND: "+name_of_table);
                        callback();
                    }
                });
            } else {
                alert("TABLE NOT FOUND: " + name_of_table);
                callback();
            }
        })
    } else {
        alert("MODULE NOT FOUND");
        callback();
    }
}

function ms_sync_item(server, user, date, items, beginning_size_of_items, callback) {
    var newdate = new Date();
    var datelastyear //= date_format(new Date(newdate.setDate(newdate.getDate() - 365)), 'yyyy-MM-dd');
    //date = datelastyear;
    datelastyear = date;
    console.log(datelastyear);

    if (items.length) {

        var item = items;
        console.log(item)
        var item_active = item[0].prc;
        var label = item_active.split('~').join(', ');

        $status.set('Applying modules [' + ((beginning_size_of_items - items.length) + 1) + ' of ' + beginning_size_of_items + ']:<br>' + label);
        $progress.update('setup-detail', null, 'Fetching data: <b>' + label.toLowerCase().replace(/syc_ms/g, '').replace(/_/g, '') + '</b>');



        var module = get_core_master(server);
        var serialize = '&tgl=' + encodeURIComponent(datelastyear);
        serialize += '&usr=' + encodeURIComponent(user);
        serialize += '&act=' + encodeURIComponent(item_active);

        $.ajax({
            timeout: 300000, /* 5 minute */
            url: module,
            data: serialize,
            dataType: 'json',
            success: function (data) {
                ms_sync_item_apply(data, item, beginning_size_of_items, label, function () {
                    if (item.length != 0) {
                        item.shift();
                    }

                    if (item.length != 0) {
                        ms_sync_item(server, user, date, item, beginning_size_of_items, callback);
                    } else {
                        callback();
                    }
                });
            },
            error: function () {
                $loader.hide();
                $app.alert('Network not available', 'Internet Disconnected', function () {
                    $('#setup-synchronize-retry').show();
                });
            }
        });

    } else {
        console.log('~ms_sync_item: finishing update');
        callback();
    }

}

