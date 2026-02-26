var $tpvarr_barcode = [
  { val_plugin: "71", val: "CODABAR" },
  { val_plugin: "69", val: "CODE_39" },
  { val_plugin: "72", val: "CODE_93" },
  { val_plugin: "73", val: "CODE_128" },
  { val_plugin: "68", val: "EAN_8" },
  { val_plugin: "67", val: "EAN_13" },
  { val_plugin: "70", val: "ITF" },
  { val_plugin: "65", val: "UPC_A" },
  { val_plugin: "66", val: "UPC_E" },
];

var $tpv_result = [
  { val: 0, text: "Succes" },
  { val: -1001, text: "Printer Print Failure" },
  { val: -1002, text: "Failed to set the string in buffer" },
  { val: -1003, text: "Failed to set the image in buffer" },
  { val: -1004, text: "Printer Busy" },
  { val: -1005, text: "Out of paper" },
  { val: -1006, text: "Wrong Package" },
  { val: -1007, text: "Printer Hardware Failure" },
  { val: -1008, text: "OverTemperature" },
  { val: -1009, text: "Printing has not finished" },
  { val: -1999, text: "Exception error" },
];

var $fontSize = 18;
var $def_print = { fontsize: $fontSize };

var txtrow =
  '\n{\n"type": "TEXT",\n"text":"@:dt:",\n"align":"LEFT",\n"fontSize": ' +
  $def_print.fontsize +
  ',\n"isBold": false,\n"isUnderline": false\n},';
var txtrowright =
  '\n{\n"type": "TEXT",\n"text":"@:dt:",\n"rightText":"@:dtr:",\n"align":"CENTER",\n"fontSize": ' +
  $def_print.fontsize +
  ',\n"isBold": false,\n"isUnderline": false\n},';
var strline =
  '\n{\n"type": "TEXT",\n"text":".................................................",\n"align":"CENTER",\n"fontSize": 30,\n"isBold": false,\n"isUnderline": false\n},';
var strlinecut =
  '\n{\n"type": "TEXT",\n"text":".................. CUT HERE .................",\n"align":"CENTER",\n"fontSize": 25,\n"isBold": false,\n"isUnderline": false\n},';
var strnewline =
  '\n{\n"type": "TEXT",\n"text":"  ",\n"align":"CENTER",\n"fontSize": 18,\n"isBold": false,\n"isUnderline": false\n},';

function tpv_testprint(address, callback) {
  var datastr = escape(data);
  console.log(datastr);
  var data = "";

  printTPV(data, function (r) {
    $($tpv_result).filter(function (i, n) {
      var d = $.parseJSON(r);
      if (n.val === d.resultCode) {
        if (d.resultCode < 0) {
          alert(n.text);
        }
      }
    });
  });
}

function tpv_print(data, $title, callback) {
  var module = "/v1/device/printer";
  var $ddata =
    '{\n"typeFace":"Sans-Serif",\n"advancePaper": true,\n"letterSpacing": 2,\n"grayLevel": 2,\n\n"rows":[';

  console.log(data);
  if (Array.isArray(data)) {
    console.log(data.length);

    $.each(data, function (m) {
      tpv_print_buffer(data[m], $title, function (d) {
        if (data[m].idx_mfexcursion != "") {
          if (m > 0) {
            $ddata += strnewline;
            $ddata += strlinecut;
            $ddata += strnewline;
          }
          $ddata += d;
        }
      });
    });
  } else {
    tpv_print_buffer(data, $title, function (d) {
      $ddata += d;
    });
  }

  $ddata += strnewline.substring(0, strnewline.length - 1);
  $ddata += "]\n},";

  postITOS(module, $ddata.substring(0, $ddata.length - 1), function (e) {
    $($tpv_result).filter(function (i, n) {
      var rr = $.parseJSON(e);
      if (n.val === rr.resultCode) {
        if (rr.resultCode < 0) {
          alert(n.text);
        } else {
          callback();
        }
      }
    });
  });
}

