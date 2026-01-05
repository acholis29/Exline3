var $app;
var $$;
var $main_view, $settings_view;
var $loader = {
  show: function () {
    $(".loading-animation").show();
  },
  hide: function () {
    $(".loading-animation").hide();
    $status.set("PLEASE WAIT");
  },
};
var $status = {
  set: function (text) {
    $("#loading-text").empty();
    $("#loading-text").append(text.toUpperCase());
  },
};
var $progress = {
  update: function (id, value, label) {
    var progressbar = $$("#progressbar-" + id); // setup-main, setup-detail
    var info = $("#progressbar-" + id + "-info");

    if (!progressbar.children(".progressbar, .progressbar-infinite").length) {
      $app.showProgressbar(progressbar, value);
    }

    $("#progressbar-" + id)
      .find(".progressbar-in")
      .removeClass("progressbar");
    $("#progressbar-" + id)
      .find(".progressbar-in")
      .removeClass("progressbar-infinite");

    if (isNaN(parseInt(value))) {
      $("#progressbar-" + id)
        .find(".progressbar-in")
        .addClass("progressbar-infinite");
      $app.setProgressbar(progressbar, null);
    } else {
      $("#progressbar-" + id)
        .find(".progressbar-in")
        .addClass("progressbar");
      $app.setProgressbar(progressbar, value);
    }

    info.empty();
    info.append(label);
  },
};
var ERROR_TYPE = {
  CONNECTION: "CONNECTION ERROR",
  DATA: "DATA ERROR",
  SYNTAX: "SYNTAX ERROR",
};

var CALENDAR_TEMPLATE;

var div_search_branch = "#autocomplete-standalone-branch";
var div_search_user = "#autocomplete-standalone-user";
var div_search_market = "#autocomplete-standalone-market";
var div_search_language = "#autocomplete-standalone-language";
var div_search_currency = "#autocomplete-standalone-currency";

var $branch = { searchbar: null };
var $user = { searchbar: null };
var $market = { searchbar: null };
var $language = { searchbar: null };
var $currency = { searchbar: null };

var db_settings = [
  /* status */
  { name: "company-active-date", type: "date", value: "", description: "" },
  /* basic */
  { name: "company", type: "index", value: "", description: "" },
  { name: "branch", type: "index", value: "", description: "" },
  { name: "user", type: "index", value: "", description: "" },
  { name: "market", type: "index", value: "", description: "" },
  { name: "language", type: "index", value: "", description: "" },
  { name: "currency", type: "index", value: "", description: "" },
  /* additional */
  { name: "initial-company", type: "string", value: "", description: "" },
  { name: "initial-user", type: "string", value: "", description: "" },
  {
    name: "discount-before-surcharge",
    type: "boolean",
    value: "false",
    description: "",
  },
  {
    name: "discount-split-view",
    type: "boolean",
    value: "false",
    description: "",
  },
  {
    name: "discount-validation",
    type: "boolean",
    value: "false",
    description: "",
  },
  { name: "last-minute-booking", type: "number", value: "0", description: "" },
  {
    name: "length-of-voucher-number",
    type: "number",
    value: "9",
    description: "",
  },
  {
    name: "payment-combinable",
    type: "boolean",
    value: "false",
    description: "",
  },
  { name: "payment-manual", type: "boolean", value: "false", description: "" },
  { name: "payment-default", type: "string", value: "ca", description: "" },
  {
    name: "print-company-logo",
    type: "boolean",
    value: "false",
    description: "",
  },
  { name: "print-device", type: "string", value: "BT", description: "" },
  { name: "print-size", type: "string", value: "normal", description: "" },
  { name: "print-header", type: "string", value: "VOUCHER", description: "" },
  { name: "print-barcode", type: "boolean", value: "false", description: "" },
  { name: "barcode-type", type: "string", value: "72", description: "" },
  { name: "barcode-length", type: "number", value: "12", description: "" },
  { name: "barcode-hri", type: "number", value: "0", description: "" },
  {
    name: "required-guest-details",
    type: "boolean",
    value: "false",
    description: "",
  },
  { name: "server", type: "string", value: "", description: "" },
  { name: "tax-for-credit-card", type: "number", value: "0", description: "" },
  { name: "voucher-connect", type: "boolean", value: "false", description: "" },
  { name: "voucher-amend", type: "boolean", value: "false", description: "" },
  { name: "voucher-manual", type: "boolean", value: "false", description: "" },
  /* sync */
  { name: "last-sync-db-daily", type: "date", value: "", description: "" },
  { name: "last-sync-db-master", type: "date", value: "", description: "" },
  { name: "last-sync-transact", type: "date", value: "", description: "" },
  /* string */
  { name: "address-of-branch", type: "string", value: "", description: "" },
  { name: "address-of-company", type: "string", value: "", description: "" },
  { name: "cancellation", type: "string", value: "", description: "" },
  { name: "hotline", type: "string", value: "", description: "" },
  { name: "phone", type: "string", value: "", description: "" },
  { name: "phone-branch", type: "string", value: "", description: "" },
  { name: "other-information", type: "string", value: "", description: "" },
  {
    name: "footer-branch-company",
    type: "boolean",
    value: "true",
    description: "",
  },
  { name: "text-cx-branch", type: "string", value: "", description: "" },

  /* ITOS DEVICE */
  { name: "tpv-device", type: "boolean", value: "false", description: "" },
  { name: "tpv-address", type: "string", value: "", description: "" },
  { name: "tpv-xsource", type: "string", value: "COMERCIA", description: "" },
  { name: "tpv-username", type: "string", value: "user", description: "" },
  { name: "tpv-password", type: "string", value: "pass", description: "" },
  { name: "tpv-qr", type: "boolean", value: "true", description: "" },
  { name: "tpv-qrsize", type: "string", value: "256", description: "" },
  { name: "tpv-qrposition", type: "string", value: "CENTER", description: "" },

  /* LOROPARQUE */
  {
    name: "lp-status",
    type: "boolean",
    value: "false",
    description: "status connection integrasi loroparque",
  },
  {
    name: "lp-status-dev",
    type: "text",
    value: "loroparque_live",
    description: "status connection integrasi loroparque",
  },
];

