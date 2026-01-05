var $itos_payresult = [
  { val: 0, text: "Succes" },
  { val: -1000, text: "initialization succesfull" },
  { val: -1001, text: "Service is busy (processing another transaction)" },
  { val: -1002, text: "Payment Service is Not Active" },
  { val: -1003, text: "Payment Service is Not Initialized" },
  { val: -1004, text: "Internet Connexion is Not Present" },
  { val: -1005, text: "Hardware Error" },
  { val: -1006, text: "Missing Data" },
  { val: -1007, text: "Input Data Format Error" },
];

var amountcc = 0;

$(document).ready(function () {
  $("body").on("click", "#itos-scanner", function () {
    $scanner.init();
  });

  $("body").on("click", "#itos-print", function () {
    tpv_printtext("TEST Print", "TEST PRINT");
    //tpv_printticketLP($buffer_arrResultInsercion,function(){});
  });

  $("body").on("click", "#itos-payment", function () {
    $itos_payment.init(function (r) {
      if (r.resultCode === 1000) {
        $itos_payment.payment(
          $("#itos_pay_code").val(),
          $("#itos_pay_amount").val(),
          function (rr) {
            $("#txt-resultp").val(JSON.stringify(rr, undefined, 4));
            if (rr.resultCode === 0) {
              tpv_printbillcc(rr, "BILL PAYMENT", function (r) {
                $("#txt-resultp").val(JSON.stringify(r, undefined, 4));
              });
            } else {
              $("#txt-resultp").val(JSON.stringify(rr, undefined, 4));
              $app.alert(rr.resultMessage, "error");
            }
          }
        );

        /*
                $itos_payment.preauthnew($('#itos_pay_code').val(),$('#itos_pay_amount').val(),function(rr){
                    if(rr.resultCode===0){
                        //$('#txt-resultp').val(JSON.stringify(rr))

                        $itos_payment.preauthupdate(rr, $('#itos_pay_code').val(),$('#itos_pay_amount').val(),function(rrr){
                            if(rrr.resultCode===0){

                                $itos_payment.preauthcomplete(rrr, $('#itos_pay_code').val(),$('#itos_pay_amount').val(),function(rrrr){
                                    if(rrrr.resultCode===0){

                                        $itos_payment.cashout($('#itos_pay_code').val(),$('#itos_pay_amount').val(),function(rrrrr){
                                            if(rrrrr.resultCode===0){
                                                $('#txt-resultp').val(JSON.stringify(rrrrr))                                                       
                                                
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
                */
      }
    });
  });
});

var $itos_scanner = (function () {
  var module = "/v1/device/scanner";

  return {
    init: function (w, h) {
      var data = '{\n	"width": 600,\n	"height": 600\n}';
      postITOS(module, data, function (r) {
        console.log(r);
        $("#txt-result").val(r);
      });
    },
  };
})();

var $itos_payment = (function () {
  return {
    init: function (callback) {
      var module = "/v1/transactions/init";
      var data = '{\n"user":"' + $SETTINGS.tpv_username + '",\n"password":"' + $SETTINGS.tpv_password + '"\n}';

      postITOS(module, data, function (r) {
        var d = $.parseJSON(r);
        callback(d);
      });
    },
    payment: function (orderid, amount, callback) {
      var module = "/v1/transactions/payment";
      var data = '{\n"orderId":"' + orderid + '",\n"amount":"' + amount + '"\n}';
      console.log("payment : ", orderid, amount);
      postITOS(module, data, function (r) {
        var d = $.parseJSON(r);
        console.log("payment", d);
        callback(d);
      });
    },
    preauthnew: function (orderid, amount, callback) {
      var module = "/v1/transactions/preauth/new";
      var data = '{\n"orderId":"' + orderid + '",\n"amount":"' + amount + '"\n}';
      postITOS(module, data, function (r) {
        var d = $.parseJSON(r);
        console.log("preauthnew", d);
        callback(d);
      });
    },
    preauthupdate: function ($data, orderid, amount, callback) {
      var module = "/v1/transactions/preauth/update";
      var data = '{\n	"transactionId": "' + $data.ticket.Id + '",\n"transactionDate":"' + $data.ticket.Date + '",\n	"amount":' + amount + "\n}";
      postITOS(module, data, function (r) {
        var d = $.parseJSON(r);
        console.log("preauthupdate", d);
        callback(d);
      });
    },
    preauthcomplete: function ($data, orderid, amount, callback) {
      var module = "/v1/transactions/preauth/complete";
      var data =
        '{\n	"transactionId": "' +
        $data.ticket.Id +
        '",\n"transactionDate":"' +
        $data.ticket.Date +
        '",\n	"amount":' +
        amount +
        "\n}";
      postITOS(module, data, function (r) {
        var d = $.parseJSON(r);
        console.log("preauthcomplete", d);
        callback(d);
      });
    },
    cashout: function (orderid, amount, callback) {
      var module = "/v1/transactions/cashout";
      var data =
        '{\n"orderId":"' + orderid + '",\n"amount":"' + amount + '"\n}';
      postITOS(module, data, function (r) {
        var d = $.parseJSON(r);
        console.log("preauthcomplete", d);
        callback(d);
      });
    },
    last: function (orderid, amount, callback) {
      var module = "/v1/transactions/last";
      var data = "";
      postITOS(module, data, function (r) {
        var d = $.parseJSON(r);
        console.log("last", d);
        callback(d);
      });
    },
  };
})();

function postITOS(module, $data, callback) {
  var $url = $SETTINGS.tpv_address;
  if ($SETTINGS.tpv_address === "") {
    $url = "https://127.0.0.1:2001";
  }

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      callback(this.responseText);
    }
  });

  xhr.open("POST", $url + module);
  xhr.setRequestHeader("X-SOURCE", $SETTINGS.tpv_xsource);
  xhr.send($data);
}
