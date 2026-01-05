$INFORMATION = {
    allow_voucher_amend: 'If <b>yes</b>, there will be additional edit button when viewing detail of any qualified transaction at online manage booking. The button will have you access for amending transaction details, but only if tour date not passed.',
    combinable_payment: 'If <b>yes</b>, there will be additional payment option before checkout which allowing cash or credit card combinable.'
}

function view_information(text) {
    $app.alert(text, 'Information');
}

function get_token() {
    var info_app = $('#about-info-app-version').text() + ' build ' + $('#about-info-app-build').text();
    var info_device = $('#about-info-manufacturer').text() + ' ' + $('#about-info-model').text();
    var info_os = $('#about-info-platform').text() + ' ' + $('#about-info-version').text();
    var info_uuid = $('#about-info-uuid').text();
    var info_serial = $('#about-info-serial').text();
    var parameter = '';

    parameter += '&acc=' + encodeURIComponent($SETTINGS.user.name);
    parameter += '&app=' + encodeURIComponent(info_app);
    parameter += '&dev=' + encodeURIComponent(info_device);
    parameter += '&osv=' + encodeURIComponent(info_os);
    parameter += '&uid=' + encodeURIComponent(info_uuid);
    parameter += '&ser=' + encodeURIComponent(info_serial);

    return parameter;
}

function get_core_module(domain) {
    var module = domain ? domain : $SETTINGS.server;
    module += 'ashx/exline/core.ashx?';
    module += get_token();
    return module;
}
function get_core_master(domain) {
    var module = domain ? domain : $SETTINGS.server;
    module += 'ashx/exline/core-master.ashx?';
    module += get_token();
    return module;
}
function get_core_mailing(domain) {
    var module = domain ? domain : $SETTINGS.server;
    module += 'ashx/exline/core-mailing.ashx?';
    module += get_token();
    return module;
}
function get_core_paygate(domain) {
    var module = domain ? domain : $SETTINGS.server;
    module += 'ashx/exline/core-paygate.ashx?';
    module += get_token();
    return module;
}

function get_core_jsonfile(domain, filename) {
    var module = domain ? domain : $SETTINGS.server;
    module += 'json/' + filename;
    // module      += get_token();
    return module;
}

// dom template
//
function html_template_init($parent, target) {
    if (!$parent.data('template')) {
        $parent.data('template', $parent.find(target).prop('outerHTML'));
        $parent.empty();
    }
}
function html_template($parent) {
    return {
        data: $parent.data('template'),
        get: function () {
            var template = this.data;
            return typeof template == 'string' ? template : null;
        },
        set: function (parameter, value) {
            var template = this.get();
            this.data = template.replace(new RegExp(parameter, "g"), value);
        }
    }
}