var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function is_empty_object(obj) {
    for (var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            return false;
        }
    }
    return true;
}

function find_array_by_key(search, data, key) {
    /*
        Array data search
    
        Last update by: Me! 2017-23-11
        ipunk.vizard@gmail.com
    */

    for (var i = 0; i < data.length; i++) {
        if (data[i].hasOwnProperty(key)) {
            if (data[i][key] == search) {
                return true;
            }
        }
    }
    return false;
}

function parseESC(value) {
    /*
        JSON special characters escaping
    
        Last update by: Me! 2017-11-07
        ipunk.vizard@gmail.com
    */

    return String(value)
        .replace(/[\']/g, '‘')
        .replace(/[\"]/g, '“')
        .replace(/[\\]/g, '\\\\')
        .replace(/[\b]/g, '\\b')
        .replace(/[\r]/g, '\\r')
        .replace(/[\f]/g, '\\f')
        .replace(/[\t]/g, '\\t')
        .replace(/[\v]/g, '\\v')
        .replace(/[\n]/g, '\\n');

};

function parseJSONtoESC(value) {

    return String(value)
        .replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");

};



function exponential_expand(value) {
    return ('' + value).replace(/^([+-])?(\d+).?(\d*)[eE]([-+]?\d+)$/, function (x, s, n, f, c) {
        var l = +c < 0, i = n.length + +c, x = (l ? n : f).length,
            c = ((c = Math.abs(c)) >= x ? c - x + l : 0),
            z = (new Array(c + 1)).join("0"), r = n + f;
        return (s || "") + (l ? r = z + r : r += z).substr(0, i += l ? z.length : 0) + (i < r.length ? "." + r.substr(i) : "");
    });
}

function ajax_error(request, type, errorThrown) {
    var msg;

    // request.url is bad for ui

    $loader.hide();
    if (request.status != 0) {
        msg = request.status + ' - ' + request.statusText.toUpperCase();
    } else {
        msg = 'Network not available!';
    }

    // ask user for action
    log_show(msg, request.responseText);
    /*
    $app.modal({
        title:  'Internet Disconnected',
        text:   '<b style="color:red;">'+msg+'</b>',
        buttons: [
            {
                text: 'Detail',
                onClick: function() {
                    var info = request.responseText ? request.responseText : '<span style="display:block; padding:10px;">No information</span>';

                    $('#log-details').empty();
                    $('#log-details').append(info);
                    $app.popup('.popup-log');
                }
            },
            {
                text: 'Close',
                bold: true,
                onClick: function() {

                }
            }]
    });
    */
}

function log_show(error, detail) {
    // ask user for action
    $app.modal({
        title: 'Internet Disconnected',
        text: '<b style="color:red;">' + error + '</b>',
        buttons: [
            {
                text: 'Detail',
                onClick: function () {
                    var info = detail ? detail : '<span style="display:block; padding:10px;">No information</span>';

                    //$('#log-details').empty();
                    //$('#log-details').append(info);
                    iframe_append('#iframe-log-details', info);
                    $app.popup('.popup-log');
                }
            },
            {
                text: 'Close',
                bold: true,
                onClick: function () {

                }
            }]
    });
}

function iframe_append(id, msg) {
    var $iframe = $(id);
    $iframe.ready(function () {
        $iframe.contents().find("body").empty();
        $iframe.contents().find("body").append(msg);
    });
}

function arr_props_to_lower(arr) {
    return arr.map(function (item) {
        return obj_props_to_lower(item);
    });
}

function obj_props_to_lower(obj) {
    var result = {};
    for (var key in obj) {
        var propValue = obj[key];
        if (Array.isArray(obj[key])) {
            propValue = arr_props_to_lower(propValue);
        }
        result[key.toLowerCase()] = propValue;
    }
    return result;
}

function get_date(input) {
    //preparing date (yyyy-MM-dd)
    var today = new Date();
    var d = input && typeof input == 'string' ? new Date(input) : today;
    d = !isNaN(d.getDate()) ? d : today;

    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();

    var date = '';

    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    date = year + '-' + month + '-' + day;
    return date;
}

function get_date_time(input) {
    //preparing date (yyyy-MM-dd)
    console.log(typeof input)
    var today = new Date();
    var d = input && typeof input == 'string' ? new Date(input) : today;
    d = !isNaN(d.getDate()) ? d : today;

    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();

    var hour = d.getHours();
    var minute = d.getMinutes();

    var output = '';

    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;


    hour = hour < 10 ? '0' + hour : hour;
    minute = minute < 10 ? '0' + minute : minute;

    output = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
    return output;
}

function get_date_different(date1, date2) {
    var date1 = string_to_object_date(get_date(date1));
    var date2 = string_to_object_date(get_date(date2));
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
}

function add_days(date_string, days) {
    var result = string_to_object_date(get_date(date_string));
    result.setDate(result.getDate() + days);
    return result;
}

function time_format(time) {
    var result = false, m;
    var re = /^\s*([01]?\d|2[0-3]):?([0-5]\d)\s*$/;
    if ((m = time.match(re))) {
        result = (m[1].length === 2 ? "" : "0") + m[1] + ":" + m[2];
    }
    return result;
}

function date_format(input, pattern) {
    /*
        Vizard Date Format
        by Ipunk Vizard on 2017-12-08
    */
    var d = typeof input == 'string' ? string_to_object_date(input) : input;

    var n_year = d.getFullYear();
    var n_month = d.getMonth() + 1;
    var n_date = d.getDate();
    var n_hour = d.getHours();
    var n_minute = d.getMinutes();
    var n_second = d.getSeconds();
    var n_day = d.getDay();

    var year = n_year;
    var month = n_month < 10 ? '0' + n_month : n_month;
    var date = n_date < 10 ? '0' + n_date : n_date;
    var hour = n_hour < 10 ? '0' + n_hour : n_hour;
    var minute = n_minute < 10 ? '0' + n_minute : n_minute;
    var second = n_second < 10 ? '0' + n_second : n_second;
    var day = n_day;

    pattern = pattern.replace('yyyy', year);
    pattern = pattern.replace('yy', ('' + year).substr(2, 2));
    pattern = pattern.replace('MMM', monthNames[parseInt(n_month) - 1].substr(0, 3));
    pattern = pattern.replace('MM', month);
    pattern = pattern.replace('MONTH', monthNames[parseInt(n_month) - 1]);
    pattern = pattern.replace('ddd', dayNames[parseInt(n_day)].substr(0, 3));
    pattern = pattern.replace('dd', date);
    pattern = pattern.replace('DAY', dayNames[parseInt(n_day)]);
    pattern = pattern.replace('HH', hour);
    pattern = pattern.replace('hh', hour);
    pattern = pattern.replace('mm', minute);
    pattern = pattern.replace('ss', second);
    return pattern;
}

function string_to_object_date(input) {
    var arr = input.split(/[- :]/);
    var p_year = parseInt(arr[0]);
    var p_month = parseInt(arr[1]) - 1;
    var p_day = parseInt(arr[2]);
    var p_hour = arr[3] ? parseInt(arr[3]) : 0;
    var p_minute = arr[4] ? parseInt(arr[4]) : 0;
    var p_second = arr[5] ? parseInt(arr[5]) : 0;
    return new Date(p_year, p_month, p_day, p_hour, p_minute, p_second);
}

function get_percent_value(nominal, percent_of) {
    return (parseFloat(nominal) * percent_of) / 100;
}

function is_valid_email(mail) {
    /*
        https://www.w3resource.com/javascript/form/email-validation.php
        2017-10-16
    */

    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
        return true;
    }
    return false;
}

function is_valid_domain(url) {
    /*
        https://github.com/johnotander/domain-regex/blob/master/index.js
        2017-10-18
    */
    return /\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b/.test(url);
}

function add_http(url) {
    /*
        https://stackoverflow.com/questions/11300906/check-if-a-string-starts-with-http-using-javascript
        2017-10-18
    */
    if (!/^(f|ht)tps?:\/\//i.test(url)) {
        url = "http://" + url;
    }
    return add_end_slash(url);
}

function remove_http(url) {
    return url.replace(/(^\w+:|^)\/\//, '');
}

function remove_end_slash(url) {
    return url.replace(/\/$/, "");
}

function add_end_slash(url) {
    /*
        https://stackoverflow.com/questions/11531363/javascript-jquery-add-trailing-slash-to-url-if-not-present
        2017-10-18
    */
    return url.replace(/\/?$/, '/');
}

function string_to_boolean(input) {
    if (typeof input == 'string') {
        switch (input.toLowerCase()) {
            case 'true':
            case '1':
                return true;
            default:
                return false;
        }
    } else {
        return input;
    }
}

function number_with_commas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function format_currency(n, with_decimal) {
    var n_source = ('' + n).split('.');
    var n_left = n_source[0];
    var n_right = n_source.length > 1 ? n_source[1] : '0';

    var n_number = n_left.replace(/\D/g, '');
    var n_format = parseFloat(n_number).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    var n_result = n_format.split('.')[0] + (with_decimal || n_right != '0' ? '.' + (n_right != '0' ? n_right : '00') : '');

    return n_result;
}

function get_number(i) {
    var n_result = i.replace(/\D/g, "");
    return n_result
}


function JsontoParam(obj) {
    var str = Object.keys(obj).map(function (key) {
        if (typeof obj[key] == 'string') {
            return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);

        } else {
            return encodeURIComponent(key) + '=' + encodeURIComponent(JSON.stringify(obj[key]));
        }
    }).join('&');
    return str
};