var $f_login = {
  required_guest_details: {
    get: function () {
      return $("#login-input-required-guestdetails option:selected").val();
    },
    set: function (value) {
      $("#login-input-required-guestdetails").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#login-input-required-guestdetails")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#login-input-required-guestdetails")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  discount_before_surcharge: {
    get: function () {
      return $("#login-input-discount-beforesurcharge option:selected").val();
    },
    set: function (value) {
      $("#login-input-discount-beforesurcharge").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#login-input-discount-beforesurcharge")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#login-input-discount-beforesurcharge")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  discount_split_view: {
    get: function () {
      return $("#login-input-discount-splitview option:selected").val();
    },
    set: function (value) {
      $("#login-input-discount-splitview").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#login-input-discount-splitview")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#login-input-discount-splitview")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  discount_validation: {
    get: function () {
      return $("#login-input-discount-validation option:selected").val();
    },
    set: function (value) {
      $("#login-input-discount-validation").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#login-input-discount-validation")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#login-input-discount-validation")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  last_minute_booking: {
    get: function () {
      return $("#login-input-lastminute-booking option:selected").val();
    },
    set: function (value) {
      $("#login-input-lastminute-booking").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#login-input-lastminute-booking")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#login-input-lastminute-booking")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  payment_combinable: {
    get: function () {
      return $("#login-input-payment-combinable option:selected").val();
    },
    set: function (value) {
      $("#login-input-payment-combinable").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#login-input-payment-combinable")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#login-input-payment-combinable")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  payment_manual: {
    get: function () {
      return $("#login-input-payment-manual option:selected").val();
    },
    set: function (value) {
      $("#login-input-payment-manual").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#login-input-payment-manual")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#login-input-payment-manual")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  payment_default: {
    get: function () {
      return $("#login-input-payment-default option:selected").val();
    },
    set: function (value) {
      $("#login-input-payment-default").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#login-input-payment-default")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#login-input-payment-default")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  print_company_logo: {
    get: function () {
      return $("#login-input-print-companylogo option:selected").val();
    },
    set: function (value) {
      $("#login-input-print-companylogo").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#login-input-print-companylogo")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#login-input-print-companylogo")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  print_size: {
    get: function () {
      return $("#login-input-print-size option:selected").val();
    },
    set: function (value) {
      $("#login-input-print-size").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#login-input-print-size")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#login-input-print-size")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  voucher_connect: {
    get: function () {
      return $("#login-input-voucher-connect option:selected").val();
    },
    set: function (value) {
      $("#login-input-voucher-connect").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#login-input-voucher-connect")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#login-input-voucher-connect")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  voucher_amend: {
    get: function () {
      return $("#login-input-voucher-amend option:selected").val();
    },
    set: function (value) {
      $("#login-input-voucher-amend").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#login-input-voucher-amend")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#login-input-voucher-amend")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  voucher_manual: {
    get: function () {
      return $("#login-input-voucher-manual option:selected").val();
    },
    set: function (value) {
      $("#login-input-voucher-manual").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#login-input-voucher-manual")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#login-input-voucher-manual")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
};

var $f_settings = {
  domain: {
    get: function () {
      return $("#settings-domain").data("domain");
    },
    set: function (name) {
      $("#settings-domain").data("domain", name);
      $("#settings-domain").text(name);
    },
  },
  branch: {
    get: function (type) {
      switch (type) {
        case "label":
          return $("#settings-branch").text();
        case "id":
        default:
          return $("#settings-branch").data("id");
      }
    },
    set: function (id, label) {
      $("#settings-branch").text(label);
      $("#settings-branch").data("id", id);
    },
  },
  user: {
    get: function (type) {
      switch (type) {
        case "label":
          return $("#settings-user").text();
        case "id":
        default:
          return $("#settings-user").data("id");
      }
    },
    set: function (id, label) {
      $("#settings-user").text(label);
      $("#settings-user").data("id", id);
    },
  },
  market: {
    get: function (type) {
      switch (type) {
        case "label":
          return $("#settings-market").text();
        case "id":
        default:
          return $("#settings-market").data("id");
      }
    },
    set: function (id, label) {
      $("#settings-market").text(label);
      $("#settings-market").data("id", id);
    },
  },
  language: {
    get: function (type) {
      switch (type) {
        case "label":
          return $(div_search_language).find("input[type=text]").val();
        case "id":
        default:
          return $(div_search_language).find("input[type=hidden]").val();
      }
    },
    set: function (id, label) {
      $(div_search_language).find("input[type=hidden]").val(id);
      $(div_search_language).find("input[type=text]").val(label);
    },
  },
  currency: {
    get: function (type) {
      switch (type) {
        case "label":
          return $("#settings-currency").text();
        case "id":
        default:
          return $("#settings-currency").data("id");
      }
    },
    set: function (id, label) {
      $("#settings-currency").text(label);
      $("#settings-currency").data("id", id);
    },
  },
  required_guest_details: {
    get: function () {
      return $("#settings-required-guestdetails option:selected").val();
    },
    set: function (value) {
      $("#settings-required-guestdetails").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-required-guestdetails")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-required-guestdetails")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  discount_before_surcharge: {
    get: function () {
      return $("#settings-discount-beforesurcharge option:selected").val();
    },
    set: function (value) {
      $("#settings-discount-beforesurcharge").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-discount-beforesurcharge")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-discount-beforesurcharge")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  discount_split_view: {
    get: function () {
      return $("#settings-discount-splitview option:selected").val();
    },
    set: function (value) {
      $("#settings-discount-splitview").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-discount-splitview")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-discount-splitview")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  discount_validation: {
    get: function () {
      return $("#settings-discount-validation option:selected").val();
    },
    set: function (value) {
      $("#settings-discount-validation").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-discount-validation")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-discount-validation")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  last_minute_booking: {
    get: function () {
      return $("#settings-lastminute-booking option:selected").val();
    },
    set: function (value) {
      $("#settings-lastminute-booking").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-lastminute-booking")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-lastminute-booking")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  payment_combinable: {
    get: function () {
      return $("#settings-payment-combinable option:selected").val();
    },
    set: function (value) {
      $("#settings-payment-combinable").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-payment-combinable")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-payment-combinable")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  payment_manual: {
    get: function () {
      return $("#settings-payment-manual option:selected").val();
    },
    set: function (value) {
      $("#settings-payment-manual").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-payment-manual")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-payment-manual")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  payment_default: {
    get: function () {
      return $("#settings-payment-default option:selected").val();
    },
    set: function (value) {
      $("#settings-payment-default").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-payment-default")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-payment-default")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  print_company_logo: {
    get: function () {
      return $("#settings-print-companylogo option:selected").val();
    },
    set: function (value) {
      $("#settings-print-companylogo").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-print-companylogo")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-print-companylogo")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  print_device: {
    get: function () {
      return $("#settings-print-device option:selected").val();
    },
    set: function (value) {
      $("#settings-print-device").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-print-device")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-print-device")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  print_header: {
    get: function () {
      return $("#settings-print-header").val();
    },
    set: function (value) {
      $("#settings-print-header").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-print-header")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-print-header")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  print_size: {
    get: function () {
      return $("#settings-print-size option:selected").val();
    },
    set: function (value) {
      $("#settings-print-size").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-print-size").parents(".item-content").addClass("disabled");
      } else {
        $("#settings-print-size")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  print_barcode: {
    get: function () {
      return $("#settings-print-barcode option:selected").val();
    },
    set: function (value) {
      $("#settings-print-barcode").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-print-barcode")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-print-barcode")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  barcode_type: {
    get: function () {
      return $("#settings-barcode-type option:selected").val();
    },
    set: function (value) {
      $("#settings-barcode-type").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-barcode-type")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-barcode-type")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  barcode_length: {
    get: function () {
      return $("#settings-length-barcode").val();
    },
    set: function (value) {
      $("#settings-length-barcode").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-length-barcode")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-length-barcode")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  barcode_hri: {
    get: function () {
      return $("#settings-barcode-hri option:selected").val();
    },
    set: function (value) {
      $("#settings-barcode-hri").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-barcode-hri")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-barcode-hri")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  voucher_connect: {
    get: function () {
      return $("#settings-voucher-connect option:selected").val();
    },
    set: function (value) {
      $("#settings-voucher-connect").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-voucher-connect")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-voucher-connect")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  voucher_amend: {
    get: function () {
      return $("#settings-voucher-amend option:selected").val();
    },
    set: function (value) {
      $("#settings-voucher-amend").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-voucher-amend")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-voucher-amend")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  voucher_manual: {
    get: function () {
      return $("#settings-voucher-manual option:selected").val();
    },
    set: function (value) {
      $("#settings-voucher-manual").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-voucher-manual")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-voucher-manual")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  /* COMPANY INFORMATION PAGE */
  registration_id: {
    get: function () {
      return $("#settings-company-id").text();
    },
    set: function (value) {
      $("#settings-company-id").empty();
      $("#settings-company-id").text(value);
    },
  },
  company_active_date: {
    get: function () {
      return $("#settings-company-date").text();
    },
    set: function (value) {
      $("#settings-company-date").empty();
      $("#settings-company-date").text(value);
    },
  },
  user_initial: {
    get: function () {
      return $("#settings-user-initial").text();
    },
    set: function (value) {
      $("#settings-user-initial").empty();
      $("#settings-user-initial").text(value);
    },
  },
  company_name: {
    get: function () {
      return $("#settings-company-name").text();
    },
    set: function (value) {
      $("#settings-company-name").empty();
      $("#settings-company-name").text(value);
    },
  },
  company_alias: {
    get: function () {
      return $("#settings-company-initial").text();
    },
    set: function (value) {
      $("#settings-company-initial").empty();
      $("#settings-company-initial").text(value);
    },
  },
  address_of_branch: {
    get: function () {
      return $("#settings-branch-address").text();
    },
    set: function (value) {
      $("#settings-branch-address").empty();
      $("#settings-branch-address").append(value);
    },
  },
  phone_branch: {
    get: function () {
      return $("#settings-branch-phone").text();
    },
    set: function (value) {
      $("#settings-branch-phone").empty();
      $("#settings-branch-phone").append(value);
    },
  },
  text_cx_branch: {
    get: function () {
      return $("#settings-cxlpolicy").text();
    },
    set: function (value) {
      $("#settings-cxlpolicy").empty();
      $("#settings-cxlpolicy").append(value);
    },
  },

  address_of_company: {
    get: function () {
      return $("#settings-company-address").text();
    },
    set: function (value) {
      $("#settings-company-address").empty();
      $("#settings-company-address").append(value);
    },
  },
  phone: {
    get: function () {
      return $("#settings-company-phone").text();
    },
    set: function (value) {
      $("#settings-company-phone").empty();
      $("#settings-company-phone").text(value);
    },
  },
  tax_for_credit_card: {
    get: function () {
      return $("#settings-creditcard-tax").text();
    },
    set: function (value) {
      $("#settings-creditcard-tax").empty();
      $("#settings-creditcard-tax").text(value);
    },
  },
  cxl_policy: {
    get: function () {
      return $("#settings-cxlpolicy").text();
    },
    set: function (value) {
      $("#settings-cxlpolicy").empty();
      $("#settings-cxlpolicy").append(value);
    },
  },
  hotline: {
    get: function () {
      return $("#settings-company-hotline").text();
    },
    set: function (value) {
      $("#settings-company-hotline").empty();
      $("#settings-company-hotline").text(value);
    },
  },
  other_information: {
    get: function () {
      return $("#settings-other-info").text();
    },
    set: function (value) {
      $("#settings-other-info").empty();
      $("#settings-other-info").append(value);
    },
  },
  footer_branch_company: {
    get: function () {
      return $("#settings-footer-branch-company option:selected").val();
    },
    set: function (value) {
      $("#settings-footer-branch-company").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-footer-branch-company")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-footer-branch-company")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  /* ITOS DEVICE */

  tpv_device: {
    get: function () {
      return $("#settings-tpv-device option:selected").val();
    },
    set: function (value) {
      $("#settings-tpv-device").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-tpv-device").parents(".item-content").addClass("disabled");
      } else {
        $("#settings-tpv-device")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  tpv_address: {
    get: function () {
      return $("#settings-tpv-address").val();
    },
    set: function (value) {
      $("#settings-tpv-address").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-tpv-address")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-tpv-address")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  tpv_xsource: {
    get: function () {
      return $("#settings-tpv-xsource").val();
    },
    set: function (value) {
      $("#settings-tpv-xsource").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-tpv-xsource")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-tpv-xsource")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  tpv_username: {
    get: function () {
      return $("#settings-tpv-username").val();
    },
    set: function (value) {
      $("#settings-tpv-username").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-tpv-username")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-tpv-username")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  tpv_password: {
    get: function () {
      return $("#settings-tpv-password").val();
    },
    set: function (value) {
      $("#settings-tpv-password").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-tpv-password")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-tpv-password")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  tpv_qr: {
    get: function () {
      return $("#settings-tpv-qr option:selected").val();
    },
    set: function (value) {
      $("#settings-tpv-qr").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-tpv-qr").parents(".item-content").addClass("disabled");
      } else {
        $("#settings-tpv-qr").parents(".item-content").removeClass("disabled");
      }
    },
  },
  tpv_qrsize: {
    get: function () {
      return $("#settings-tpv-qrsize").val();
    },
    set: function (value) {
      $("#settings-tpv-qrsize").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-tpv-qrsize").parents(".item-content").addClass("disabled");
      } else {
        $("#settings-tpv-qrsize")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
  tpv_qrposition: {
    get: function () {
      return $("#settings-tpv-qrposition option:selected").val();
    },
    set: function (value) {
      $("#settings-tpv-qrposition").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-tpv-qrposition")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-tpv-qrposition")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },

  // ----- LOROPARQUE
  lp_status: {
    get: function () {
      return $("#settings-lp-status option:selected").val();
    },
    set: function (value) {
      $("#settings-lp-status").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-lp-status").parents(".item-content").addClass("disabled");
      } else {
        $("#settings-lp-status")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },

  lp_status_dev: {
    get: function () {
      return $("#settings-lp-status-dev option:selected").val();
    },
    set: function (value) {
      $("#settings-lp-status-dev").val(value);
    },
    disabled: function (status) {
      if (string_to_boolean(status)) {
        $("#settings-lp-status-dev")
          .parents(".item-content")
          .addClass("disabled");
      } else {
        $("#settings-lp-status-dev")
          .parents(".item-content")
          .removeClass("disabled");
      }
    },
  },
};

var REQUEST_EXIT = false;

$(document).ready(function () {
  // Initialize your app
  $app = new Framework7({
    animateNavBackIcon: true,
    pushState: true,
    popupCloseByOutside: false,
    swipeBackPage: false,
    onPageBeforeInit: app_page_initialize,
  });

  // Export selectors engine
  $$ = Dom7;

  // Add main View
  $main_view = $app.addView(".view-main", {
    main: true,
    dynamicNavbar: true,
    domCache: true,
  });

  $settings_view = $app.addView(".view-settings", {
    name: "settings",
    dynamicNavbar: true,
    domCache: false,
  });

  document.addEventListener("backbutton", function (e) {
    if ($main_view.history.length > 1) {
      $main_view.router.back();
      return;
    }

    if (!REQUEST_EXIT) {
      REQUEST_EXIT = true;

      // ask user for action
      $app.modal({
        title: $STRING.info_confirmation,
        text: "Exit application?",
        buttons: [
          {
            text: "Yes",
            bold: true,
            onClick: function () {
              navigator.app.exitApp();
            },
          },
          {
            text: "No",
            onClick: function () {
              REQUEST_EXIT = false;
            },
          },
        ],
      });
    }
  });

  $loader.hide();

  $("#settings-save").on("click", function () {
    var domain = $f_settings.domain.get();
    var branch = $f_settings.branch.get();
    var user = $f_settings.user.get();
    var market = $f_settings.market.get();
    var language = $f_settings.language.get();
    var currency = $f_settings.currency.get();

    if ("" == domain) {
      $app.alert("Domain is empty!", "Input required");
      return false;
    }
    if ("" == branch) {
      $app.alert("Branch is empty!", "Input required");
      return false;
    }
    if ("" == user) {
      $app.alert("User is empty!", "Input required");
      return false;
    }
    if ("" == market) {
      $app.alert("Market is empty!", "Input required");
      return false;
    }
    if ("" == language) {
      $app.alert("Language is empty!", "Input required");
      return false;
    }
    if ("" == currency) {
      $app.alert("Currency is empty!", "Input required");
      return false;
    }

    if (device.manufacturer != "ITOS") {
      if ($("#settings-print-device").val() == "TPV") {
        $app.alert("Print device not support", "Print Device");
        //$('#settings-print-device').val('BT')
        return false;
      }
    }
    settings_save(function () {
      $main_view.router.back();
    });
  });

  $("#settings-device").on("click", function () {
    $loader.show();

    //var $url= $SETTINGS.tpv_address
    var $url = $("#settings-tpv-address").val();

    if ($url === "") {
      $url = "https://127.0.0.1:2001";
    }

    //console.log(result)
    $loader.hide();
    $SETTINGS.tpv_address = $url;
    $app.alert("Save Settings", "Success", function () {
      settings_save(function () {
        $main_view.router.back();
      });
    });

    /*
        $.ajax({
            url: $url,
            type:'GET',
            dataType: 'text',
            success: function(result)
            {
                
            },
            error:function(result){
                console.log(result)
                $loader.hide();  
                $('#settings-tpv-device').val('false');
                var err_txt=result.statusText
                $app.alert(err_txt, 'Warning', function(){
                    //settings_save(function() {
                    //    $main_view.router.back();
                    //});
                    
                })

            }
        });
        */
  });

  // language-----------------------------------------------------
  $("#autocomplete-standalone-language").on("click", function () {
    get_language(function (data) {
      var buffer = "";
      for (var i = 0; i < data.length; i++) {
        buffer +=
          '<li class="item-content" data-item=\'' +
          JSON.stringify(data[i]) +
          "'>";
        buffer += '<div class="item-inner">';
        buffer += '  <div class="item-title">' + data[i].language + "</div>";
        buffer += '  <a href="#" class="button close-popup" ><b>Select</b></a>';
        buffer += "</div>";
        buffer += "</li>";
      }
      $("#settings-list-language").empty();
      $("#settings-list-language").append(buffer);

      $language.searchbar = $app.searchbar(".searchbar.language", {
        searchList: ".list-block-search",
        searchIn: ".item-title",
      });
      $app.popup(".popup-settings-language");
      $loader.hide();
    });
  });
  $(".searchbar.language input[type=text]").on("keyup", function () {
    var value = $(this).val();
    $language.searchbar.search(value);
  });
  $("#settings-list-language").on("click", ".close-popup", function () {
    var $root = $(this).parents(".item-content");
    var $item = $root.data("item");

    $f_settings.language.set($item.idx_language, $item.language);
  });

  CALENDAR_TEMPLATE = '<div class="toolbar calendar-custom-toolbar">';
  CALENDAR_TEMPLATE += '<div class="toolbar-inner">';
  CALENDAR_TEMPLATE += '<div class="left">';
  CALENDAR_TEMPLATE +=
    '<a href="#" class="link icon-only"><i class="icon icon-back"></i></a>';
  CALENDAR_TEMPLATE += "</div>";
  CALENDAR_TEMPLATE += '<div class="center"></div>';
  CALENDAR_TEMPLATE += '<div class="right">';
  CALENDAR_TEMPLATE +=
    '<a href="#" class="link icon-only"><i class="icon icon-forward"></i></a>';
  CALENDAR_TEMPLATE += "</div>";
  CALENDAR_TEMPLATE += "</div>";
  CALENDAR_TEMPLATE += "</div>";

  var calendarDefault = $app.calendar({
    input: "#settings-lastsync",
    convertToPopover: false,
    closeOnSelect: true,
    toolbarTemplate: CALENDAR_TEMPLATE,
    onOpen: function (p) {
      $$(".calendar-custom-toolbar .center").text(
        monthNames[p.currentMonth] + ", " + p.currentYear
      );
      $$(".calendar-custom-toolbar .left .link").on("click", function () {
        calendarDefault.prevMonth();
      });
      $$(".calendar-custom-toolbar .right .link").on("click", function () {
        calendarDefault.nextMonth();
      });
    },
    onMonthYearChangeStart: function (p, year, month) {
      $$(".calendar-custom-toolbar .center").text(
        monthNames[p.currentMonth] + ", " + p.currentYear
      );
    },
    onMonthYearChangeEnd: function (p, year, month) {
      console.log("end: " + year + ", " + month);
    },
  });

  $("#settings-about").on("click", function () {
    $app.popup(".popup-about");
  });

  $("#about-changelog").on("click", function () {
    // $app.popup('.popup-changelog');

    $main_view.router.load({
      url: "page/changelog.html",
    });
  });

  $("#settings-reset").on("click", function () {
    $loader.show();
    $status.set("RESETING DATABASE");

    list_table_name(function (data) {
      database_reset(data, false, function () {
        $loader.hide();
        $app.alert("Reset complete!", $STRING.info_done, function () {
          console.log("reset done");
        });
      });
    });
  });

  $("#settings-setup").on("click", function () {
    prompt_login(true);
  });

  $("#settings-paygate").on("click", function () {
    //$settings_view
    // metode ini mengganggu event, jadi dobel
    $main_view.router.load({
      url: "paygate_list.html",
      reload: true,
    });
    //app_page_view('.view-settings')
  });

  $("#settings-printtest").on("click", function () {
    console.log($SETTINGS.print_device);
    switch ($SETTINGS.print_device) {
      case "TPV":
        // print_TPV.js
        //tpv_testprint($SETTINGS.tpv_address);
        tpv_printtext("TEST Print", $SETTINGS.print_header);
        break;
      default:
        $app.popup(".popup-printer");
        printer_device_list("", $SETTINGS.print_header);
        break;
    }
  });
});

function settings_save(callback) {
  $loader.show();
  settings_update(settings_form_data(), function () {
    // load config data
    settings_data_load(function () {
      // reset!
      var is_online = $MODE == "online" ? true : false;
      checkout_reset(is_online, function () {
        $loader.hide();
        callback();
      });
    });
  });
}

function initialize_settings(callback) {
  $status.set("INITIALIZE SETTINGS");

  // hide unsupported features
  if (device.platform != "Android") {
    $(".android-only").parents(".item-content").addClass("disabled");
  } else {
    $(".android-only").hide();
  }

  settings_create(db_settings, function () {
    settings_data_load(function () {
      // initialize company's default (change restriction only)
      var ID_COMPANY = identify_company($f_settings.registration_id.get());
      var DEFAULT = $DEFAULT_SET[ID_COMPANY];

      var d_payment_combinable = DEFAULT.payment_combinable;
      var d_payment_manual = DEFAULT.payment_manual;
      var d_payment_default = DEFAULT.payment_default;
      var d_print_company_logo = DEFAULT.print_company_logo;
      var d_print_size = DEFAULT.print_size;
      var d_print_header = DEFAULT.print_header;
      var d_discount_before_surcharge = DEFAULT.discount_before_surcharge;
      var d_discount_split_view = DEFAULT.discount_split_view;
      var d_discount_validation = DEFAULT.discount_validation;
      var d_last_minute_booking = DEFAULT.last_minute_booking;
      var d_required_guest_details = DEFAULT.required_guest_details;
      var d_voucher_connect = DEFAULT.voucher_connect;
      var d_voucher_amend = DEFAULT.voucher_amend;
      var d_voucher_manual = DEFAULT.voucher_manual;

      $f_settings.payment_combinable.disabled(d_payment_combinable.locked);
      $f_settings.payment_manual.disabled(d_payment_manual.locked);
      $f_settings.payment_default.disabled(d_payment_default.locked);
      $f_settings.print_company_logo.disabled(d_print_company_logo.locked);
      $f_settings.print_size.disabled(d_print_size.locked);
      //$f_settings.print_header.disabled(d_print_header.locked);
      $f_settings.discount_before_surcharge.disabled(
        d_discount_before_surcharge.locked
      );
      $f_settings.discount_split_view.disabled(d_discount_split_view.locked);
      $f_settings.discount_validation.disabled(d_discount_validation.locked);
      $f_settings.last_minute_booking.disabled(d_last_minute_booking.locked);
      $f_settings.required_guest_details.disabled(
        d_required_guest_details.locked
      );
      $f_settings.voucher_connect.disabled(d_voucher_connect.locked);
      $f_settings.voucher_amend.disabled(d_voucher_amend.locked);
      $f_settings.voucher_manual.disabled(d_voucher_manual.locked);

      callback();
    });
  });
}

function check_for_sync_transaction(callback) {
  ssql_load("LIST_TRANSACTION_SYNC", "ALL", function (ssql_data) {
    ssql = ssql_data.script;
    ssql = ssql.replace(/@:status:/g, "0");

    sql_data(ssql, function (result) {
      if (result.length) {
        $app.alert(
          $STRING.required_sync_transaction.replace(/@:count:/g, result.length),
          $STRING.info_important,
          function () {
            $main_view.router.loadPage("#synchronize");
          }
        );
      } else {
        callback();
      }
    });
  });
}

function check_for_sync_master() {
  var last_sync = $SETTINGS.last_sync_db_master;
  last_sync = last_sync.length > 10 ? last_sync.substr(0, 10) : last_sync;
  var today = get_date();

  if (last_sync != today) {
    $app.modal({
      title: $STRING.info_important,
      text: $STRING.required_sync_master,
      buttons: [
        {
          text: "Later",
          onClick: function () {
            //callback();
          },
        },
        {
          text: "Sync now",
          bold: true,
          onClick: function () {
            sync_master_refresh(function () {
              sync_master_execute();
            });
          },
        },
      ],
    });
  } else {
    //callback();
  }
}

function settings_data_load(callback) {
  ssql = "SELECT * FROM config;";
  sql(ssql, function (result) {
    SQL_ROWS = result.rows;
    SQL_ARRAY = arr_props_to_lower(SQL_ROWS._array);

    if (SQL_ARRAY.length != 0) {
      var need_setup = false;

      for (var i = 0; i < SQL_ARRAY.length; i++) {
        console.log(SQL_ARRAY[i].name);
        switch (SQL_ARRAY[i].name) {
          case "company":
            $SETTINGS.company.id = SQL_ARRAY[i].value;
            $SETTINGS.company.name = SQL_ARRAY[i].description;
            break;
          case "branch":
            $SETTINGS.branch.id = SQL_ARRAY[i].value;
            $SETTINGS.branch.name = SQL_ARRAY[i].description;
            break;
          case "user":
            $SETTINGS.user.id = SQL_ARRAY[i].value;
            $SETTINGS.user.name = SQL_ARRAY[i].description;
            break;
          case "market":
            $SETTINGS.market.id = SQL_ARRAY[i].value;
            $SETTINGS.market.name = SQL_ARRAY[i].description;
            break;
          case "language":
            $SETTINGS.language.id = SQL_ARRAY[i].value;
            $SETTINGS.language.name = SQL_ARRAY[i].description;
            break;
          case "currency":
            $SETTINGS.currency.id = SQL_ARRAY[i].value;
            $SETTINGS.currency.name = SQL_ARRAY[i].description;
            break;

          /* additional settings */
          case "company-active-date":
            $SETTINGS.company_active_date = SQL_ARRAY[i].value;
            break;
          case "initial-company":
            $SETTINGS.initial_company = SQL_ARRAY[i].value;
            break;
          case "initial-user":
            $SETTINGS.initial_user = SQL_ARRAY[i].value;
            break;
          case "length-of-voucher-number":
            $SETTINGS.length_of_voucher_number = SQL_ARRAY[i].value;
            break;
          case "required-guest-details":
            $SETTINGS.required_guest_details = SQL_ARRAY[i].value;
            break;
          case "server":
            $SETTINGS.server = SQL_ARRAY[i].value;
            break;
          case "discount-before-surcharge":
            $SETTINGS.discount_before_surcharge = SQL_ARRAY[i].value;
            break;
          case "discount-split-view":
            $SETTINGS.discount_split_view = SQL_ARRAY[i].value;
            break;
          case "discount-validation":
            $SETTINGS.discount_validation = SQL_ARRAY[i].value;
            break;
          case "last-minute-booking":
            $SETTINGS.last_minute_booking = SQL_ARRAY[i].value;
            break;
          case "payment-combinable":
            $SETTINGS.payment_combinable = SQL_ARRAY[i].value;
            break;
          case "payment-manual":
            $SETTINGS.payment_manual = SQL_ARRAY[i].value;
            break;
          case "payment-default":
            $SETTINGS.payment_default = SQL_ARRAY[i].value;
            break;
          case "print-company-logo":
            $SETTINGS.print_company_logo = SQL_ARRAY[i].value;
            break;
          case "print-size":
            $SETTINGS.print_size = SQL_ARRAY[i].value;
            break;
          case "print-header":
            $SETTINGS.print_header = SQL_ARRAY[i].value;
            break;
          case "print-device":
            $SETTINGS.print_device = SQL_ARRAY[i].value;
            break;
          case "print-barcode":
            $SETTINGS.print_barcode = SQL_ARRAY[i].value;
            break;
          case "barcode-type":
            $SETTINGS.barcode_type = SQL_ARRAY[i].value;
            break;
          case "barcode-length":
            $SETTINGS.barcode_length = SQL_ARRAY[i].value;
            break;
          case "barcode-hri":
            $SETTINGS.barcode_hri = SQL_ARRAY[i].value;
            break;
          case "tax-for-credit-card":
            $SETTINGS.tax_for_credit_card = SQL_ARRAY[i].value;
            break;
          case "voucher-connect":
            $SETTINGS.voucher_connect = SQL_ARRAY[i].value;
            break;
          case "voucher-amend":
            $SETTINGS.voucher_amend = SQL_ARRAY[i].value;
            break;
          case "voucher-manual":
            $SETTINGS.voucher_manual = SQL_ARRAY[i].value;
            break;

          /* synchronized */
          case "last-sync-db-daily":
            $SETTINGS.last_sync_db_daily = SQL_ARRAY[i].value;
            break;
          case "last-sync-db-master":
            $SETTINGS.last_sync_db_master = SQL_ARRAY[i].value;
            break;
          case "last-sync-transact":
            $SETTINGS.last_sync_transact = SQL_ARRAY[i].value;
            break;

          /* string */
          case "address-of-branch":
            $SETTINGS.string.address_of_branch = SQL_ARRAY[i].value;
          case "address-of-company":
            $SETTINGS.string.address_of_company = SQL_ARRAY[i].value;
          case "cancellation":
            $SETTINGS.string.cancellation = SQL_ARRAY[i].value;
            break;
          case "hotline":
            $SETTINGS.string.hotline = SQL_ARRAY[i].value;
            break;
          case "phone":
            $SETTINGS.string.phone = SQL_ARRAY[i].value;
            break;
          case "phone-branch":
            $SETTINGS.string.phone_branch = SQL_ARRAY[i].value;
            break;
          case "text-cx-branch":
            $SETTINGS.string.text_cx_branch = SQL_ARRAY[i].value;
            break;
          case "other-information":
            $SETTINGS.string.other_information = SQL_ARRAY[i].value;
            break;
          case "footer-branch-company":
            $SETTINGS.string.footer_branch_company = SQL_ARRAY[i].value;
            break;

          /* ITOS DEVICE */
          case "tpv-device":
            $SETTINGS.tpv_device = SQL_ARRAY[i].value;
            break;
          case "tpv-address":
            $SETTINGS.tpv_address = SQL_ARRAY[i].value;
            break;
          case "tpv-xsource":
            $SETTINGS.tpv_xsource = SQL_ARRAY[i].value;
            break;
          case "tpv-username":
            $SETTINGS.tpv_username = SQL_ARRAY[i].value;
            break;
          case "tpv-password":
            $SETTINGS.tpv_password = SQL_ARRAY[i].value;
            break;
          case "tpv-qr":
            $SETTINGS.tpv_qr = SQL_ARRAY[i].value;
            break;
          case "tpv-qrsize":
            $SETTINGS.tpv_qrsize = SQL_ARRAY[i].value;
            break;
          case "tpv-qrposition":
            $SETTINGS.tpv_qrposition = SQL_ARRAY[i].value;
            break;

          /* LOROPARQUE */
          case "lp-status":
            $SETTINGS.lp_status = SQL_ARRAY[i].value;
            break;
          case "lp-status-dev":
            $SETTINGS.lp_status_dev = SQL_ARRAY[i].value;
            break;
        }
      }
      settings_form_load();

      if (string_to_boolean($SETTINGS.voucher_manual)) {
        $("#menu-manualvoucher").show();
      } else {
        $("#menu-manualvoucher").hide();
      }

      //$('#menu-itosdevice').hide();
      if ($SETTINGS.tpv_device == "true") {
        //  $('#menu-itosdevice').show();
      }

      // not complete yet!
      // i will continue this block someday
      if ($SETTINGS.initial_user != "") {
        callback();
      } else {
        $loader.hide();
        prompt_login();
      }
    } else {
      // 3.0.38
      // empty config!
      prompt_login();
    }
  });
}
function settings_form_data() {
  var data = [];
  /* basic */
  data.push({
    name: "server",
    value: $f_settings.domain.get(),
    description: "",
  });
  data.push({
    name: "company",
    value: $f_settings.registration_id.get(),
    description: $f_settings.company_name.get(),
  });
  data.push({
    name: "branch",
    value: $f_settings.branch.get(),
    description: $f_settings.branch.get("label"),
  });
  data.push({
    name: "user",
    value: $f_settings.user.get(),
    description: $f_settings.user.get("label"),
  });
  data.push({
    name: "market",
    value: $f_settings.market.get(),
    description: $f_settings.market.get("label"),
  });
  data.push({
    name: "language",
    value: $f_settings.language.get(),
    description: $f_settings.language.get("label"),
  });
  data.push({
    name: "currency",
    value: $f_settings.currency.get(),
    description: $f_settings.currency.get("label"),
  });
  /* additional */
  data.push({
    name: "company-active-date",
    value: $f_settings.company_active_date.get(),
    description: "",
  });
  data.push({
    name: "initial-company",
    value: $f_settings.company_alias.get(),
    description: "",
  });
  data.push({
    name: "initial-user",
    value: $f_settings.user_initial.get(),
    description: "",
  });
  data.push({
    name: "required-guest-details",
    value: $f_settings.required_guest_details.get(),
    description: "",
  });
  data.push({
    name: "discount-before-surcharge",
    value: $f_settings.discount_before_surcharge.get(),
    description: "",
  });
  data.push({
    name: "discount-split-view",
    value: $f_settings.discount_split_view.get(),
    description: "",
  });
  data.push({
    name: "discount-validation",
    value: $f_settings.discount_validation.get(),
    description: "",
  });
  data.push({
    name: "last-minute-booking",
    value: $f_settings.last_minute_booking.get(),
    description: "",
  });
  data.push({
    name: "payment-combinable",
    value: $f_settings.payment_combinable.get(),
    description: "",
  });
  data.push({
    name: "payment-manual",
    value: $f_settings.payment_manual.get(),
    description: "",
  });
  data.push({
    name: "payment-default",
    value: $f_settings.payment_default.get(),
    description: "",
  });
  data.push({
    name: "print-company-logo",
    value: $f_settings.print_company_logo.get(),
    description: "",
  });
  data.push({
    name: "print-device",
    value: $f_settings.print_device.get(),
    description: "",
  });
  data.push({
    name: "print-size",
    value: $f_settings.print_size.get(),
    description: "",
  });
  data.push({
    name: "print-header",
    value: $f_settings.print_header.get(),
    description: "",
  });
  data.push({
    name: "print-barcode",
    value: $f_settings.print_barcode.get(),
    description: "",
  });
  data.push({
    name: "barcode-type",
    value: $f_settings.barcode_type.get(),
    description: "",
  });
  data.push({
    name: "barcode-length",
    value: $f_settings.barcode_length.get(),
    description: "",
  });
  data.push({
    name: "barcode-hri",
    value: $f_settings.barcode_hri.get(),
    description: "",
  });
  data.push({
    name: "tax-for-credit-card",
    value: $f_settings.tax_for_credit_card.get(),
    description: "",
  });
  data.push({
    name: "voucher-connect",
    value: $f_settings.voucher_connect.get(),
    description: "",
  });
  data.push({
    name: "voucher-amend",
    value: $f_settings.voucher_amend.get(),
    description: "",
  });
  data.push({
    name: "voucher-manual",
    value: $f_settings.voucher_manual.get(),
    description: "",
  });
  /* string */
  data.push({
    name: "address-of-branch",
    value: $f_settings.address_of_branch.get(),
    description: "",
  });
  data.push({
    name: "address-of-company",
    value: $f_settings.address_of_company.get(),
    description: "",
  });
  data.push({
    name: "cancellation",
    value: $f_settings.cxl_policy.get(),
    description: "",
  });
  data.push({
    name: "hotline",
    value: $f_settings.hotline.get(),
    description: "",
  });
  data.push({ name: "phone", value: $f_settings.phone.get(), description: "" });
  data.push({
    name: "phone-branch",
    value: $f_settings.phone_branch.get(),
    description: "",
  });
  data.push({
    name: "text-cx-branch",
    value: $f_settings.text_cx_branch.get(),
    description: "",
  });
  data.push({
    name: "other-information",
    value: $f_settings.other_information.get(),
    description: "",
  });
  data.push({
    name: "footer-branch-company",
    value: $f_settings.footer_branch_company.get(),
    description: "",
  });

  //------ ITOS DEVICE
  data.push({
    name: "tpv-device",
    value: $f_settings.tpv_device.get(),
    description: "",
  });
  data.push({
    name: "tpv-address",
    value: $f_settings.tpv_address.get(),
    description: "",
  });
  data.push({
    name: "tpv-xsource",
    value: $f_settings.tpv_xsource.get(),
    description: "",
  });
  data.push({
    name: "tpv-username",
    value: $f_settings.tpv_username.get(),
    description: "",
  });
  data.push({
    name: "tpv-password",
    value: $f_settings.tpv_password.get(),
    description: "",
  });
  data.push({
    name: "tpv-qr",
    value: $f_settings.tpv_qr.get(),
    description: "",
  });
  data.push({
    name: "tpv-qrsize",
    value: $f_settings.tpv_qrsize.get(),
    description: "",
  });
  data.push({
    name: "tpv-qrposition",
    value: $f_settings.tpv_qrposition.get(),
    description: "",
  });

  //------ LOROPARQUE
  data.push({
    name: "lp-status",
    value: $f_settings.lp_status.get(),
    description: "",
  });
  data.push({
    name: "lp-status-dev",
    value: $f_settings.lp_status_dev.get(),
    description: "",
  });

  return data;
}

function settings_update(arr, callback) {
  var arrs = arr;
  var data = arrs[0];

  ssql = " UPDATE config SET ";
  ssql += " value = '" + parseESC(data.value) + "', ";
  ssql += " description = '" + parseESC(data.description) + "' ";
  ssql += " WHERE name = '" + data.name + "'";

  sql(ssql, function (result) {
    if (result == 0) {
      alert("SQL update failed!");
    }

    if (arrs.length != 0) {
      arrs.shift();
    }
    if (arrs.length != 0) {
      settings_update(arrs, callback);
    } else {
      callback();
    }
  });
}
function settings_create(arr, callback) {
  var arrs = arr;
  var data = arrs[0];

  ssql = " INSERT INTO config(name, type, value, description) ";
  ssql +=
    " SELECT '" +
    data.name +
    "','" +
    data.type +
    "','" +
    data.value +
    "','" +
    data.description +
    "' ";
  ssql +=
    " WHERE NOT EXISTS(SELECT * FROM config WHERE name = '" +
    data.name +
    "'); ";

  sql(ssql, function (result) {
    if (arrs.length != 0) {
      arrs.shift();
    }
    if (arrs.length != 0) {
      settings_create(arrs, callback);
    } else {
      callback();
    }
  });
}

function settings_form_load() {
  $f_settings.domain.set($SETTINGS.server);
  $f_settings.branch.set($SETTINGS.branch.id, $SETTINGS.branch.name);
  $f_settings.user.set($SETTINGS.user.id, $SETTINGS.user.name);
  $f_settings.market.set($SETTINGS.market.id, $SETTINGS.market.name);
  $f_settings.language.set($SETTINGS.language.id, $SETTINGS.language.name);
  $f_settings.currency.set($SETTINGS.currency.id, $SETTINGS.currency.name);

  $f_settings.tax_for_credit_card.set($SETTINGS.tax_for_credit_card);
  $f_settings.required_guest_details.set($SETTINGS.required_guest_details);
  $f_settings.discount_before_surcharge.set(
    $SETTINGS.discount_before_surcharge
  );
  $f_settings.discount_split_view.set($SETTINGS.discount_split_view);
  $f_settings.discount_validation.set($SETTINGS.discount_validation);
  $f_settings.last_minute_booking.set($SETTINGS.last_minute_booking);
  $f_settings.payment_combinable.set($SETTINGS.payment_combinable);
  $f_settings.payment_manual.set($SETTINGS.payment_manual);
  $f_settings.payment_default.set($SETTINGS.payment_default);
  $f_settings.print_company_logo.set($SETTINGS.print_company_logo);
  $f_settings.print_size.set($SETTINGS.print_size);
  $f_settings.print_header.set($SETTINGS.print_header);
  $f_settings.print_device.set($SETTINGS.print_device);
  $f_settings.print_barcode.set($SETTINGS.print_barcode);
  $f_settings.barcode_type.set($SETTINGS.barcode_type);
  $f_settings.barcode_length.set($SETTINGS.barcode_length);
  $f_settings.barcode_hri.set($SETTINGS.barcode_hri);
  $f_settings.voucher_connect.set($SETTINGS.voucher_connect);
  $f_settings.voucher_amend.set($SETTINGS.voucher_amend);
  $f_settings.voucher_manual.set($SETTINGS.voucher_manual);

  $f_settings.registration_id.set($SETTINGS.company.id);
  $f_settings.company_active_date.set($SETTINGS.company_active_date);
  $f_settings.company_name.set($SETTINGS.company.name);
  $f_settings.company_alias.set($SETTINGS.initial_company);
  $f_settings.address_of_branch.set($SETTINGS.string.address_of_branch);
  $f_settings.address_of_company.set($SETTINGS.string.address_of_company);
  $f_settings.phone.set($SETTINGS.string.phone);
  $f_settings.phone_branch.set($SETTINGS.string.phone_branch);
  $f_settings.text_cx_branch.set($SETTINGS.string.text_cx_branch);
  $f_settings.cxl_policy.set($SETTINGS.string.cancellation);
  $f_settings.hotline.set($SETTINGS.string.hotline);
  $f_settings.user_initial.set($SETTINGS.initial_user);
  $f_settings.other_information.set($SETTINGS.string.other_information);
  $f_settings.footer_branch_company.set($SETTINGS.string.footer_branch_company);

  //----- ITOS DEVICEs
  $f_settings.tpv_device.set($SETTINGS.tpv_device);
  $f_settings.tpv_address.set($SETTINGS.tpv_address);
  $f_settings.tpv_xsource.set($SETTINGS.tpv_xsource);
  $f_settings.tpv_username.set($SETTINGS.tpv_username);
  $f_settings.tpv_password.set($SETTINGS.tpv_password);
  $f_settings.tpv_qr.set($SETTINGS.tpv_qr);
  $f_settings.tpv_qrsize.set($SETTINGS.tpv_qrsize);
  $f_settings.tpv_qrposition.set($SETTINGS.tpv_qrposition);

  // ---- Loroparque
  $f_settings.lp_status.set($SETTINGS.lp_status);
  $f_settings.lp_status_dev.set($SETTINGS.lp_status_dev);
}

function get_language(callback) {
  var domain = $f_settings.domain.get();
  var branch = $f_settings.branch.get();
  var user = $f_settings.user.get();

  $loader.show();
  $status.set("LOADING LANGUAGE");

  $.ajax({
    url: get_core_module(domain),
    data:
      "&act=settings-language&domain=" +
      domain +
      "&branch=" +
      branch +
      "&user=" +
      user,
    dataType: "json",
    success: function (result) {
      callback(result);
    },
  });
}