function tpv_print_buffer(data, title, callback) {
  console.log(data);
  var pax =
    parseInt(data.paxa) +
    parseInt(data.paxc) +
    parseInt(data.paxi) +
    " PAX [ " +
    data.paxa +
    "A | " +
    data.paxc +
    "C | " +
    data.paxi +
    "I ]";
  var namelist = "";
  var buffer = "";
  var number = 0;
  var promosum = parseFloat(data.promo); // discount+promo_p
  var surcharges = "";
  var payment = data.val_payment.toUpperCase();
  payment = payment.replace("PAY ON TOUR", label_pot.toUpperCase());

  // check for support of namelist column
  if (data.hasOwnProperty("namelist")) {
    namelist = data.namelist;
    namelist = namelist.replace(/\([^\)]*\)/g, ""); // remove age
    namelist = namelist
      .replace(/<[^>]*>/g, ",")
      .replace(/([0-9]|[\-+#.|()])+?/g, ""); // remove html tag

    // format namelist
    namelist = namelist.split(",");
    for (var j = 0; j < namelist.length; j++) {
      var name = namelist[j].trim();

      if (name.length > 4) {
        number++;
        buffer += txtrow.replace(
          /\@:dt:/g,
          number + ". " + name.split("|")[0].toUpperCase()
        );
      }
    }
    namelist = buffer;
  }

  // check for surcharge existence (prevent error)
  if (data.surcharge_detail) {
    surcharges = data.surcharge_detail.split(", ");
    buffer = "";
    for (var j = 0; j < surcharges.length; j++) {
      var name = surcharges[j].trim();

      if (name.length) {
        buffer += txtrow.replace(/\@:dt:/g, "+ " + name.toUpperCase());
      }
    }
    // remove last {br}
    surcharges = buffer;
  }

  var $prn_header =
    $SETTINGS.print_header +
    (data.status_prn !== undefined ? " " + data.status_prn : "");

  var $companyname =
    '\n{\n"type": "TEXT",\n"text":"' +
    $SETTINGS.company.name +
    '",\n"align":"CENTER",\n"fontSize": 20,\n"isBold": true,\n"isUnderline": false\n},';
  $companyname +=
    '\n{\n"type": "TEXT",\n"text":"' +
    $prn_header +
    '",\n"align":"CENTER",\n"fontSize": 25,\n"isBold": true,\n"isUnderline": false\n},';

  //var $data           = "{\n\"typeFace\":\"Sans-Serif\",\n\"advancePaper\": true,\n\"letterSpacing\": 2,\n\"grayLevel\": 2,\n\n\"rows\":["
  var $data = "";
  $data += tpv_printlogo() + $companyname;

  var name_exc =
    data.excursion_alias !== "" ? data.excursion_alias : data.excursion;
  $data += strnewline;
  $data += txtrowright
    .replace(/\@:dt:/g, "Code : ")
    .replace(/\@:dtr:/g, data.voucher);
  $data += txtrowright
    .replace(/\@:dt:/g, "Date : ")
    .replace(/\@:dtr:/g, data.date_tr);
  if (typeof data.barcode !== "undefined") {
    $data += txtrowright
      .replace(/\@:dt:/g, "Barcode : ")
      .replace(/\@:dtr:/g, data.barcode);
  }
  $data += strnewline;
  $data += txtrowright.replace(/\@:dt:/g, "PAX : ").replace(/\@:dtr:/g, pax);
  $data += txtrow.replace(/\@:dt:/g, "Clients Name : ");
  $data +=
    '\n{\n"type": "TEXT",\n"text":"' +
    data.guestname.toUpperCase() +
    '",\n"align":"LEFT",\n"fontSize": 20,\n"isBold": true,\n"isUnderline": false\n},';
  $data += namelist;
  $data += strnewline;
  $data +=
    '\n{\n"type": "TEXT",\n"text":"EXCURSION",\n"align":"LEFT",\n"fontSize": 25,\n"isBold": true,\n"isUnderline": false\n},';
  $data +=
    '\n{\n"type": "TEXT",\n"text":"' +
    name_exc.toUpperCase().trim() +
    '",\n"align":"LEFT",\n"fontSize": 20,\n"isBold": true,\n"isUnderline": false\n},';
  $data += txtrowright
    .replace(/\@:dt:/g, "Tour Date : ")
    .replace(/\@:dtr:/g, data.pickup.split(" ")[0]);
  if (typeof data.meeting_point !== "undefined") {
    if (data.meeting_point.trim().length != 0) {
      $data += txtrowright
        .replace(/\@:dt:/g, "Pickup : ")
        .replace(/\@:dtr:/g, data.meeting_point);
    }
  }
  $data += txtrowright
    .replace(/\@:dt:/g, "Pickup Time : ")
    .replace(/\@:dtr:/g, data.pickup.split(" ")[1]);
  $data += strnewline;
  $data +=
    '\n{\n"type": "TEXT",\n"text":"HOTEL INFO",\n"align":"LEFT",\n"fontSize": 25,\n"isBold": true,\n"isUnderline": false\n},';
  $data +=
    '\n{\n"type": "TEXT",\n"text":"' +
    data.hotel.toUpperCase().split("/")[0].trim() +
    '",\n"align":"LEFT",\n"fontSize": 20,\n"isBold": true,\n"isUnderline": false\n},';
  $data += txtrowright
    .replace(/\@:dt:/g, "Room Number : ")
    .replace(/\@:dtr:/g, data.hotel_room.toUpperCase());
  $data += strnewline;
  $data += txtrow.replace(/\@:dt:/g, "Note : ");
  $data += txtrow.replace(/\@:dt:/g, data.remark_supplier.toUpperCase());
  $data += strnewline;
  $data +=
    '\n{\n"type": "TEXT",\n"text":"PAYMENT",\n"align":"LEFT",\n"fontSize": 25,\n"isBold": true,\n"isUnderline": false\n},';
  $data += txtrowright
    .replace(/\@:dt:/g, "Price : " + data.currency)
    .replace(/\@:dtr:/g, format_currency(data.salesrate, false));
  if (promosum > 0) {
    $data += txtrowright
      .replace(/\@:dt:/g, "Discount : " + data.currency)
      .replace(/\@:dtr:/g, format_currency(promosum, false));
  }
  if (surcharges.length) {
    $data += txtrow.replace(/\@:dt:/g, "Surcharge : ");
    $data += surcharges;
  }
  $data += txtrowright
    .replace(/\@:dt:/g, "Total : " + payment.split(":")[0])
    .replace(/\@:dtr:/g, format_currency(data.totalsales, false));

  //---- Hide request by SPAN
  //$data += txtrowright.replace(/\@:dt:/g, 'Metode ' + payment.split(':')[0]).replace(/\@:dtr:/g, (payment.split(':')[1] !== undefined ? payment.split(':')[1] : ' '))

  if ($SETTINGS.string.cancellation.length) {
    var cancellation = $SETTINGS.string.cancellation.split("|");
    $data += strnewline;
    $data +=
      '\n{\n"type": "TEXT",\n"text":"CANCELLATION",\n"align":"LEFT",\n"fontSize": 20,\n"isBold": true,\n"isUnderline": false\n},';
    for (var i = 0; i < cancellation.length; i++) {
      $data += txtrow.replace(/\@:dt:/g, cancellation[i]);
    }
  }
  $data += strnewline;
  $data += txtrowright
    .replace(/\@:dt:/g, "Rep. : ")
    .replace(/\@:dtr:/g, data.rep.toUpperCase());
  $data += txtrowright
    .replace(/\@:dt:/g, "Agent : ")
    .replace(/\@:dtr:/g, data.agent.toUpperCase());

  /*
    if (typeof(data.agent_group) !== 'undefined') {
        if(data.agent_group.trim().length!=0) {
            $data   += txtrowright.replace(/\@:dt:/g,'Agent Grp. : ').replace(/\@:dtr:/g,data.agent_group.toUpperCase())
        }
    }
    */
  $data += txtrowright
    .replace(/\@:dt:/g, "Supplier : ")
    .replace(/\@:dtr:/g, data.supplier.toUpperCase());

  $data += strnewline;
  if (typeof data.barcode !== "undefined") {
    $data += tpv_printbarcode(data.barcode);
  }

  //$data   += tpv_printqr('/OI/P1437/I0/AVP003079/E172/N001/B003/J1/F211031/H1000/G50/R1:Y2-B3-F211031-H1000')

  $data += tpv_printfooter();
  $data += ",";
  //$data          += "]\n},"

  callback($data);
}

function tpv_printtext(data, title) {
  try {
    var $companyname =
      '\n{\n"type": "TEXT",\n"text":"' +
      $SETTINGS.company.name +
      '",\n"align":"CENTER",\n"fontSize": 20,\n"isBold": true,\n"isUnderline": false\n},';
    $companyname +=
      '\n{\n"type": "TEXT",\n"text":"' +
      title +
      '",\n"align":"CENTER",\n"fontSize": 35,\n"isBold": true,\n"isUnderline": false\n},';

    var $data =
      '{\n"typeFace":"Sans-Serif",\n"advancePaper": true,\n"letterSpacing": 2,\n"grayLevel": 2,\n\n"rows":[';
    $data += tpv_printlogo() + $companyname;

    $data += strnewline;

    for (var i = 0; i < data.length; i++) {
      switch (data[i]) {
        case "SEPARATOR":
          $data += strline;
          break;
        case "NEWLINE":
          $data += strnewline;
          break;
        default:
          $data += txtrow.replace(/\@:dt:/g, data[i]);
      }
    }

    $data += tpv_printbarcode("00012300010212200001");
    $data += tpv_printqr(
      "/OI/P1437/I0/AVP003079/E172/N001/B003/J1/F211031/H1000/G50/R1:Y2-B3-F211031-H1000"
    );
    $data += strnewline.substring(0, strnewline.length - 1);
    $data += "]\n}";

    printTPV($data, title, function (r) {
      $($tpv_result).filter(function (i, n) {
        var d = $.parseJSON(r);
        if (n.val === d.resultCode) {
          if (d.resultCode < 0) {
            alert(n.text);
          }
        }
      });
    });
  } catch (err) {
    console.log(err);
  }
}

///-------- FUNCTION PRINT TICKET LOROPARQUE

function tpv_printticketLP(idx_mf, product_id, note, callback) {
  var module_prn = "/v1/device/printer";

  $status.set("Print Ticket LP");
  $loader.show();

  var module = get_core_module();
  var serialize = "act=lp-find-ticket";
  serialize += "&idx_mf=" + idx_mf;
  serialize += "&productid=" + product_id;

  $.ajax({
    url: module,
    data: serialize,
    success: function (r) {
      var d = $.parseJSON(r);

      //console.log(d, d.length)
      if (d.length > 0) {
        if (Array.isArray(d)) {
          //----- loop data pertama
          //var data =$buffer_arrResultInsercion

          var $companyname = "";
          var $data = "";
          $data +=
            '{\n"typeFace":"Sans-Serif",\n"advancePaper": true,\n"letterSpacing": 2,\n"grayLevel": 2,\n\n"rows":[';

          $.each(d, function (m) {
            var dtEntradas = d[m];
            console.log(dtEntradas);

            if (dtEntradas.totalbonosentradas > 0) {
              var ss = dtEntradas.ticketbonos;
              var tt = JSON.parse(ss.replace(/\\/g, ""));

              var $i = 0;
              headerticketlp($i);

              $data += strnewline;
              $data +=
                '\n{\n"type": "TEXT",\n"text":"' +
                dtEntradas.nombreproducto +
                '",\n"align":"CENTER",\n"fontSize": 20,\n"isBold": true,\n"isUnderline": false\n},';
              $data +=
                '\n{\n"type": "TEXT",\n"text":"' +
                dtEntradas.descripcionproducto +
                '",\n"align":"CENTER",\n"fontSize": 15,\n"isBold": false,\n"isUnderline": false\n},';
              $data += strnewline;

              for (const mmm in tt) {
                var $mmm = tt[mmm];
                console.log($mmm);
                //$data += txtrowright.replace(/\@:dt:/g, mm.toUpperCase()).replace(/\@:dtr:/g, dtEntradas[mm]);
                //if ($mmm.Barcode !== '') {
                for (const mmmm in $mmm) {
                  if (mmmm === "Barcode") {
                    if ($mmm[mmmm] !== "") {
                      $data += strnewline;
                      $data += tpv_printqr($mmm[mmmm]);
                      //$data += txtrow.replace(/\@:dt:/g, $mmm[mmmm]);
                      $data += strnewline;
                    }
                  } else {
                    $data += txtrowright
                      .replace(/\@:dt:/g, mmmm.toUpperCase())
                      .replace(/\@:dtr:/g, $mmm[mmmm]);
                  }
                }
                // }
              }

              $data += strnewline;
              $data += strnewline;
            } else {
              headerticketlp(m);

              for (const mm in dtEntradas) {
                if (typeof dtEntradas[mm] !== "object") {
                  //if(dtEntradas[m] !==""){
                  if (mm === "barcode") {
                    $data += strnewline;
                    $data += tpv_printqr(dtEntradas[mm]);
                    //$data += txtrow.replace(/\@:dt:/g, dtEntradas[mm])
                  } else if (mm == "note" || mm == "totalbonosentradas") {
                    $data += "";
                  } else {
                    if (dtEntradas[mm].length > 15) {
                      $data += txtrow.replace(/\@:dt:/g, mm.toUpperCase());
                      $data += txtrow.replace(/\@:dt:/g, dtEntradas[mm]);
                    } else {
                      $data += txtrowright
                        .replace(/\@:dt:/g, mm.toUpperCase())
                        .replace(/\@:dtr:/g, dtEntradas[mm]);
                    }
                  }
                }
              }
            }
          });

          $data += strnewline.substring(0, strnewline.length - 1);
          $data += "]\n},";

          postITOS(
            module_prn,
            $data.substring(0, $data.length - 1),
            function (e) {
              $($tpv_result).filter(function (i, n) {
                var d = $.parseJSON(e);
                if (n.val === d.resultCode) {
                  if (d.resultCode < 0) {
                    alert(n.text);
                  }
                }
              });
              $loader.hide();
              callback(d.length);
            }
          );

          function headerticketlp(m) {
            console.log(m);
            if (m == 0) {
              $companyname =
                '\n{\n"type": "TEXT",\n"text":"' +
                $SETTINGS.company.name +
                '",\n"align":"CENTER",\n"fontSize": 20,\n"isBold": true,\n"isUnderline": false\n},';
              $companyname +=
                '\n{\n"type": "TEXT",\n"text":"' +
                $SETTINGS.print_header +
                '",\n"align":"CENTER",\n"fontSize": 30,\n"isBold": true,\n"isUnderline": false\n},';
            }
            $data += strnewline;
            $data += strnewline;
            $data +=
              '\n{\n"type": "TEXT",\n"text":"--------------------------------------------------------------------",\n"align":"LEFT",\n"fontSize": ' +
              $def_print.fontsize +
              ',\n"isBold": true,\n"isUnderline": false\n},';
            $data += strnewline;
            $data += strnewline;

            $data += tpv_printlogo() + $companyname;
            $data += strnewline;
          }
        }
      } else {
        $loader.hide();
        //$app.alert($STRING.info_data_not_found, $STRING.info_important, function() {
        callback(d.length);
        //});
      }
    },
  });
}

function tpv_print_ticketARR(dtEntradas, callback) {}

function printTPV(data, title, callback) {
  try {
    var module = "/v1/device/printer";
    var $data = data;

    postITOS(module, $data, function (e) {
      callback(e);
    });
  } catch (err) {
    console.log(err);
  }
}

function tpv_printlogo(callback) {
  // https://www.base64-image.de/

  var img =
    "/9j/4AAQSkZJRgABAQEBLAEsAAD/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAEAAAAAAAD/7QAsUGhvdG9zaG9wIDMuMAA4QklNA+0AAAAAABABLAAAAAEAAQEsAAAAAQAB/+F5/Wh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4NCjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4NCgk8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPg0KCQk8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iPg0KCQkJPGRjOmZvcm1hdD5pbWFnZS9qcGVnPC9kYzpmb3JtYXQ+DQoJCQk8ZGM6dGl0bGU+DQoJCQkJPHJkZjpBbHQ+DQoJCQkJCTxyZGY6bGkgeG1sOmxhbmc9IngtZGVmYXVsdCI+RHJ1Y2s8L3JkZjpsaT4NCgkJCQk8L3JkZjpBbHQ+DQoJCQk8L2RjOnRpdGxlPg0KCQk8L3JkZjpEZXNjcmlwdGlvbj4NCgkJPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBHSW1nPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvZy9pbWcvIj4NCgkJCTx4bXA6TWV0YWRhdGFEYXRlPjIwMTctMDMtMDNUMDk6MjQ6MjIrMDE6MDA8L3htcDpNZXRhZGF0YURhdGU+DQoJCQk8eG1wOk1vZGlmeURhdGU+MjAxNy0wMy0wM1QwODoyNDoyMlo8L3htcDpNb2RpZnlEYXRlPg0KCQkJPHhtcDpDcmVhdGVEYXRlPjIwMTctMDMtMDNUMDk6MjQ6MjIrMDE6MDA8L3htcDpDcmVhdGVEYXRlPg0KCQkJPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBJbGx1c3RyYXRvciBDUzYgKE1hY2ludG9zaCk8L3htcDpDcmVhdG9yVG9vbD4NCgkJCTx4bXA6VGh1bWJuYWlscz4NCgkJCQk8cmRmOkFsdD4NCgkJCQkJPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+DQoJCQkJCQk8eG1wR0ltZzp3aWR0aD4yNTY8L3htcEdJbWc6d2lkdGg+DQoJCQkJCQk8eG1wR0ltZzpoZWlnaHQ+MjI0PC94bXBHSW1nOmhlaWdodD4NCgkJCQkJCTx4bXBHSW1nOmZvcm1hdD5KUEVHPC94bXBHSW1nOmZvcm1hdD4NCgkJCQkJCTx4bXBHSW1nOmltYWdlPi85ai80QUFRU2taSlJnQUJBZ0VCTEFFc0FBRC83UUFzVUdodmRHOXphRzl3SURNdU1BQTRRa2xOQSswQUFBQUFBQkFCTEFBQUFBRUENCkFRRXNBQUFBQVFBQi8rNEFEa0ZrYjJKbEFHVEFBQUFBQWYvYkFJUUFCZ1FFQkFVRUJnVUZCZ2tHQlFZSkN3Z0dCZ2dMREFvS0N3b0sNCkRCQU1EQXdNREF3UURBNFBFQThPREJNVEZCUVRFeHdiR3hzY0h4OGZIeDhmSHg4Zkh3RUhCd2NOREEwWUVCQVlHaFVSRlJvZkh4OGYNCkh4OGZIeDhmSHg4Zkh4OGZIeDhmSHg4Zkh4OGZIeDhmSHg4Zkh4OGZIeDhmSHg4Zkh4OGZIeDhmSHg4Zi84QUFFUWdBNEFFQUF3RVINCkFBSVJBUU1SQWYvRUFhSUFBQUFIQVFFQkFRRUFBQUFBQUFBQUFBUUZBd0lHQVFBSENBa0tDd0VBQWdJREFRRUJBUUVBQUFBQUFBQUENCkFRQUNBd1FGQmdjSUNRb0xFQUFDQVFNREFnUUNCZ2NEQkFJR0FuTUJBZ01SQkFBRklSSXhRVkVHRTJFaWNZRVVNcEdoQnhXeFFpUEINClV0SGhNeFppOENSeWd2RWxRelJUa3FLeVkzUENOVVFuazZPek5oZFVaSFREMHVJSUpvTUpDaGdaaEpSRlJxUzBWdE5WS0JyeTQvUEUNCjFPVDBaWFdGbGFXMXhkWGw5V1oyaHBhbXRzYlc1dlkzUjFkbmQ0ZVhwN2ZIMStmM09FaFlhSGlJbUtpNHlOam8rQ2s1U1ZscGVZbVoNCnFibkoyZW41S2pwS1dtcDZpcHFxdXNyYTZ2b1JBQUlDQVFJREJRVUVCUVlFQ0FNRGJRRUFBaEVEQkNFU01VRUZVUk5oSWdaeGdaRXkNCm9iSHdGTUhSNFNOQ0ZWSmljdkV6SkRSRGdoYVNVeVdpWTdMQ0IzUFNOZUpFZ3hkVWt3Z0pDaGdaSmpaRkdpZGtkRlUzOHFPend5Z3ANCjArUHpoSlNrdE1UVTVQUmxkWVdWcGJYRjFlWDFSbFptZG9hV3ByYkcxdWIyUjFkbmQ0ZVhwN2ZIMStmM09FaFlhSGlJbUtpNHlOam8NCitEbEpXV2w1aVptcHVjblo2ZmtxT2twYWFucUttcXE2eXRycSt2L2FBQXdEQVFBQ0VRTVJBRDhBOVU0cTdGWFlxN0ZYWXE3RlhZcTcNCkZYWXE3RlZzc3NVVWJTeXVzY2FBczdzUUZWUnVTU2Vnd0UwbU1TVFE1dkpQT1A4QXprWjVjMHVXUzAwRzNPc1hLZkNibmw2ZHFEN04NClF0SjlBQTk4eHA2bithOWQyZDdJWnNvRXN4OE9QZHpsK3o4YlBLOVkvUHY4eWRSWStsZlI2ZEVmOTFXY1NyL3c4bnFTZjhObEVzMGoNCjFlcjAvc3Jvc2ZPSm1mNlIvVlEreGl0NTUwODRYckUzZXQzODllejNNcFg2RjVVSFhLeWI1dTJ4OW02YUgwNDREL05DVXpYRnhPd2ENCmVWNVdBb0M3RmlCOU9BQ25LakNNZVFwVHdzbHlPOGJoMFlxNm1xc3BvUWZZakFwQUlvcGphK1p2TWxvUWJUVnJ5M0k2R0s0bFR2WDkNCmxoaU51VGpUMFdDZjFRZ2ZmRU1qMG44NS93QXlkTVpQVDFxVzVqWFl4M1lXNERBZUxTQXY5elpZTWtoMWRibjluTkZsNTR4SCtydDkNCjIzMlBSL0szL09UUWFSSVBNK21oRk5BMTdZMW9QZG9YSlB6by93QkdYUjFKNmg1dlhleGRDOEUvaEw5WS9WOFh0T2lhN3BHdWFmSHENCk9rM1VkNVp5L1psak5hSHVyQTdxdzdxUlhNcU14SVdIaXRUcGNtQ1poa2lZeUNQeVRqdXhWMkt1eFYyS3V4VjJLdXhWMkt1eFYyS3UNCnhWMkt1eFYyS3V4VjJLdXhWMkt1eFYyS3Ztbjg5L3pPdTlWMWVmeXpwazdSNlJZT1k3MWtOUHJFNi9hREVkVWpPMU81MzhNd00yVGkNCk5kSDB6Mlg3RmppeGpQa0Y1SmN2NkkvV2Z1K0x5REtYc0hZcTdGWFlxN0ZYWXE3RlhZcTdGV1UvbDc1KzFYeWJya2Q3YXUwbGpJUXQNCi9aVitDV1B2c2RnNi9zdC9DdVNoTXhOaDFmYTNaV1BXWWpHWDFmd3k3aitydmZZZW02alo2bHA5dHFGbElKYlM3aldhQ1FkMGNWR2INCktNZ1JZZkhNMkdXS1poSVZLSm9vbkMxT3hWMkt1eFYyS3V4VjJLdXhWMkt1eFYyS3V4VjJLdXhWMkt1eFYyS3V4VjJLcE41eTFwdEUNCjhxYXRxeUVDV3p0WlpJYTlQVkNrUmcvTnlNcnl5cUpMbTluYWJ4OVJESDBsSVg3dXYyUGlWM1oyTHVTenNTV1ltcEpQVWs1clgyOEMNCnRndHdxOTA4ci84QU9ORDNXbHczZXZhbTlwZFRvSE5sYnhxVEZ5RmVMdXgzWWR3RjJQYzVrUjB4SXU2ZUYxM3RtSVpESERBU2lPcFANClAzQkYzbi9PTGx1ZDdMekM2ZjVNMXNIL0FPR1dSUDFZZnlwNzJuSDdieS9peGZLWDdFbnVmK2NZZk02Zy9WZFhzcFRUYjFSTEh2WC8NCkFDVmt5UDVhZmwrUGc1a1BiYkFmcWhNZTZqK3BDZjhBUXN2bnovbHYwdjhBNUczSC9aUGgvTFM4bTcvUnBwUDV1VDVSL3dDS1ZyZi8NCkFKeGo4NHNUOVoxUFRveHRReHRQSWFkK3NVZUE2YVhrd243YTZiK0dFei9wUitrcHRaLzg0dHlrZzNubUpWSGRJYlVtdit5YVVmOEENCkVja05NZTl3OG50dVA0Y1h6bCt4SFhYL0FEaTlwUnRtRnJyczYzTlBoYVdGR2pKOTFVcWQvbmorVlBlMHc5dDhuRjZzY2VIeUp0NFoNCjVqOHY2ajVlMXU3MGJVVkMzZG0vQitKcXJBZ01ycWR2aFpTQ014aUNEUmU2MGVyaHFNVWNzUHBrbG1Ma3ZwLy9BSnh3MXlTKzhqemENCmZLM0o5THVuampGYWtReWdTTC93NWZNelRTMklmTC9iRFRESHFoTWZ4eHY0amI3cWVyWmt2SnV4VjJLdXhWMkt1eFYyS3V4VjJLdXgNClYyS3V4VjJLdXhWMkt1eFYyS3V4VjJLc0EvUGVkNHZ5dTFjSVNESWJaQ1FhYkc1akorOENtVWFnK2w2RDJYaURyNGVYRi91UytTY3cNClgxeFB2SWRpbC81MjBHMGNCbzViKzJFcW51Z2xVdVArQkJ4QUJJQmNEdFhMNGVseVNITVFsOXo3WHphdmlUc1ZkaXJzVmRpcnNWZGkNCnI1bS81eVhzVWg4NzJWMGxCOWFzRTUrSmVPV1JhLzhBQThSbUJxQjYzMDcyTXlrNldVZjVzejlvRHlQS1hybnZIL09MY3ordDVqaHINCis3SzJqMDhDRE1Odm5YTW5USGN2QiszRVJXSS8xdjhBZXZmY3pIejkyS3V4VjJLdXhWMkt1eFYyS3V4VjJLdXhWMkt1eFYyS3V4VjINCkt1eFYyS3V4VmcvNTBhVHFlcmZsNXFGanB0dEpkM2trbHVZNElsTE9Rc3lNMUFQQURLTlFDWXU5OW5OUkRGckl6bVJHSUV0ejdpK2ENCi93RGxWMzVpZjlTOWZmOEFJbHN3dUU5eCtSZlMvd0NYTkgvcXNQbXlMOHZQeTg4ODJIbm5RN3k4ME84Z3RZTHlKNXBuaVlLcWh0eVQNCjRZWXhOalk4eDBkYjJ2MnZwY21seVJqa2laR0pvVytxczJiNVM3RlhZcTdGWFlxN0ZYWXE4Ti81eUc4bytaTmMxZlNKdEgweWUrV0cNCjNrU1o0SXkvRWx3VkJJekMxRVR4Y3VqM1hzbDJoZ3dZNWpMTVJ1UXF6NVBKZitWWGZtSi8xTDE5L3dBaVd5amhQY2ZrWHJ2NWMwZisNCnF3K2IySC9uSGJ5cDVrMEs2MXh0WTAyZXdXNGp0eENaMEtjeWhrNVVyNGNobVJwZ2JPengzdGRyOEdlT1B3cGlkR1YxOEh0ZVpqeEQNCnNWZGlyc1ZkaXJzVmRpcnNWZGlyc1ZRMHVwNmJFQVpidUdNSG9Xa1Fmck9RT1NJNmh0R0NaNVJQeVVKZk1YbCtJQXk2bmFSZzlDMDgNCmExKzlzSGl3N3g4MmNkSm1QS0V2a1VKTjU1OGt3dndtOHdhYkcvWGk5NUFwcDhpK0VaSW5xRzZQWm1xa0xHTElmODJYNmxuL0FDc0QNCnlILzFNbWwvOUp0di93QTE0K0pIdkRMK1NkWC9BS2xrL3dCSkw5U0x0UE0vbHE4NC9WTldzcmpsOW4wcmlKNjcwMjRzZStQaXg3dzANCjVORm5oOVVKajN4S1pnZ2dFR29PNEl5Yml1eFYyS3V4VjJLdXhWVGU2dGtZcTh5S3c2cXpBSDhjQmtCMVpDRWp5QzM2N1ovNy9qLzQNCk5mNjRPTWQ2ZkRsM0YzMTJ6LzMvQUIvOEd2OEFYSGpIZXZoeTdpNzY3Wi83L2ovNE5mNjQ4WTcxOE9YY1hmWGJQL2Y4Zi9Cci9YSGoNCkhldmh5N2k3NjdaLzcvai9BT0RYK3VQR085ZkRsM0YzMTJ6L0FOL3gvd0RCci9YSGpIZXZoeTdpNzY3Wi93Qy80LzhBZzEvcmp4anYNClh3NWR4ZDlkcy84QWY4Zi9BQWEvMXg0eDNyNGN1NHEyU1lLTXQ3WlJjdlZ1STQrUDJ1VHF0UG5VNUV6QTZzNDRwSGtDaDMxN1FrVXMNCitvMnFxT3JHYU1BZjhOa2ZGaDNoc0dseW5sR1h5S0ZtODUrVDRGRHphN3A4U0UwRFBkUUtLK0ZTK0l5d1BVTnNlenRUTFlZNW4vTmwNCitwUi81V0I1RC82bVRTLytrMjMvQU9hOFBpUjd3MmZ5VHEvOVN5ZjZTWDZuZjhyQThoLzlUSnBmL1NiYi93RE5lUGlSN3d2OGs2di8NCkFGTEovcEpmcVI5dHIrZzNUY2JYVXJXZHZDS2FOejQvc3NjUmxpZVJEanowdVdQMVFrUGVDajhtNDdzVmRpcnNWZGlyNEt6VlB2anMNClZkaXJzVmRpcVk2WDVpMS9TWEQ2WnFWelpGVFVlaE04WTYxM0NrQTRqYmNPUG4wZUhML2VRakwzZ0Y2RjViLzV5Sjg4YVl5UjZtSWQNClp0aDFFb0VNMVBhV01VK2xrYkxZNTVEemVkMW5zanBjdStPOGN2TGNmSS9vSWUyK1IvemI4bytidU52YVRHMDFNaXAwNjVvc2g4ZlQNCllmRElOdXhyNGdabFk4NGx0eUx4SGFmWUdvMG04aHhRL25EbDhlNW11WE9rZGlyc1ZmSkg1N2YrVFYxei9vMS82ZzRjMStmNnkrdSsNCnkvOEFpR1AvQUR2OTNKZ09WTy9kaXJzVmRpcnNWZGlyc1ZkaXI3MXphdmdiNDYvTjcveVpXdjhBL01UL0FNYUxtcm45Ujk1ZlpQWi8NCi9FY1g5WDlMRDhEdUhZcTdGWFlxN0ZVNDBmemY1cDBabGJTOVd1clFKMGpqbGNSK0ZESFhnUjh4aURYSnhOUjJmcDgzOTVDTXZodjgNCitiMDd5bC96a25yMW02UWVaYlZOU3R1alhVQVdLNEh2eEZJbitWRitlWHcxRWh6M2VYMS9zYmluWndIZ2wzSGVQNng5cjNyeTM1bzANCkx6SnBxYWpvMTB0emJ0czlOblJ2NUpFTzZ0ODh5NFpCSWJQQTZ6UTVkTlBneXg0VDkvdVRYSnVJN0ZYd1ZtcWZmSFlxN0ZYWXE3RlgNCllxN0ZWMGNra2NpeVJzVWtRaGtkU1F3WUdvSUk2RVlFRUFpanlmUW41Ti9uWkxxRTBIbHZ6UE1EZVBTUFQ5U2JiMVQyaW1QOC93REsNCjM3WFEvRjF5c09ib1h6MzJpOW1oakJ6NEI2ZjRvOTNtUEx2SFQzY3UzNW1QRE94VjhrZm50LzVOWFhQK2pYL3FEaHpYNS9yTDY3N0wNCi93Q0lZLzhBTy8zY21BNVU3OTJLdXhWMkt1eFYyS3V4VjJLdnZYTnErQnZqcjgzdi9KbGEvd0Q4eFA4QXhvdWF1ZjFIM2w5azluLzgNClJ4ZjFmMHNQd080ZGlyc1ZkaXJzVmRpcnNWVC9BTWxlZE5ZOG82M0ZxZW11YUFoYnExSnBIUEZYZEg2L1FleHd4a1ltdzRIYVhadVANClY0amptUGNlb1BmK09iN0Y4dTYvcC9tRFJMVFdOUGZuYVhrWWRLMHFwNk1qVS9hVmdWUHZteWhQaUZ2amVyMHM5UGxsam45VVQrUG0NCm1PU2NaOEZacW4zeDJLc3QvSzd5bHAzbXZ6aGJhTHFNazBWck5ISzdQYnNxeVZqUXNLRjFrSFVlR1N4eHVRRHFlMjlmUFNhWTVZQUcNClFJNTh0ejVFUGJQK2haZklmL0xmcW4vSTIzLzdKOHkveTBmTjRqL1JwcS81dVA1Uy93Q0tRT29mODR3YUE4YmZvN1dycUNUOWszQ1INCnpqNUhoNk9RT2w3aTM0dmJiTUQ2OGNTUElrZmZielR6bCtTWG5YeXpISmRDRmRUMDFLbHJxMHF4UlIza2lJNXI3a1ZBOGNvbmlsSG0NCjlOMmQ3UzZYVWtSdmduM1MvUWVYM0Y1L2tIb0hZcTJyTXJCbEpWbE5RUnNRUmdVaTMxbitTdm41dk5ubFlSM3NuUFdOTUt3WHBQV1INClNQM1UzK3lBSVA4QWxBNW40TWxpanpENUo3U2RsZmxNOXhIN3VlNDh1OGZEN25vT1h2UFBrajg5di9KcTY1LzBhLzhBVUhEbXZ6L1cNClgxMzJYL3hESC9uZjd1VEFjcWQrN0ZYdW5sMy9BSnh4MDdWL0wrbWFxK3R6UlBxRnBCZE5FSUZZSVpvMWtLZzh4V25LbVpFZE1TTHYNCjdQMnZDYXoyd25oelR4akdEd1NNZWZjYTdreC82RmQwei9xL3ovOEFTT24vQURYaC9LbnYrejlyai82TjhuK3BEL1Rmc2QvMEs3cG4NCi9WL24vd0NrZFA4QW12SDhxZS83UDJyL0FLTjhuK3BEL1Rmc2QvMEs3cG4vQUZmNS93RHBIVC9tdkg4cWUvN1Ayci9vM3lmNmtQOEENClRmc2Qvd0JDdTZaLzFmNS8ra2RQK2E4ZnlwNy9BTFAyci9vM3lmNmtQOU4reDMvUXJ1bWY5WCtmL3BIVC9tdkg4cWUvN1Ayci9vM3kNCmY2a1A5Tit4N2htWThNOGw4MS84NCtXSG1IekZmYTFKck10dTk5SjZqUXJDckJkZ0tBbHhYcG1KTFRFa20vcy9hOWRvUGF5ZW53eHgNCkRHRHdqbmY3RXAvNkZkMHovcS96L3dEU09uL05lRDhxZS83UDJ1WC9BS044bitwRC9UZnNkLzBLN3BuL0FGZjUvd0RwSFQvbXZIOHENCmUvN1Ayci9vM3lmNmtQOEFUZnNkL3dCQ3U2Wi8xZjUvK2tkUCthOGZ5cDcvQUxQMnIvbzN5ZjZrUDlOK3haTC9BTTR1V0pRaUx6REsNCmo5bWUxVmg5d2xYOWVJMHA3L3MvYW1QdHZPOThRLzAzN0dNYS93RDg0M2VjYkNGcHRMdWJmVmxRRW1GYXdUR244cXZWRC93ZVFsZ2sNClBOMm1rOXNkTmtOWkJMSDlvK3pmN0hsVjVaM2RsZFMybDVDOXZjd3NVbGhsVW82c094VTdqS0hxOGVTTTRpVVRjVDFDamhadXhWNzkNCi93QTR4ZVkzZVBWdkxrcjFFZkcrdEZKNkFrUnpVOXE4UHZ6SjAwdHlIei8yMTBZQmhtSFgwbjd4K2w3dm1ZOEcrQ3MxVDc0N0ZYcEgNCi9PUDMva3piSC9qQmMvOEFKcHNuaCtzZmpvWG0vYXovQUJHWHZqOTc2dHpaUGs3c1ZkaXJ3RDgrUHltdGJTQ1h6Ym9NQWlpRFYxYXoNCmpGRkhJMEU2S09tLzJ4OVBqbUZueGNPNDVQb1BzdjI5S1pHbnltei9BQW4vQUhwL1I4dTU0VG1POTI3RldmZmtqNW5mUXZ6QXNGWisNCk5wcVorbzNLMTJQcW1rUjhOcGVPL2hYSjRwVklGMEh0TG9objBjdHZWRDFENGMvc3Q5YjVzbnlKOGtmbnQvNU5YWFAralgvcURoelgNCjUvckw2NzdML3dDSVkvOEFPLzNjbUE1VTc5Mkt2dGY4di84QWxBL0xmL2JMc3Y4QXFIVE5saitrZTU4VDdXL3h2TC93eWY4QXVpbjINClRkZTdGWFlxN0ZYWXE3RlhZcXhuekwrWlBrbnkyelI2cnFzVWR5dlcxanJOTjlLUmhpdit5cGxVczBZdXowWFkycTFPK09CTWU4N0QNCjVsZzk3L3prejVNaWRsdGRQdjdrRG81V0tOVDhxeUZ2dkdWSFZEb0hlNC9ZdlVrZXFVSS9NL29lczJkeXQxYVFYS2dxczhheUJUMUENCmRRMVB4eklqS3dDOGxraHd5TWU0cXVTWU94VjVCL3prVDVKczcveTJmTTF2RUUxTFRDaTNFaWplVzNkZ2xHOFNqTUNEMkZjeGRURGINCmlldzlrZTBwWTgvZ0UraWZMeWx6KzM5VDVwekVmVEhZcTlLLzV4N3ZQUS9NdTBpclQ2M2IzRU5QR2tabHAveVN5ekQ5WS9IUjVyMnQNCng4V2hrZjVzb243YS9TK3E4Mkw1UStDczFUNzQ3RlhwSC9PUDMva3piSC9qQmMvOG1teWVINngrT2hlYjlyUDhSbDc0L2UrcmMyVDUNCk83RlhZcXBYbHBiM2xwTmFYS0NXM3VJMmltamJjTWpncXdQekJ3RVdLWjQ4aGhJU2pzUWJENGs4MDZITG9QbVBVZEhsSkxXTnc4S3UNCmVySXArQi85a3REbXJJbzArMzZIVkRQaGhsSDhVUWYxcFZpNVMrR2FXR1pKb21LU3hNSGpjZFF5bW9QMzRFU2lKQWc4aSs1dEcxQk4NClMwaXgxR1A3RjdieFhDMDhKVURqL2lXYlNCc0F2aFdvd25Ia2xBL3d5SStScDhxZm50LzVOWFhQK2pYL0FLZzRjd2MvMWw5WDlsLzgNClF4LzUzKzdrd0hLbmZ1eFY5ci9sL3dEOG9INWIvd0MyWFpmOVE2WnNzZjBqM1BpZmEzK041ZjhBaGsvOTBVK3licjNZcTdGWFlxN0YNClhZcThDL08zODR0V3Q5VHVmSzJnTzlrTGI5M3FOOHZ3eXV6S0Q2Y1JHNktBZDI2azlLRHJoWnN4Sm9Qb0hzMTdQWTVRR296ZXEvcGoNCjA5NTcvZHkvUndobVptTE1Tek1ha25ja25NWjd3Q21zS3Z1alEvOEFqaTZmL3dBdzBQOEF5YkdiSEY5STl6NFZxZjcyWDlZL2VqY3MNCmFIWXF4SDgzSlk0dnkyOHdOSXdWVGFsQVQvTTdLcWo2V0lHVTZqNkQrT3J1T3dJazYzRlg4NThjWmdQc2pzVmVqZjhBT1A4QWFHZjgNCnpyQ1VWLzBXRzVtTlBlRm90LzhBa1psbUg2eCtPanpudFhrNGRESWZ6akVmYmY2SDFmbXhmSm53Vm1xZmZIWXE5SS81eCsvOG1iWS8NCjhZTG4vazAyVHcvV1B4MEx6ZnRaL2lNdmZINzMxYm15ZkozWXE3RlhZcStWL3dEbklmVDF0UHpJbW1WZVAxNjFndUQ3a0F3MS93Q1MNCk9hL09LbVgxYjJSeThlaUEvbXlrUDAvcGVaWlU5TTdGWDJSK1UxeTF4K1cvbCtSdXEyaXg3K0VSTVkvQmN6OU9iZ1B4MWZHdTNvY08NCnR5aitsOSs3NTEvUGIveWF1dWY5R3Y4QTFCdzVpNS9yTDZON0wvNGhqL3p2OTNKZ09WTy9kaXJOdFA4QXpuL01yVDdDMnNMUFdQU3QNCkxPSklMZUw2dGF0eGppVUlpOG1pTEdpanFUbGd6U0hWMG1YMmMwT1NabkxIY3BFaytxWE0vd0NjaVA4QWxlMzVxLzhBVjgvNmRiUC8NCkFLbzRmSG4zdGY4QW9YMEgrcC83S2Y4QXhUditWN2Ztci8xZlArbld6LzZvNCtQUHZYL1F2b1A5VC8yVS93RGluZjhBSzl2elYvNnYNCm4vVHJaLzhBVkhIeDU5Ni82RjlCL3FmK3luL3hUdjhBbGUzNXEvOEFWOC82ZGJQL0FLbzQrUFB2WC9Rdm9QOEFVLzhBWlQvNHA5TGYNCmw5cXQvcTNrclI5UzFDWDE3MjZ0bGtubDRxbkpqV3A0b0ZVZlFNeThNaVkyWHpQdGJCREZxc2tJQ294bHN5SExYWFBqcjgzdi9KbGENCi93RDh4UDhBeG91YXVmMUgzbDlrOW4vOFJ4ZjFmMHNQd080ZGlyN28wUDhBNDR1bi93RE1ORC95YkdiSEY5STl6NFZxZjcyWDlZL2UNCmpjc2FIWXE4QS81eUQvTXF3dmJkUEtla1RyY0tKQkxxbHhHUXlBeG40SUFSMUliNG04S0FlTk1MUGxFdGcrZyt5ZlkwNFMvTVpCVzENClJIdi9BSXYwRDR2Q2N4M3UzWXE5NS81eGo4dHllcHF2bVNWS1I4Ulkyakh1U1JKTVI4cUlQdnpJMDBkeVhndmJYV0NvWUIvV1AzRDkNCkwzek0xNEI4RlpxbjN4Mkt2U1ArY2Z2L0FDWnRqL3hndWY4QWswMlR3L1dQeDBMemZ0Wi9pTXZmSDczMWJteWZKM1lxN0ZYWXErYXYNCitjbTBqSG5YVFhEMWtiVFVWazhBSjVpRDlOVDkyWU9wK3I0UHBuc1VUK1ZtUDlzLzNzWGorVVBZT3hWOWNma1Qvd0NTcTBQL0FLT3YNCitveWJOaGcrZ1BrWHRSL2orVC9OL3dCeEY0TCtlMy9rMWRjLzZOZitvT0hNVFA4QVdYdnZaZjhBeERIL0FKMys3a3dIS25mdXhWMksNCnV4VjJLdXhWMkt2c244cVAvSmNlWC84QW1EVCtPWituK2dmanErTTl1LzQ3bC9yRmxtWE9wZkhYNXZmK1RLMS8vbUovNDBYTlhQNmoNCjd5K3llei8rSTR2NnY2V0g0SGNPeFY2WGJmOEFPUWY1aDI5dkZieHZhZW5DaXhwV0NwNHFLRDlyMnlZeXpBcTNtWit5ZWprU1R4V2YNCk5lMy9BRGtUK1pCVWdTMmlraWdZVzRxUGZja1lmR24zL2NnZXlHaTdwZjZaanV2L0FKcStmOWVoZTMxRFdKdnF6MUQyOEFXM1FxZjINCldFUVRrUDhBV3JrWlRsTG1YWTZYc0xSNERjTVk0dTg3L2ZmMk1UeUx0bllxbm5rN3locS9tdlc0ZEoweU9ydWVVODVCOU9HSUg0cEgNCkk3RDhUdGhqRWswSEI3UjdReDZURWNrejdoMUo3Zyt4dkxQbDdUL0x1aDJtamFldkcydEU0QmpUazdIZDNhbjdUTVNUbXhoQVJGUGoNCmV0MWM5UmxsbG45VXZ4WHdUUEp1SytDczFUNzQ3RlhwSC9PUDMva3piSC9qQmMvOG1teWVINngrT2hlYjlyUDhSbDc0L2UrcmMyVDUNCk83RlhZcTdGWHkvL0FNNUpYU1RmbUZGR3BCTnRwOE1UMDdFeVN5Yi9BRVNETURVU3VYdWZVZlk2SERveWY1MHlmc0EvUThxeWw2dDINCkt2c0w4bXJZVy81WmFER0Y0OG9Ya3BXdjk3SzhsZnA1VnpQMC93QkErUDN2anZ0RlBpMTJRK2RmSUFQbnY4OXYvSnE2NS8wYS93RFUNCkhEbUxuK3N2b2Zzdi9pR1AvTy8zY21BNVU3OTJLdllORC81eHkxZlZ0RTAvVlk5WnQ0azFDMmh1a2lhSnlWRTBZa0NrZzl1V1hEVHkNCkl2WjQvVmUyR1BEbGxqT09SNEpHUE1kRFNPLzZGZTFyL3ErMjMvSW1UK3VIOHRMeWFQOEFSdmkvMU9YekR2OEFvVjdXdityN2JmOEENCkltVCt1UDVhWGt2K2pmRi9xY3ZtSGY4QVFyMnRmOVgyMi81RXlmMXgvTFM4bC8wYjR2OEFVNWZNTy82RmUxci9BS3Z0dC95SmsvcmoNCitXbDVML28zeGY2bkw1aDdmNVAwS1hRZkxHbTZOTEtzOGxqQ3NMU3FDRllyM0FPWldLSERHaThOMmhxaG56enlnVUpHMDR5eHczeDENCitiMy9BSk1yWC84QW1KLzQwWE5YUDZqN3kreWV6LzhBaU9MK3IrbGgrQjNEc1ZkaXJzVmRpcnNWWjkrV0g1VDMzbmg1YmdYc1ZucGwNCnBJSTdwL3R6a2tjZ0VqMjZqOXBqVDUwcGs4ZU16T3pvTzIrM29hRUNQQ1pUa051NzRuOUgzUHAzeW41TzBEeXBwYTZkbzl1SVk5bW0NCmxiNHBaWC9ua2Z1ZndIYW1aOE1ZaU5ueS9YOW9adFZrNDhwczlPNGU1T3NtNFRzVmZCV2FwOThkaXIwai9uSDcvd0FtYlkvOFlMbi8NCkFKTk5rOFAxajhkQzgzN1dmNGpMM3grOTlXNXNueWQyS3V4VjJLdmpIOHk5ZmoxL3oxckdweE56dDVKekhic0RVR0tFQ0pHSCtzcVYNCnpWemxaSmZhZXhkS2RQcE1jRHpBMzk1M1Azc1l3T3pkaXI3ZzhwNmEybCtWdEkwNWhSN1N6Z2hldjh5UnFHL0hObGlGUkQ0ZHI4M2kNCjU1ei9BSjA1SDdYeTcrZTMvazFkYy82TmYrb09ITUxQOVpmVXZaZi9BQkRIL25mN3VUQWNxZCs3RlgyditYLy9BQ2dmbHY4QTdaZGwNCi93QlE2WnNzZjBqM1BpZmEzK041ZitHVC93QjBVK3licjNZcTdGWFlxN0ZYWXErT3Z6ZS84bVZyL3dEekUvOEFHaTVxNS9VZmVYMlQNCjJmOEE4UnhmMWYwc1B3TzRkaXI2WHNmK2NkZklWMXBGdEswMStrODhFYnRLc3liTXlnazBNWkhYTXFHbkJBTmw4enkrMStyaGtJcUYNCkFub2YxdkwvQU15ZnlWMXZ5aEUybzJzdjZTMFN0SHVGWGpKQ1NkdlZRVjI3Y3h0NDAyeW5KaU1QYzlSMk43U1l0WWVDUTRNdmQwUHUNClA2UHZlY1pXOUk3RldZL2xaNThtOG0rYUlyMXlXMDI1QWcxS0lWTllpZnRnRDlxTTdqNlIzeVdPZkNiZFAyNTJXTlpnTVI5Y2Q0Ky8NCnU5eGZZRnZjUVhOdkZjVzhpeXdUS3NrVXFHcXNqQ3FzQ094R2JJR3hZZkhad01TWWtVUXFZV0xzVmZIVnQrVVA1bFhCQWowQzVXcHANCis4NFJmOG5HWE5ZSVNQUXZzay9hRFF4NTVZL2FmdVpYb1A4QXpqYjV6dlhSdFd1TGJTb0RUbXZMNnhNUGtzZjdzLzhBSXpMSTZlUjgNCm5VNnIyeDAwQis3RXNoLzBvKzNmN0h0WGtiOHJQS25rNWZWMCtGcDlSWmVNbW8zRkdsSVBVSlFCVUIveVI4NjVrNDhJajczaWUwKzMNCk5Sck5wbW9melJ5L2I4V1laYzZkMkt1eFY1bCtkMzVsVy9sdlFwZElzWmdkZTFLTW9pcWZpZ2hmWjVXOENSc252djJ6RzFHU2h3aDYNCmYyYTdHT3B5akpNZnVvSDVudS9YKzE4cjVodnFyc1ZaUCtXbmw1L01Ibm5TTk9DOG9UT3MxenR0Nk1QN3lTdnpWZVB6T0dNZUlnZDcNCnJPMmRXTlBwWno2OE5EM25ZUHM3Tm8rTFBrajg5djhBeWF1dWY5R3YvVUhEbXZ6L0FGbDlkOWwvOFF4LzUzKzdrd0hLbmZ1eFY5ci8NCkFKZi9BUEtCK1cvKzJYWmY5UTZac3NmMGozUGlmYTMrTjVmK0dULzNSVDdKdXZkaXJzVmRpcnNWZGlyNDYvTjcvd0FtVnIvL0FERS8NCjhhTG1ybjlSOTVmWlBaLy9BQkhGL1YvU3cvQTdoMkt2dWpRLytPTHAvd0R6RFEvOG14bXh4ZlNQYytGYW4rOWwvV1Azb202dHJlNnQNCnBiYTVqV2EzblJvNW9uQVpXUmhSbFlIcUNNbVJZcHFoTXdrSlJORVBrRDgxUElrbms3elZOWlJoanBseVBYMDJRMVA3b25kQ2Y1b3oNCjhKOXFIdm10eVE0VFQ3RDJGMm9OWnB4SS9YSGFYdjcvQUlzTnlMdVhZcTk0L3dDY2ZQek00c25rN1ZwZmhZazZQTzU2RTd0YmtueDYNCnA5SThNeU5Qa284SmVDOXJPeGIvQU1KeGordVA5OSt2NTk3MzNNMTRCMktvTDlPYUwvMWNMYi9rZEgvWEsvRmozaHYvQUMyWCtiTDUNCkYzNmMwWC9xNFczL0FDT2ovcmo0c2U4TCtXeS96WmZJdS9UbWkvOEFWd3R2K1IwZjljZkZqM2hmeTJYK2JMNUZUbTh5ZVhZUUROcWwNCm5HRFduT2VKYTA2OVd4OFdIZVBteWpvODB1VUpIL05LUmFuK2JYNWNhZEd6emE5YXkwL1p0Vytzc2ZrSVErQ1dlSTZ1ZGg3QTF1UTANCk1VaDcvVDk5UE12T1AvT1MzT0o3WHlwWk1qTUN2NlF2QUtqdFdPRlN3K1JjL3dDeHpIbnFTZVd6MUhaM3NaUkV0UkwvQURZL3BQNnYNCm04TjFEVUw3VWIyYSt2cDN1YnU0WXZOUElTek14N2tuTWQ3bkZpamppSVFIREVjZ2g4V3gyS3ZvL3dENXh5OGp2cCtsWEhtaTlqNDMNCk9wTDZOaUc2aTJVMVovOEFubzRIMEtEM3pLMDBQNG56ZjJ3N1RHVElNRVQ2WWJ5L3Jmc0gzdlpzeTNpM3lSK2UzL2sxZGMvNk5mOEENCnFEaHpYNS9yTDY3N0wvNGhqL3p2OTNKZ09WTy9kaXI3RjhpK1p2TGNQa2p5OUROcXRuSExIcGxta2tiM0VTc3JMYm9DckF0VUVITSsNCkdXQWlOdytPZHFhTE1kVmxJaElnNUovd24rY1U4L3hYNVcvNnZGai9BTkpNUC9OV1M4YUhlUG00SDVIUC9xYy85S1hmNHI4cmY5WGkNCngvNlNZZjhBbXJIeG9kNCthL2tjL3dEcWMvOEFTbDMrSy9LMy9WNHNmK2ttSC9tckh4b2Q0K2Eva2MvK3B6LzBwZC9pdnl0LzFlTEgNCi9wSmgvd0Nhc2ZHaDNqNXIrUnovQU9wei93QktYZjRyOHJmOVhpeC82U1lmK2FzZkdoM2o1citSei82blAvU2xOTXNjVjhkZm05LzUNCk1yWC9BUG1KL3dDTkZ6Vnorbys4dnNucy93RDRqaS9xL3BZZmdkdzdGWDNSb2Y4QXh4ZFAvd0NZYUgvazJNMk9MNlI3bndyVS93QjcNCkwrc2Z2UnVXTkRCL3pnOGlqemQ1U2xodDBEYXRZVnVkT05OMllENDRxLzhBRmk3ZjYxUERLTStQaUhtSGUrei9BR3ArVTFBSi91NWINClMvWDhQdXQ4aHNyS3hWZ1ZaVFFnN0VFWmdQcjROdFlWWHhTeXd5cExFN1J5eHNHamtVbFdWbE5RUVJ1Q0RnUktJSW83Z3ZxLzhuZnoNCk5pODRhTDlWdlhDNi9ZSUZ1MDJIcklOaE9vOS8ycWREN0VabllNdkVLUE44bTlvZXhUbzh2RkgrNm55OHY2UDZ2SjZIbVE4NitDczENClQ3NDdGWFlxN0ZYWXE3RlhZcTdGWHBINVJmbFBlZWJ0UWoxRFVJM2g4dVc3VmxsTlZOd3luKzZqUGhYN2JEcDA2NVppeG1SOG5tKzMNCiszbzZTQmhBM21QK3g4eitnZm9mVmNNTVVNU1F3b3NjVWFoSTQxQUNxcWlnQUE2QUROZ0JUNVJLUmtiTzVLN0NoOGtmbnQvNU5YWFANCitqWC9BS2c0YzErZjZ5K3UreS8rSVkvODcvZHlZRGxUdjNZcTdGWFlxN0ZYWXE3RlhZcSs5YzJyNEcrT3Z6ZS84bVZyL3dEekUvOEENCkdpNXE1L1VmZVgyVDJmOEE4UnhmMWYwc1B3TzRkaXI3bzBQL0FJNHVuLzhBTU5EL0FNbXhteHhmU1BjK0Zhbis5bC9XUDNvM0xHaDINCkt2bW4vbklIOHZEcEdzZjRtMDZLbW02bTUrdUtvMml1alVrK3l5OWY5YXZpTXdNK1BoTjlDK21leWZhL2pZL0FtZlhEbDV4L1o5MVANCklNcGV3ZGlxTjBmV2RVMGJVWWRSMHU1ZTB2WURXS2FNN2p4QkJxQ0QzQjJPSU5OT28wK1BOQXd5RGlpZWoxS0QvbkpuenBIYWlPU3cNCnNKcmhSVDEyU1VBbnhaRmtBKzZtWERVVDhubFpleGVtTXJFcGdkMjM2bmtHVXZZT3hWMkt1eFYyS3V4Vk05RDh0YS9yMXo5WDBld24NCnZwYTBiMGtKVmEvenY5bGY5a2NRTDVPTnFkYmh3UjRza2hFZWY0M2UxK1F2K2NjRmplTy84NFNpUXJSbDBtM2FxL0thVWRmOVZQOEENCmdzeWNlbUorcDRudFgyd3NHR21IK2NmMEQ5ZnllNTIxcmJXdHZIYlcwU1FXOEtoSW9ZMUNvcXFLQlZVYkFETXNBRGs4Sk9jcGt5a2INCkpWTUxGMkt2a2o4OXYvSnE2NS8wYS84QVVIRG12ei9XWDEzMlgveERIL25mN3VUQWNxZCs3RlhZcTdGWFlxN0ZYWXE3Rlgzcm0xZkENCjN4MStiMy9reXRmL0FPWW4valJjMWMvcVB2TDdKN1AvQU9JNHY2djZXSDRIY094VjkwYUgvd0FjWFQvK1lhSC9BSk5qTmppK2tlNTgNCksxUDk3TCtzZnZSdVdORHNWUVd0NkxwMnQ2VGM2VnFVUW1zcnRESE1oOE9vSVBabE82bnNjaktJa0tMZnB0VFBCa0dTQnFVWHlGK1kNCm41ZTZ2NUwxbHJTNkJsc0ppV3NMNEQ0WlVIWStEciswdjhNMTA0R0pvdnNIWkhhK1BXNCtLTzB4OVVlNzluY3hUSXUxZGlyc1ZmU2YNCi9Rc2ZrLzhBNnVtb2ZmQi8xVHpML0tqdmZOZjlHdXAvbVEvMlg2M2Y5Q3grVC84QXE2YWg5OEgvQUZUeC9LanZYL1JycWY1a1A5bCsNCnQzL1FzZmsvL3E2YWg5OEgvVlBIOHFPOWY5R3VwL21RL3dCbCt0My9BRUxINVA4QStycHFIM3dmOVU4ZnlvNzEvd0JHdXAvbVEvMlgNCjYwVGFmODQxZVE0V0RUM1dvWFBpclN4S3ZYL0lpVnYrR3cvbFIzbHF5ZTJlclBJUWo4RCt0a21rL2t6K1d1bU1IaTBTSzRrSFZydG4NCnVBZjloS1dUL2hjbU1FUTYzUDdSNjNMenlFZjFhajkyN01iZTJ0cmFGWUxhSklJVUZFaWpVSW9Ic3EwR1dnQWJCMDA1eWtia2JLcGgNCll1eFYyS3V4VjVqNXovSWpSZk5QbVM4MTI1MU81dDVyejArY01heGxWOUtKSWhRc0s3aEs1alpNSEVidDZqczcyb3k2WEJIRkdFU0kNCjN2djFKUDZVay82Rmc4dS85WG04L3dDQWkvcGtQeXA3L3MvYTV2OEFvMnpmNm5IN1hmOEFRc0hsMy9xODNuL0FSZjB4L0tudit6OXENCi93Q2piTi9xY2Z0ZC93QkN3ZVhmK3J6ZWY4QkYvVEg4cWUvN1Ayci9BS05zMytweCsxMy9BRUxCNWQvNnZONS93RVg5TWZ5cDcvcy8NCmF2OEFvMnpmNm5IN1hmOEFRc0hsMy9xODNuL0FSZjB4L0tudit6OXEvd0NqYk4vcWNmdGQvd0JDd2VYZityemVmOEJGL1RIOHFlLzcNClAyci9BS05zMytweCsxMy9BRUxCNWQvNnZONS93RVg5TWZ5cDcvcy9hdjhBbzJ6ZjZuSDdYZjhBUXNIbDMvcTgzbi9BUmYweC9LbnYNCit6OXEvd0NqYk4vcWNmdGUwNW1QRlBLL05IL09QK2llWWZNRjdyVStxWE1NMTlKNmp4SWtaVlRRQ2dxSzlzeFphYXlUYjFlaDlxOHUNCm53eHhDRVNJanpTci9vV0R5Ny8xZWJ6L0FJQ0wrbVIvS252K3o5cmxmNk5zMytweCsxMy9BRUxCNWQvNnZONS93RVg5TWZ5cDcvcy8NCmF2OEFvMnpmNm5IN1hzbG5iTGEya0ZzcExMQkdzWVk5U0VVTFg4TXlveG9BUEc1SjhVakx2S3JrbURzVmRpcUMxblJOSjFyVDVOUDENClcxanZMT1g3Y01vcUtqb1FlcXNPeEc0eU1vaVFvdCtuMU9URE1UeGt4a09vZU4rWS93RG5HU3dtbWVieS9xcldpTlVpMHUwOVZSN0wNCktwREFmTlNmZk1XV21QUXZaYVAyMW5FVm1oeGVjZHZzL3NZcEwvempUNTlSNkpkNmJJdlpoTk1QdkJoR1FPbms3YVB0bnBDTjQ1QjgNCkIveFNaYVIvempQNW5qdTRaci9WYkdOWXBGY3JDSlpxaFNEKzJrUHZpZExJOXpqYWoyendHSkVJVE5qclEvU1gwVm1lK2N1eFYyS3UNCnhWMkt1eFYyS3V4VjJLdXhWMkt1eFYyS3V4VjJLdXhWMkt1eFYyS3V4VjJLdXhWMkt1eFYyS3V4VjJLdXhWMkt1eFYyS3V4VjJLdXgNClYyS3V4VjJLdXhWMkt1eFYyS3V4VjJLdXhWMkt1eFYyS3V4VjJLdXhWMkt1eFYyS3V4VjJLdXhWMkt1eFYyS3V4VjJLdXhWMkt1eFYNCjRmOEE5RFJhWi8xWUovOEFwSVQvQUpvekQvTkh1KzM5ajNQK2dqSi9xby8wdjdYZjlEUmFaLzFZSi84QXBJVC9BSm94L05IdSszOWkNCi93Q2dqSi9xby8wdjdYZjlEUmFaL3dCV0NmOEE2U0UvNW94L05IdSszOWkvNkNNbitxai9BRXY3WGY4QVEwV21mOVdDZi9wSVQvbWoNCkg4MGU3N2YyTC9vSXlmNnFQOUwrMTdiREo2c0tTVXB6VU5Ud3FLNWxnMkhoNUNpUXZ3b2RpcnNWZGlyc1ZkaXJzVmRpcnNWZGlyc1YNCmVaL25SK1p1dmVSLzBQOEFvbUMxbi9TSDFuMXZyU1NQVDBQUzQ4ZlRraS8zNmExcmxHYklZMVQwL3M1MkxpMTNpZUlaRGc0YTRhNjgNClhlRDNKbitUL25yVnZPZmxxNTFUVkliZUc0aHZYdFZXMVYwVGdrVVRna084aHJXUTk4bGhtWkN5NHZ0RDJYajBXY1k4WmtRWUE3MTMNCmtkQU81bk9XdWlkaXJzVmRpcWxkWFZ0YVcwdDFkU3JEYlFJMGswMGhDb2lLS3N6RTlBQmdKcG5DRXB5RVlpNUhrRXMwbnpqNVYxaTYNCk5wcFdyV2w5Y2hUSVlZSlVrZmdDQVdvcE8yNHlNY2tUc0M1T2ZzN1VZWThXU0VveDd5S1RqSnVHa25uYlhMdlF2S2VxYXhhSkhKYzINCk1EU3hKS0NZeXcvbUNsVFQ1SEs4c3pHTmh6dXpkTkhQcUlZNVh3eWxXM041bCtWUDUwZWFmTjNteGRIMUsxc1liWXdTeWw3YU9aWk8NClNVcHU4c2dwdjRaUmp6bVVnSHArM2ZaekJwTlA0a0RNeTRnTnlLK3lJWlgrY1huN1dQSmVnMmVvYVhEYnpUWEYwTGQxdWxkMUNtTjMNCnFCRzhaclZmSExjMlF4cW5VK3ozWldQVzVaUXlHUUFqZTFkNDd3WGxObC96a3A1Nm52SUlYc2RMQ1N5SWpFUlhGYU13QnArL3pIT3ENCmtCMGVzeSt4dWxqRWtTeWJEdmovQU1TK2s4em56UjJLdXhWODEvbDkrUlBtVC9FMEgrTU5ELzNCOEpQVy93QktpKzN3UHAvN3p6ZXANCjlyd3pCaGdseEN4cytsOXJlMUdId0QrV3lmdmJGZWsvSDZvMHYvUHI4djhBeWo1VnNOSWwwR3crcHlYVXN5em4xWnBlUVJWSy93QjYNCjcwNjlzR29nSWtWNS9vUjdMZHJhalZUbU0wdUxoQXJZRHY3Z0hma0wrWC9sSHpWWWF2THIxaDlja3RaWVZnUHF6UmNRNnNXL3VuU3YNClR2anA0Q1JOK1g2VjlxZTF0UnBad0dHWER4QTNzRDNkNEt6OHdmeUo4eWY0bW4vd2ZvZis0UGhINlA4QXBVWDIrQTlUL2VpYjFQdGUNCk9HZUNYRWFHeWV5ZmFqRDRBL001UDN0bS9TZmg5TWFmUnNieDJ0aWpYTHJDa1VhK3E3c0ZWYUFBMVk3Wm1EWWJ2bkJCbE04TzlsSkoNClB6SDhnUnV5UDVpMDRNcG9RTG1JNy9RMlI4YVBlNXc3SDFaRmpGUC9BRXBUalQ5VjB2VW9mWDA2OGd2WVA5KzI4aVNwL3dBRWhZWksNCk1nZVJjTE5neVl6VTRtSjh4WDNvaVNTT09OcEpHQ1JvQ3p1eEFBQUZTU1QwQXlSTk5ZQkpvSmIvQUlyOHJmOEFWNHNmK2ttSC9tcksNCi9HaDNqNXVUK1J6L0FPcHovd0JLVWZhWGxwZVFMUGFUeDNFRFZDeXhNcm9hR2hveWtqcmt4SUhjTkdUSEtCcVFJUG1oN3pYTkVzWnYNClJ2ZFF0cldZZ01JNXBvNDI0bm9hTVFhYlpHV1NJNWtObVBUWlppNHhsSWVRSldXM21MeS9kVHJCYmFuYVR6dnNrVWM4YnUxQlhaVlkNCms3WWpMRTdBaE05Sm1pTGxDUUhtQ2lydTlzcktFejNseEhiUWdnR1daMWpXcDZEa3hBeVVwQWMyckhqbE0xRUVueTNRUCtLL0szL1YNCjRzZitrbUgvQUpxeUhqUTd4ODIvOGpuL0FOVG4vcFNtRDNOdkhBYmg1VVNBTHpNek1BZ1hyWGtkcVpQaUZXNDRnU2FBM1FXaytZOUENCjFoNTEwblViYS9OdHhGeDlXbFNYaHpyeDVGQ2V2RTArV0NNd2VUZm4wZWJEWGlRbERpNVdLWVgrWWZsejh2dlBQNlAvQUVqNWlodHYNCjBkNjNwZlY3cTJITDErSExsejU5UFNGS1pSbE1KL3hCM1haR3MxbWg0dURFWmNkYzR5NlgzZTlPZnkwOHErWHZMT2hUMkdnNmlkVHMNCjVicDU1SnpKRkxTUm80MEtjb2dGMlZGTk91K1dZUUFOamJoOXM2N05xY29ubGp3U0VhcWlOclBmNzJXWmE2aEpOUTg4ZVRkUG5OdmYNCmE1WTI4NjdOREpjUkJ4ODE1VkgwNVdjc1IxYzdGMlpxY2d1R09aSDlVcU1INWllUXA1QkhINWkwNHVhQlZOMUNDU2RnQlZoVTRqTEgNCnZaeTdJMWNSWnhaUDlLVTh0cnUwdW94TGF6Unp4SG84VEIxKzlTUmt4SUhrNE04Y29tcEFnK2JFUHpjMWl4dFB5LzE2SnJtSmJtUzENCmFKWVM2Y3o2cENVQ2sxNk5sR29tQkVpOTNjZGdhZVU5WmpOSGg0cnYzYnZEZitjZWIreHNmUGswMTdjeFdzSnNKbEVrenJHdkl5UmsNCkNyRUN1MlkyR1FFckwzWHRiaW5QU0FSQmtlTWN0K2hmVEZucjJoM3Mzb1dlbzIxek1RU0lvWm81R29PcDRxU2N6aGtpZGdRK1k1TkwNCmxnTGxHVVI1Z2hMdk41OHQ2anBON29HcTZwQllpOWhNY29hYUtPVlZidUJJZjRaREtZa2NKSURrOW4rUGp5UnpZNEdYQ2U0a2ZZdzMNCjh2UHl5OGgrWGZNUzZqb212TnFOOElaSXhiR2UzaytGcWNqeGlBYmFtVllvUTRyRXJkejJ2MjFxOVRoNE11UGdqWTNxUSs5NlRlNmQNCnA5L0dzZDlhdzNVYW5rcVR4cklvYWxLZ01Edm1US0lQTVc4MWp6VHhtNEV4UGthZkZsNmlKNXluUkZDb3VvdXFxb29BQk9RQUFNMUoNCitsOXJ4a25UQW4vVS93RGV2dHZOdytJSldmTlhsaFNWYldMSUViRUc1aXFEL3dBRmxmalE3eDgzSy9JNS93Q1pQL1NsdFBOSGxsM1YNCkUxZXlaMklDcUxpSWtrN0FBQnNmR2gzajVxZEZuRzVoUC9TbE04c2NWNGYvQU01UmY4Y3pRUDhBalBjZjhRVE1QVmN4OGYwUGMreEgNCjk1bDkwZjB1L3dDY1hmOEFqbWEvL3dBWjdmOEE0ZytPbDVuNGZwWDIzL3ZNWHVsK2g3WmMzTUZyYlMzTTdpT0NCR2tsa1BSVVFjbUoNCitRR1paTkN5OFJDQmxJUkhNdmtIejcrWUhtRHoxcnhRTko5UmFVUjZacGNaUEVjbTRwVlI5cVZxN242QnRtdG5NeU5sOWg3SzdKdzYNCkhGZTNIVnlsOS91RExMRC9BSnhvODR6MkFudXI2enM3dGxETGFNWGZpVCt6STZLVkIvMWVXV0RUejhuVVpmYlBUUm5VWXlsSHYyK3cNCkg5Tk1HdVlQT1A1ZCthVEVaSk5PMVcyb3l2RzFZNVl5YWcveXlSdFRvZmtkOHFJTVQzRjNzSmFidEhCZENlT1h6Qi9RWDA5NWE4eC8NCjQ3L0xxUzh0bFNLOHZiV2UwbmhxZU1kendLRVYzUEVraGg3SE0wUzhUR2UvaytYNjNSL2tOWUl5M2pHUWtQT04zK1BOOHY4QW5meUYNCnJmazIrdDdMVm5nZWE1aTlhTTI3czY4ZVJYY3NxYjFHWVVvbUpvdnFQWm5hdUxXUU1zZDFFMXUranZ5Qy93REpYNloveGt1ZitvaDgNCnpkUDlMNXY3VmY0L1AzUi8zSVluK2QzNVdlWmZNT3VTK1lyQjdaYkN6c0FKVmxrWlpQM0Jra2Jpb1JoME8yK1ZaOFpzeTZPMjltdTMNCk1HbnhERE1TNDVUNkRiZWgzdk1QeVUvOG1ob1gvR1NYL3FIa3luRjlRZXA5cFA4QUVNbnVIKzZENk8vTmZ5bnFubXJ5Zk5vK21ORXQNCjFKTkZJcG5Zb2xJMnFkd0dQNFptWjRHUTJmTit3dGZqMHVwR1NkOE5IbDV2a3Z6RG9WN29PdFhlajNwUnJ1emYwNWpFU3lWb0Q4SkkNClU5L0RNQWg5YjBtcWpueFJ5UittWGV6bStqL05YOHpQcS8xVFQ1em8xdXFSMmtBUHBXaWhGNGMrY2hSWkgyM081OEtkTWtCS1huVG8NCnNSN1A3TXZpbEh4RHpQT1h5RjBIcS81Ry9sMzVrOG5EV2pyU1JJYi9BT3ErZ0lwQklmM1ByYytWQnQvZURNclR3TWJzUEorMC9hK0QNCldlSDRWK2ppdXhYUGgvVThKODlmbHQ1aDhsZlVmMHc5dS82UTlYMFBxN3M5UFI0Y3VYSlVwL2VDbVkwOFpqemU4N0w3Wnc2M2k4UGkNCjlGWFk3Nzh6M1BiditjWmYrVUR2L3dEdHFTLzlROXZtVnB2cCtMdy90cC9qY2Y4QWhZLzNVa04vemtiNTAxVFNkT3NORDA2WnJmOEENClNZa2t2Wm95VmN4UjhWRVlZYjBjc2VWUENuUW5JYW1mOExiN0g5blk4czVaWmkrQ3FIbWV2dzZQTC95OS9KdnpCNXpzWk5TaHVJYkgNClRrY3hKTk55Wm5kUUNlQ0tPZ3J1U2NvaGlNdVQxSGEzdEZoMFV4QWd5bnpvZEUzODEvOEFPUG11YUJvTjVyQjFXMnVZYktNeXpSY0oNCkVZcUtmWjJZRS9PbUdlR1VSWnB3OUQ3V1l0UmxqaTRKUk1qUTVKdi9BTTR2ZjhkclhmOEFtR2gvNU9ISjZiNnZnNG50di9kWS93Q3MNCmZ1Vi96by9LUy9hNjE3enYra0loYlVqbCtwOEc1MEN4dzA1VnAxM3h6WWlMbDBhL1p6dCtBamowdkNiM0YzN3k4eC9MN3lQYytjOWQNCmZTTGU2UzBrU0I3ajFaRkxDaU1xMG9LZno1VEdKa2FEMUhhM2FjZEZpOFFqaTNyNzN1WDVaL2tscVhrL3pPdXMzR3B3M2Nhd3lRK2wNCkhHeXRXU205U1Q0Wms0OEVoSUV2Qzl0ZTBzTlpnOElRTVRZUFB1U0Q4K1B5Mjh3NmhxdDk1dGdlM0dsMmRuSDZxdTdDYjkxWGxSUXANCkhmOEFteUdmR2JNdWpzUFpidG5Eanh4MDU0dU9VajAyMytMRlArY2RmL0pqcC96QnovOEFHdVF3L1dQeDBkcjdYLzRsL25SZlUyYkYNCjhyZkUyb2Y4cHJjLzl0Si8rVDV6VG42WDI3Ri9pby80V1A4QWN2dGtrQUVrMEEzSk9iaDhSZkQvQUpuc0ZzdGZ2TFpMcUM5SWxjbWENCjFacEk2c3hQRU1WWGtSN2JlK2FnYkI5eTBXWGp3eGtZbU8zOFd4Wjc1TC9JN3o1ZHlhYnJUd3cyVnVzOFUvbzNUdEhPWTBjTnk5TUkNCjFLZ2JCcUhMWTRaU0hKMEhhWHROcElDZUlFeU5FWEhjWDc3ZlVlYko4c2VIL3dET1VYL0hNMEQvQUl6M0gvRUV6RDFYTWZIOUQzUHMNClIvZVpmZEg5THY4QW5GMy9BSTVtdi84QUdlMy9BT0lQanBlWitINlY5dC83ekY3cGZvZWhmbTVjeVcvNWJlWUpJelJtdFRHZjlXVmgNCkczL0NzY3UxQnFCL0hWNTNzQ0FscmNRUDg3N3QzengrUk5sQmQvbWJwWHJEa3NBbm5WVDA1cEMzRS9RVFhNUEY5WWZSZmFqS1lhR2QNCmRhSDJoOWE1c255TjROL3psSFl3Y2ZMOStBQk9UY1FPYWJzZzRPdFQva25sOStZV3FHNGU5OWlNcHZMRHA2VDk2Ty81eGZ1WkcwSFcNCjdVbjkxRmRSeXFQOHFTUGkzL0pzWkxTbmNqM2ZwYVBiYUE4YkhMcVlrZkkvdFkzL0FNNVBmOHBUcEgvTUNmOEFrOCtWNm42L2grdDINCmZzVC9BSEUvNi82QTlNL0lML3lWK21mOFpMbi9BS2lIekkwLzB2TWUxWCtQejkwZjl5R1grYS8rVVcxai9tQnVmK1RMWlBOOUI5eGQNClBvZjcvSC9Yajk3NVYvSlQvd0FtaG9YL0FCa2wvd0NvZVRNSEY5UWZWL2FUL0VNbnVIKzZENit6WlBqejQ2L043L3laV3Y4QS9NVC8NCkFNYUxtcm45Ujk1ZlpQWi8vRWNYOVg5TDY0MElBYUpwNEFvQmJRMEgvUE1ac01YMEQzUGtXcC92WmYxajk2Tnl4b2VDL3dET1UzL1QNCk1mOEFSOS8yTDVpYXJvOTk3RC81Yi9NLzM2ZmY4NHkvOG9IZi93RGJVbC82aDdmSjZiNmZpNEh0cC9qY2YrRmovZFNhL3dDY2hQSWUNCnFhOXBkbHJHbFF0YzNPbCtvdHhheGdzN3d5VVBKRkc1S012UWRqN1pIVXdKM0MreVhhbVBUNUpZOGg0WXpxajVqOWJ4cnlOK2F2bXoNCnlXa2xwWUdLYXhrazlTV3l1VUxLSDJERlNwVjFKQThhZTJZME1oanllejdUN0MwK3RJbE94T3ZxSDRvdlV0SC9BT2NtTkZ1LzlIOHcNCmFLOEVML0M4c0RyY0pRL3pSdUl6VDZUbDQxTjdTRHkybzlpOHNQVmh5QW56OVAyaS93QkQxanl4cVBsZlZkUFhVL0w3Vzh0ck5zWmINCmRGUTFHL0Ixb3JLd3I5bGhYTWpId25lTHlXdHc1OFUvRHpjUWtPLzlIN0VrL09UL0FNbGxyMy9HQlA4QWs2bVExUDBINGZlNTNzNy8NCkFJOWk5LzZDOFQvNXh0LzhtRE4vMno1ditUa1dZK0Q2bnQvYkwvRXgvWEgzRjlQNW52bHpFL3pYL3dESmNlWVArWU4vNFpUcVBvUDQNCjZ1MjdDL3gzRi9XRHdYL25IWC95WTZmOHdjLy9BQnJtSmgrc2Zqbzk5N1gvQU9KZjUwWDFObXhmSzN4SHFzcVErY0x5V1EwU1BVSkgNCmM5ZGxuSk9haXRuM0RCRW5UUkE2d0grNVo3K1pINXllWVBOMGQzWWFGRE5aK1hZRnJkTWlreXlSbGdvYWRscUk0eXhBNDFwNGs5TXYNCnlaakwzT2c3RzluY09rTVo1U0paank3Z2Y2UGVmUDVJYjhnYm55cW5uUmJmV3JaSmIyNFVEUjdpWGRJNXhVOGVKK0hrNCt3eDZFVUcNCjV3WWE0dDJ6MnJocURwcnhHb2o2d09vL1oxL1krcU0yTDVVN0ZYaC8vT1VYL0hNMEQvalBjZjhBRUV6RDFYTWZIOUQzUHNSL2VaZmQNCkg5THYrY1hmK09aci93RHhudC8rSVBqcGVaK0g2Vjl0L3dDOHhlNlg2SHBmNWxhWE5xbmtMWGJLRlM4ejJranhJT3JORVBVVlI3a3ANClRMODR1QmVaN0d6akZxOGNqeTRoOXV6NWYvS1R6QmE2RCtZR2szOTVJSXJNdThGeEkzMlZXZEdqREU5Z3JNQ1Q0Wmc0NVZJRjlSN2YNCjBrcytqbkNJdVhNZkEyK3hRUVFDRFVIY0VaczN4dDg3Zjg1TmVZYlM2MWJTdER0NUE4dW5wTE5lS3REeGVmZ0kxSjdNRlFtbmd3ekINCjFNZ1pWM1BvM3NYcEpSeHp5a2JUb0Q0WGYzL1l5ai9uR2JTNXJmeW5xT29TS1ZXK3UrTVJQN1NRSUJ5SCt5ZGg5R1Qwc2VaZFY3YVoNCnhMVVJnUDRZL2VmMU1TLzV5ZUIveFBwRFUyTmtRRDJxSlcvcmxlcCt2NGZyZHY3RS93QnhQK3YraDZEL0FNNDhhamFYUDVkUVdzVGcNCnoyTTg4ZHhIM1V5T1pWTlBBcStYNlkrbW5udmE3REtPdE1pTnBSRmZBVXpEejFxV242ZjVSMWVhK3VJN2FKN1NlSkdrWUx5a2VKZ3ENCkxYcXpIb0JrODVBZ2ZjNmZzdkRQSnFJQ0FKUEVEOXI1ZS9KVC93QW1ob1gvQUJrbC93Q29lVE1MRjlRZlV2YVQvRU1udUgrNkQ2K3oNClpQano0Ni9ONy95Wld2OEEvTVQvQU1hTG1ybjlSOTVmWlBaLy9FY1g5WDlMNjQwUC9qaTZmL3pEUS84QUpzWnNNWDBqM1BrV3AvdloNCmYxajk2Tnl4b2VDLzg1VGY5TXgvMGZmOWkrWW1xNlBmZXcvK1cvelA5K24zL09Ndi9LQjMvd0QyMUpmK29lM3llbStuNHVCN2FmNDMNCkgvaFkvd0IxSmxublg4MC9LL2s2K2dzdFhGeDYxekY2MGZvUmh4eDVGZHlXWGVveVdUT0ltcUxxT3pldzgrc2laWStHZ2EzSytYeXANCjVBODdhWmJheGQ2UEJjSnFFS1R4enVubzNCU1FjaHlraUt2WGYrYkVRaE1YU0k2N1Y2TEljY2NoSEFhcTdqdDVIYjdIbEg1d2ZrdjUNClY4dStXNS9NR2pUeTJqVzd4bzFqSy9xSklKSENVakxmR0dITGx1VHNEbEdYQ0lpd1hyUFovd0JvOVJxTTR3NVFKWGZxRzFVTDM2VjgNCmtEL3pqTHFWN0g1czFIVFZZbXp1TEpwNVk2N0NTS1dOVWY3cEdIMDROTjlUZjdhWVluVHduL0VKMThDRCtwNi8rY24vQUpMTFh2OEENCmpBbi9BQ2RUTDlUOUIrSDN2SCt6ditQWXZmOEFvTHhEL25IR2VHUDh4R1NSd3JUV002UkEvdE55amVnLzJLazVqWUQ2dzl6N1lSSjANCmUzU1kvUytvczJENVl4UDgxLzhBeVhIbUQvbURmK0dVNmo2RCtPcnR1d3Y4ZHhmMWc4Ri81eDEvOG1Pbi9NSFAvd0FhNWlZZnJINDYNClBmZTEvd0RpWCtkRjlUWnNYeXQ4UmF4Q3MvbTY5Z1lrTExxRXFFanFBMHhHYWk2RDdocDVjT21pZTZBKzU5ZTZGNUQ4cjZMNWZsMEcNCnlzaytvWEtHTzhEL0FCUFB5WGl4bGJxeElQMGRxWnM0NG9nVStQNnJ0VFBtekROS1hyQjIvbys1OHBlZnZLRi81SzgyVGFkeWNSeHMNCkxqVGJ2b1hoSnJHNEkvYVVqaWY4b1pyNXc0VFJmV095dTBJYTNUaWZYbEllZlg4ZHo2WC9BQ20vTUNMemo1WlNhWmdOWHN1TU9wUkQNCmFyVStHVUQrV1FDdnpxTXpzR1RpRy9NUG1mYjNaSjBlZWgvZHkzaityNE0yeTUwYjVVODAvbC8rYmVxNnRkbWZUOVF2YlJibVo3UVMNCnkrb2lvem1oUU81NDFXblROWHdTNmd2cStoN1c3T3hZNDFLRVpjSXVoWFRyczd5dCtYLzV0NlZxMW9ZTlAxQ3l0R3VZWHV4Rkw2YU0NCml1S2x3ampsUmE5Y2VDWFFGZGQydDJkbHh5dVVKUzRUVmkrblRaOVY1dEh5aDg4Zm1YK1FHc0xxZHhxdmxPSmJxenVHTWo2YUdWSkkNCldiZGhIeklWMHIwRmFqcFE1ZzVNQkhMaytpOWkrMWVQZ0dQVUhoa051TG9mZjNGaGx0RCtkdW1XdzB5MWg4d1c5dUFVanQ0bzd2aUENCm82UjhSc0FQNWNxQWw1L2E3bWN1eThzdkVrY0JQZVRIN2YycGg1Vi9JenozNWd2bG0xYUI5S3NwRzUzTjNlZjM3Vk5XNHhFK29YUCsNClhRZStTaGhrZWxOR3U5cDlKcDRWakl5U0hJUjVmUGxYdWZUbWg2TnAraWFUYTZUcDhmcFdkbkdJNFU2bWc2bGozWmp1VDQ1bndpSWkNCmcrWDZuVXp6NUpaSm01U05zRi9Pcjh0YnZ6anBGdGNhV1YvVEdtbHpCRTVDck5ISlRuSHlPd2FxZ3FUdDI3MXluUGlNdHh6ZDc3TjkNCnN4MGVRakovZHo1K1JIWDlid0xUdkxINXI2QnFMRFROTTFpeHZEOERQYXhUZ09CMjV4amc2L1NSbUp3eUhRdm9HYlc5bjZpSHJuaWwNCkgra1kvcDNETjlNL0p2OEFNTHpKRmNhdjV5dTdtc01FcjJkbE5NWnJtV1FJVEdnQkxMRXBlbFIxN1VIWEplRE1nbnkrTG84L3RGbzkNCk1SajAwWTdrV1FLaUIxOTVwaDFwK1ZuNXEyZHdsemFhTmVXOXhIVXh6Uk1xT3BJb2FNcmdqWTVEZ2wzSDVPNXlkdWRuekhETEpBZzkNCkQvWTlibTBiOHhqK1NjRmdxMy8rS1JjbG5BbWI2ejZmcnNkNU9kYWNLZnRkTXZNWmVIMTV2SXgxT2kvbFF6OUhnY1BkNmI0ZTZ1OTUNCkhjL2xYK2FkMU85eGRhTGVUM0VockpOS3l1N0h4Wm1ZazVSd1M3ajhucm9kdTZDQTRZNUlnRG9QN0hyWDVHNkgrWW1tNjFmSHpPbDgNCmxrYlFKYXJkeXRKR0hFaTdJcFpnRHh5L1R4a0pjalZQSmUwK3EwZVhGSHdPRGk0dCtFVWVYdWV6Wm12RnZrZlVmeTYvT0xVdlQvU08NCm5hamUrbFgwdnJFdnE4ZVZPWEhtN1VyeEZhWnJPR1hjZmsrdlllMk96Y1Y4RW9SdnVGZmNFLzhBeTM4a2ZtcG8zbXJTZldzcit6MGQNCmJ5T1c5akVwV0FyVUJtZEZlaDJBcnRoaEdWalk4dzYvdG50UFFadFBPcFFsazRTQnR2OEFBMHl2OC9meS93RE4zbUxXZE92OUUwOXINCjIydDdVd3pGSGpESy9xTTFPRE1ySFk5aGwyb3h5TXJBNk9wOWxlMWRQcHNVNFpaY0pNckd4N25ubG12NTc2SkRIYVdrT3ZSVzhDMGkNCmlTSzRtaVJRS0JWSEYwQUFIVHRsSUUvNlgydlJaUDVKemt5a2NKSjg0Zy9vS0Z2ZEIvT1B6ZGNSTHFGanExOFZKOUw2MmtrVUtub1MNCnBsRWNTNE9HUjd5MjQ5VjJicEFlQ1dPUDlVZ243TEwzTDhtL3lzbThtV2R6ZWFrNlM2emZCVmtFWnFrTVM3aU1OdHlKYmRqMDZlRlQNCmw0TVhEdWVid3Z0RjI0TmJJUmhZeHg3K3A3LzFNMzh5NkhCcjNsL1VOSG5iaEhmUVBENmxLOEdZZkM5UDhscUhMY2tPSVU2UFJhazQNCk0wY281eE52bERWUHl5L01ueTNxZktMVEx4cGJkdVVHb2Fjc2txN2RIU1NFY2srbWh6WG1FaDBmV2NIYldpMU9QZWNLUE9NNkh3bzgNCjNwMzVPNmwrYkUvbTlCNW1qMVU2U2JXUk9WN0RMSENIMlpHcTZvQzN3a1YzNjVkaDQrSVhkZkY1ZjJodzlueDAvd0M0T1B4T0lmU1ENClQ1cVA1MWVXUHpLMWZ6WE1ORGd2cmpSWmJhSkhpaGxLd013cnpCajVoVDc3WkhOR1JrZGkyZXpldDBXSFRqeFRBWlJJOHh2ODZlZDINClA1WS9tellUL1dMSFNiNjBuQUsrdEE0amVoNmprcmc1VndTN2o4bm9zdmJmWitRVk9jSkR6Ri9vZXZlZWRIL01PNC9MRHl6YWFTdDgNCmRlaDlEOUpDR1prbjJ0MkQrbzRZRnZqcFhmcm1STVM0QnplUDdNMUdqanJzMHNuQjRSdmhzYmZWdFFydWVPTitVMzVudEtabTBPN00NCnBibVpDVjVGcTE1VjVWclhNZmdQY2ZrOW1PM3RCVmVKR3Z4NVBlUHlQMHp6cFlhUHFTZWFoZGk1ZTRWcmY2NUkwcmVud29lSlpub0sNCjVsYVlIZTNndmFiTnBzbVNCMC9EdzhPL0NLM3Q1TDU5L0w3ODBkWTgyYXRjZm8yOXZiSDY5ZE5wN1BKelJZSG1ZcDZZWi9oVXJUWVoNClJraWVJN0Y2M3NydGJRWWRQQWNjSXk0SThXM1d0NzJTblQveTIvTjdUWkdrMDdUTlFzNUhIRjN0NVBTTERyUWxIRlJrT0NYY2ZrNW0NClh0bnM3SUtuT0V2ZUwvUS8vOWs9PC94bXBHSW1nOmltYWdlPg0KCQkJCQk8L3JkZjpsaT4NCgkJCQk8L3JkZjpBbHQ+DQoJCQk8L3htcDpUaHVtYm5haWxzPg0KCQk8L3JkZjpEZXNjcmlwdGlvbj4NCgkJPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIj4NCgkJCTx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6MzYxMzE4QjQxMDIwNjgxMTgyMkFENzBFQTZCRkZDMDc8L3htcE1NOkluc3RhbmNlSUQ+DQoJCQk8eG1wTU06RG9jdW1lbnRJRD54bXAuZGlkOjM2MTMxOEI0MTAyMDY4MTE4MjJBRDcwRUE2QkZGQzA3PC94bXBNTTpEb2N1bWVudElEPg0KCQkJPHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD51dWlkOjVEMjA4OTI0OTNCRkRCMTE5MTRBODU5MEQzMTUwOEM4PC94bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+DQoJCQk8eG1wTU06UmVuZGl0aW9uQ2xhc3M+cHJvb2Y6cGRmPC94bXBNTTpSZW5kaXRpb25DbGFzcz4NCgkJCTx4bXBNTTpEZXJpdmVkRnJvbSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+DQoJCQkJPHN0UmVmOmluc3RhbmNlSUQ+eG1wLmlpZDowNTgwMTE3NDA3MjA2ODExODA4MzhERDU1OTU3MzBBQzwvc3RSZWY6aW5zdGFuY2VJRD4NCgkJCQk8c3RSZWY6ZG9jdW1lbnRJRD54bXAuZGlkOjA1ODAxMTc0MDcyMDY4MTE4MDgzOERENTU5NTczMEFDPC9zdFJlZjpkb2N1bWVudElEPg0KCQkJCTxzdFJlZjpvcmlnaW5hbERvY3VtZW50SUQ+dXVpZDo1RDIwODkyNDkzQkZEQjExOTE0QTg1OTBEMzE1MDhDODwvc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPg0KCQkJCTxzdFJlZjpyZW5kaXRpb25DbGFzcz5wcm9vZjpwZGY8L3N0UmVmOnJlbmRpdGlvbkNsYXNzPg0KCQkJPC94bXBNTTpEZXJpdmVkRnJvbT4NCgkJCTx4bXBNTTpIaXN0b3J5Pg0KCQkJCTxyZGY6U2VxPg0KCQkJCQk8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4NCgkJCQkJCTxzdEV2dDphY3Rpb24+c2F2ZWQ8L3N0RXZ0OmFjdGlvbj4NCgkJCQkJCTxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6RkQ3RjExNzQwNzIwNjgxMTgwODNDM0U5MTI0NTgxQzE8L3N0RXZ0Omluc3RhbmNlSUQ+DQoJCQkJCQk8c3RFdnQ6d2hlbj4yMDEyLTA1LTEwVDExOjAyOjU1KzAyOjAwPC9zdEV2dDp3aGVuPg0KCQkJCQkJPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgSWxsdXN0cmF0b3IgQ1M1PC9zdEV2dDpzb2Z0d2FyZUFnZW50Pg0KCQkJCQkJPHN0RXZ0OmNoYW5nZWQ+Lzwvc3RFdnQ6Y2hhbmdlZD4NCgkJCQkJPC9yZGY6bGk+DQoJCQkJCTxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPg0KCQkJCQkJPHN0RXZ0OmFjdGlvbj5jb252ZXJ0ZWQ8L3N0RXZ0OmFjdGlvbj4NCgkJCQkJCTxzdEV2dDpwYXJhbWV0ZXJzPmZyb20gYXBwbGljYXRpb24vcG9zdHNjcmlwdCB0byBhcHBsaWNhdGlvbi92bmQuYWRvYmUuaWxsdXN0cmF0b3I8L3N0RXZ0OnBhcmFtZXRlcnM+DQoJCQkJCTwvcmRmOmxpPg0KCQkJCQk8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4NCgkJCQkJCTxzdEV2dDphY3Rpb24+c2F2ZWQ8L3N0RXZ0OmFjdGlvbj4NCgkJCQkJCTxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6MDU4MDExNzQwNzIwNjgxMTgwODM4REQ1NTk1NzMwQUM8L3N0RXZ0Omluc3RhbmNlSUQ+DQoJCQkJCQk8c3RFdnQ6d2hlbj4yMDE3LTAxLTEwVDA5OjA1OjI2KzAxOjAwPC9zdEV2dDp3aGVuPg0KCQkJCQkJPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgSWxsdXN0cmF0b3IgQ1M2IChNYWNpbnRvc2gpPC9zdEV2dDpzb2Z0d2FyZUFnZW50Pg0KCQkJCQkJPHN0RXZ0OmNoYW5nZWQ+Lzwvc3RFdnQ6Y2hhbmdlZD4NCgkJCQkJPC9yZGY6bGk+DQoJCQkJCTxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPg0KCQkJCQkJPHN0RXZ0OmFjdGlvbj5jb252ZXJ0ZWQ8L3N0RXZ0OmFjdGlvbj4NCgkJCQkJCTxzdEV2dDpwYXJhbWV0ZXJzPmZyb20gYXBwbGljYXRpb24vcG9zdHNjcmlwdCB0byBhcHBsaWNhdGlvbi92bmQuYWRvYmUuaWxsdXN0cmF0b3I8L3N0RXZ0OnBhcmFtZXRlcnM+DQoJCQkJCTwvcmRmOmxpPg0KCQkJCQk8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4NCgkJCQkJCTxzdEV2dDphY3Rpb24+c2F2ZWQ8L3N0RXZ0OmFjdGlvbj4NCgkJCQkJCTxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6MzYxMzE4QjQxMDIwNjgxMTgyMkFENzBFQTZCRkZDMDc8L3N0RXZ0Omluc3RhbmNlSUQ+DQoJCQkJCQk8c3RFdnQ6d2hlbj4yMDE3LTAzLTAzVDA5OjI0OjIyKzAxOjAwPC9zdEV2dDp3aGVuPg0KCQkJCQkJPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgSWxsdXN0cmF0b3IgQ1M2IChNYWNpbnRvc2gpPC9zdEV2dDpzb2Z0d2FyZUFnZW50Pg0KCQkJCQkJPHN0RXZ0OmNoYW5nZWQ+Lzwvc3RFdnQ6Y2hhbmdlZD4NCgkJCQkJPC9yZGY6bGk+DQoJCQkJPC9yZGY6U2VxPg0KCQkJPC94bXBNTTpIaXN0b3J5Pg0KCQk8L3JkZjpEZXNjcmlwdGlvbj4NCgkJPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6aWxsdXN0cmF0b3I9Imh0dHA6Ly9ucy5hZG9iZS5jb20vaWxsdXN0cmF0b3IvMS4wLyI+DQoJCQk8aWxsdXN0cmF0b3I6U3RhcnR1cFByb2ZpbGU+UHJpbnQ8L2lsbHVzdHJhdG9yOlN0YXJ0dXBQcm9maWxlPg0KCQk8L3JkZjpEZXNjcmlwdGlvbj4NCgkJPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6cGRmPSJodHRwOi8vbnMuYWRvYmUuY29tL3BkZi8xLjMvIj4NCgkJCTxwZGY6UHJvZHVjZXI+QWRvYmUgUERGIGxpYnJhcnkgOS45MDwvcGRmOlByb2R1Y2VyPg0KCQk8L3JkZjpEZXNjcmlwdGlvbj4NCgk8L3JkZjpSREY+DQo8L3g6eG1wbWV0YT4NCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPD94cGFja2V0IGVuZD0ndyc/Pv/bAEMAAgEBAgEBAgICAgICAgIDBQMDAwMDBgQEAwUHBgcHBwYHBwgJCwkICAoIBwcKDQoKCwwMDAwHCQ4PDQwOCwwMDP/bAEMBAgICAwMDBgMDBgwIBwgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDP/AABEIAGwAfQMBIgACEQEDEQH/xAAfAAABBQEB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')";

  var str =
    '\n{\n"type": "IMAGE",\n"image": "' + img + '",\n"align":"CENTER"\n},';
  if ($SETTINGS.print_company_logo === "true") {
    return String(str);
  } else {
    return String("");
  }
}

function tpv_printbarcode(e, callback) {
  var $barcode_type = $($tpvarr_barcode).filter(function (i, n) {
    return n.val_plugin === $SETTINGS.barcode_type;
  });
  if ($barcode_type.length !== 0) {
    var str =
      '\n{\n"type":"BARCODE",\n"content":"' +
      e.substring(0, parseInt($SETTINGS.barcode_length)) +
      '",\n"height": 60,\n"margin": 5,\n"scale": 2,\n"format":"' +
      $barcode_type[0].val +
      '",\n"align": "CENTER"\n},';
    if ($SETTINGS.print_barcode === "true") {
      return String(str);
    } else {
      return String("");
    }
  } else {
    return String("");
  }
}

function tpv_printqr(e, callback) {
  var str =
    '\n{\n"type":"QR",\n"content":"' +
    e +
    '",\n"size": "' +
    $SETTINGS.tpv_qrsize +
    '",\n"align": "' +
    $SETTINGS.tpv_qrposition +
    '"\n},';
  if ($SETTINGS.tpv_qr === "true") {
    return String(str);
  } else {
    return String("");
  }
}

function tpv_printfooter() {
  var str = strnewline + strnewline + strnewline;
  str +=
    '\n{\n"type": "TEXT",\n"text":"Sign:____________________________________",\n"align":"LEFT",\n"fontSize": ' +
    $def_print.fontsize +
    ',\n"isBold": true,\n"isUnderline": false\n},';

  if ($SETTINGS.string.footer_branch_company == "true") {
    str +=
      '\n{\n"type": "TEXT",\n"text":"' +
      $SETTINGS.branch.name +
      '",\n"align":"LEFT",\n"fontSize": ' +
      $def_print.fontsize +
      ',\n"isBold": true,\n"isUnderline": false\n},';
    str +=
      '\n{\n"type": "TEXT",\n"text":"' +
      $SETTINGS.string.address_of_branch +
      '",\n"align":"LEFT",\n"fontSize": ' +
      $def_print.fontsize +
      ',\n"isBold": false,\n"isUnderline": false\n},';
    str +=
      '\n{\n"type": "TEXT",\n"text":"Phone : ' +
      $SETTINGS.string.phone_branch +
      '",\n"align":"LEFT",\n"fontSize": ' +
      $def_print.fontsize +
      ',\n"isBold": false,\n"isUnderline": false\n},';
  }

  if ($SETTINGS.string.other_information.length) {
    var others = $SETTINGS.string.other_information.split("|");
    //buffer += line_feed+"@:separator:"
    for (var i = 0; i < others.length; i++) {
      str +=
        '\n{\n"type": "TEXT",\n"text":"' +
        others[i] +
        '",\n"align":"LEFT",\n"fontSize": ' +
        $def_print.fontsize +
        ',\n"isBold": false,\n"isUnderline": false\n},';
    }
  }

  str += strnewline.substring(0, strnewline.length - 1);

  return String(str);
}

function tpv_printbillcc(data, msg, callback) {
  var dtticket = data.ticket;

  tpv_printbillccr(dtticket, msg, function (e) {
    tpv_printbillccr(dtticket, "COPY BILL PAYMENT", function (r) {
      $("#txt-resultp").val(JSON.stringify(data, undefined, 4));

      callback(data);
    });
  });
}

function tpv_printbillccr(dtticket, msg, callback) {
  var module = "/v1/device/printer";
  console.log(dtticket);
  var amount =
    dtticket.Amount.substring(0, dtticket.Amount.length - 2) +
    "." +
    dtticket.Amount.slice(dtticket.Amount.length - 2);
  var $companyname =
    '\n{\n"type": "TEXT",\n"text":"' +
    $SETTINGS.company.name +
    '",\n"align":"CENTER",\n"fontSize": 20,\n"isBold": true,\n"isUnderline": false\n},';
  var $tgl =
    dtticket.Date.substring(0, 4) +
    "-" +
    dtticket.Date.substring(4, 6) +
    "-" +
    dtticket.Date.substring(6, 8);
  var $jam =
    dtticket.Time.substring(0, 2) + ":" + dtticket.Time.substring(2, 4);
  var $data =
    '{\n"typeFace":"Sans-Serif",\n"advancePaper": true,\n"letterSpacing": 2,\n"grayLevel": 2,\n\n"rows":[';
  $data += tpv_printlogo() + $companyname;
  $data += strnewline;
  $data += txtrowright
    .replace(/\@:dt:/g, "ID. : " + dtticket.Id)
    .replace(/\@:dtr:/g, "MID : " + dtticket.MerchantId);
  $data += txtrow.replace(/\@:dt:/g, "Card Type " + dtticket.CardType);
  $data +=
    '\n{\n"type": "TEXT",\n"text":"' +
    dtticket.CardNumber +
    '",\n"align":"LEFT",\n"fontSize": 22,\n"isBold": true,\n"isUnderline": false\n},';
  $data += txtrow.replace(/\@:dt:/g, dtticket.CardBank);
  $data += txtrow.replace(/\@:dt:/g, dtticket.CardIssuer);
  $data += txtrow.replace(/\@:dt:/g, dtticket.CardHolder);
  $data += txtrowright
    .replace(/\@:dt:/g, "SALES ")
    .replace(
      /\@:dtr:/g,
      "Date : " + date_format($tgl, "dd MMM yyyy") + " " + $jam
    );
  $data += txtrowright
    .replace(/\@:dt:/g, "APPR CODE :" + dtticket.Authorization)
    .replace(/\@:dtr:/g, " ");
  $data +=
    '\n{\n"type": "TEXT",\n"text":"TOTAL : ' +
    dtticket.Currency +
    "  " +
    amount +
    '",\n"align":"RIGHT",\n"fontSize": 26,\n"isBold": true,\n"isUnderline": false\n},';
  $data += strnewline;
  $data += txtrowright
    .replace(/\@:dt:/g, "AID. : " + dtticket.AID)
    .replace(/\@:dtr:/g, "ARC. : " + dtticket.ARC);
  $data += txtrowright
    .replace(/\@:dt:/g, "ATC. : " + dtticket.ATC)
    .replace(/\@:dtr:/g, "PSN. : " + dtticket.PSN);
  $data += txtrowright
    .replace(/\@:dt:/g, "TERM. : " + dtticket.TerminalId)
    .replace(/\@:dtr:/g, " ");
  $data += strnewline;

  //---- SignatureIndicator true
  if (dtticket.SignatureIndicator == 1) {
    $data +=
      '\n{\n"type": "TEXT",\n"text":"***** SIGNATURE *****",\n"align":"CENTER",\n"fontSize": 22,\n"isBold": true,\n"isUnderline": false\n},';
    //$data           +="\n{\n\"type\": \"IMAGE\",\n\"image\": \"" + dtticket.SignatureImage + "\",\n\"align\":\"CENTER\"\n},";
  } else {
    $data +=
      '\n{\n"type": "TEXT",\n"text":"*** PIN VERIFICATION SUCCESS ***",\n"align":"CENTER",\n"fontSize": 22,\n"isBold": true,\n"isUnderline": false\n},';
  }
  $data +=
    '\n{\n"type": "TEXT",\n"text":"I AGREE TO PAY ABOVE TOTAL AMOUNT",\n"align":"CENTER",\n"fontSize": 18,\n"isBold": true,\n"isUnderline": false\n},';
  $data +=
    '\n{\n"type": "TEXT",\n"text":"ACCORDING TO CARD ISSUER AGREEMENT",\n"align":"CENTER",\n"fontSize": 18,\n"isBold": true,\n"isUnderline": false\n},';
  $data += strnewline;

  $data += txtrowright
    .replace(/\@:dt:/g, "----" + msg + "----")
    .replace(/\@:dtr:/g, " ");

  $data += strnewline.substring(0, strnewline.length - 1);
  $data += "]\n}";

  postITOS(module, $data, function (e) {
    callback(e);
  });
}
