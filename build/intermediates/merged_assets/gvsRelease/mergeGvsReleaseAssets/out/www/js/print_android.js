$(document).ready(function () {
  $("#printer-list").on("change", "input[type=checkbox]", function (e) {
    $("#printer-list input[type=checkbox]").prop("checked", false);
    $(this).prop("checked", true);
  });

  $("#printer-print").on("click", function (e) {
    var device_print = $("#printer-list")
      .find(":checked")
      .parents("li")
      .data("item");

    var data = $(this).data("item");
    var logo = get_company_logo($SETTINGS.initial_company);
    //var title = $(this).data('title');
    var $prn_header =
      $SETTINGS.print_header +
      (data[0].status_prn !== undefined ? " " + data[0].status_prn : "");
    var title = $prn_header;
    console.log(data);

    var input = "";

    if (device.platform != "iOS") {
      /*
            if(typeof data[0] == 'string') {
                if(title !=='TICKET'){
                    input = printer_print_buffer_array(data, title);
                } else {
                    input = printer_print_ticket(data[0].split("#")[0], data[0].split("#")[3], 'TICKET DUPLICATE');
                }
            } else {
                for(var i=0; i<data.length; i++) {
                    if(data[i].idx_mfexcursion) {
                    input += printer_print_buffer(data[i]);
                    }
                }
                if($SETTINGS.lp_status=='true'){
                   input += printer_print_ticket(data.idx_mfexcursion,data.idx_transaction.split('#')[2], 'TICKET')                   
                }
            }
            
            console.log(title)
            printer_device_connect(device_print, function() {      

                printer_print_image(logo,'' , function() {
                    printer_print_text(input, function() {
                    // disconnect the printer?
                    // don't, it will crash the next print event
                        // kondisi jika print voucher
                        //if(title==='VOUCHER'){
                          //  printMyBarcode(data, function(){ });
                        //}
                        
                    });
                });

            });*/

      console.log(title);
      printer_device_connect(device_print, function () {
        if (typeof data[0] == "string") {
          if (title == "TICKET") {
            printer_print_ticket(
              data[0].split("#")[0],
              data[0].split("#")[3],
              $prn_header
            );
          } else {
            input = printer_print_buffer_array(data, $prn_header);
            printer_print_image(logo, "", function () {
              printer_print_text(input, function () {
                printMyBarcode(data, function () {
                  printQRCodeJS(data, function () { });
                });
              });
            });
          }
        } else {
          for (var i = 0; i < data.length; i++) {
            if (data[i].idx_mfexcursion) {
              printer_print_image(logo, data[i], function (r) {
                input = printer_print_buffer(r);
                printer_print_text(input, function () {
                  printMyBarcode(data, function () {
                    printQRCodeJS(data, function () { });
                  });
                });
              });

              if ($SETTINGS.lp_status == "true") {
                if (data[i].status_prn == undefined) {
                  printer_print_ticket(
                    data[i].idx_mfexcursion,
                    data[i].idx_transaction.split("#")[2],
                    $SETTINGS.print_header
                  );
                }
              }
            }
          }
        }
      });
    } else {
      if (typeof data[0] == "string") {
        input = printer_print_buffer_array_iOS(data, title);
      } else {
        for (var i = 0; i < data.length; i++) {
          if (data[i].idx_mfexcursion) {
            input += printer_print_buffer_iOS(data[i]);
          }
        }
      }

      printer_device_connect_iOS(device_print, function (device_print) {
        printer_print_text_iOS(device_print, input, function () { });
      });
    }
  });
});

function printer_print_buffer_array(data, title) {
  var line = "................................";
  var $prn_header =
    $SETTINGS.print_header +
    (data.status_prn !== undefined ? " " + data.status_prn : "");
  console.log(data);
  console.log($prn_header);
  buffer = "{br}{center}{w}{b}" + $prn_header + "{/b}{/w}";
  buffer +=
    "{br}{center}{s}PRINTED ON " +
    date_format(get_date_time(), "dd/MM/yyyy HH:mm") +
    "{/s}";
  buffer += "{br}{left}" + ($SETTINGS.print_size == "small" ? "{s}" : "");

  for (var i = 0; i < data.length; i++) {
    switch (data[i]) {
      case "SEPARATOR":
        buffer += "{br}@:separator:";
        break;
      case "NEWLINE":
        buffer += "{br}";
        break;
      default:
        buffer += "{br}" + data[i];
    }
  }
  // footer
  buffer += "{br}@:separator:";
  buffer += "{br}";
  buffer += "{br}" + $SETTINGS.branch.name.toUpperCase();
  buffer +=
    "{br}{s}" + $SETTINGS.string.address_of_branch.toUpperCase() + "{/s}";
  buffer += "{br}{s}Phone   : " + $SETTINGS.string.phone_branch + "{/s}";
  if ($SETTINGS.string.hotline.length) {
    buffer += "{br}{s}Hotline : " + $SETTINGS.string.hotline + "{/s}";
  }

  // printer space
  buffer += "{br}{br}";
  //buffer += "{br}-- cut here --";
  buffer += "{br}{br}";
  buffer += ($SETTINGS.print_size == "small" ? "{/s}" : "") + "{/left}";
  return buffer.replace(/@:separator:/g, line);
}

function printer_print_buffer(data) {
  //var line        = '------------------------------------------';
  var line = ".........................................."; // 42 dot
  var line_bottom = "__________________________________________";
  var line_feed = "{br}";
  var $prn_header =
    $SETTINGS.print_header +
    (data.status_prn !== undefined ? " " + data.status_prn : "");

  if ($SETTINGS.print_size == "normal") {
    line = line.substr(0, 24);
    line_bottom = line_bottom.substr(0, 24);
  }

  var number = 0;
  var buffer = "";

  //var guest       = (data.title + ' ' + data.fname + ' ' +data.lname).toUpperCase();
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
  var promosum = parseFloat(data.promo); // discount+promo_p
  var namelist = "";
  var surcharges = "";

  // check for support of namelist column
  if (data.hasOwnProperty("namelist")) {
    namelist = data.namelist;
    namelist = namelist.replace(/\([^\)]*\)/g, ""); // remove age
    namelist = namelist.replace(/<[^>]*>/g, ",").replace(/([\-+#.()])+?/g, ""); // remove html tag

    // format namelist
    namelist = namelist.split(",");
    for (var j = 0; j < namelist.length; j++) {
      var name = namelist[j].trim();

      if (name.length > 4) {
        number++;
        buffer += line_feed + number + ". " + name.split("|")[0].toUpperCase();
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
        buffer += line_feed + "+ " + name.toUpperCase();
      }
    }
    // remove last {br}
    surcharges = buffer;
  }

  var total = data.currency + " " + format_currency(data.totalsales, false);
  var payment = data.val_payment.toUpperCase();
  payment = payment.replace("PAY ON TOUR", label_pot.toUpperCase());

  // formating payment workaround
  // 2019-04-11
  var arr_payment = payment.replace(/:/g, " ").split(", "); // bersihkan titik dua dan pisah hasil dari group concat
  var tmp_buffer = "";
  for (var i = 0; i < arr_payment.length; i++) {
    var arr_word = arr_payment[i].split(" ");
    for (var j = 0; j < arr_word.length; j++) {
      if (!isNaN(parseInt(arr_word[j].substr(0, 1)))) {
        // is number?
        tmp_buffer += format_currency(arr_word[j], false) + " ";
      } else {
        tmp_buffer += arr_word[j] + " ";
      }
    }
    tmp_buffer = tmp_buffer.trim() + ", ";
  }
  tmp_buffer = tmp_buffer.trim();
  tmp_buffer = tmp_buffer.substr(0, tmp_buffer.length - 1);
  payment = tmp_buffer;

  // setup
  pax =
    parseInt(data.paxa) +
    parseInt(data.paxc) +
    parseInt(data.paxi) +
    " (A:" +
    data.paxa +
    ", C:" +
    data.paxc +
    ", I:" +
    data.paxi +
    ")";

  //buffer = line_feed + "{b}VOUCHER " + (data.status_prn == undefined ? '' : data.status_prn) + "{/b}" + line_feed
  buffer = line_feed + "{b}" + $prn_header + "{/b}" + line_feed;
  buffer += "{left}" + ($SETTINGS.print_size == "small" ? "{s}" : "");
  if (data.stat == "CANCELED") {
    buffer += line_feed + "STATUS: " + data.stat;
  }
  buffer += line_feed + "@:separator:";
  buffer += line_feed + "Code: " + data.voucher;
  buffer += line_feed + "Date: " + data.date_tr;
  if (data.barcode !== undefined) {
    buffer += line_feed + "Barcode: " + data.barcode;
  }
  buffer += line_feed + "@:separator:";
  buffer += line_feed + "Pax: " + pax;
  buffer += line_feed + "Clients name: ";
  buffer += line_feed + " * " + data.guestname.toUpperCase();
  if (namelist.length) {
    buffer += namelist;
  }
  buffer += line_feed + "@:separator:";
  buffer +=
    line_feed +
    "Excursion   : " +
    (typeof data.excursion_code !== "undefined" ? data.excursion_code : "");
  buffer += line_feed + " * " + data.excursion_alias.toUpperCase().trim();
  buffer += line_feed + "Tour date   : " + data.pickup.split(" ")[0];
  if (typeof data.meeting_point !== "undefined") {
    if (data.meeting_point.trim().length != 0) {
      buffer += line_feed + "Pickup point: " + data.meeting_point;
    }
  }
  buffer += line_feed + "Pickup time : " + data.pickup.split(" ")[1];
  if (typeof data.remark_supplier !== "undefined") {
    // menampilkan remark guest
    if (data.remark_supplier.trim().length != 0) {
      buffer += line_feed + "Notes: " + data.remark_supplier.toUpperCase(); //remark_guest dan remark_supplier (internal) tertukar
    }
  }
  buffer += line_feed + "@:separator:";
  buffer += line_feed + "Hotel: ";
  buffer += line_feed + " * " + data.hotel.toUpperCase().split("/")[0].trim();
  buffer += line_feed + "Room numb: " + data.hotel_room.toUpperCase();
  buffer += line_feed + "@:separator:";
  buffer +=
    line_feed +
    "Excursion : " +
    data.currency +
    " " +
    format_currency(data.salesrate, false);
  if (promosum > 0) {
    buffer +=
      line_feed +
      "Discount  : " +
      data.currency +
      " -" +
      format_currency(promosum, false);
  }
  if (surcharges.length) {
    buffer += line_feed + "Surcharge :";
    buffer += surcharges;
  }
  buffer += line_feed + "@:separator:";
  buffer += line_feed + "Total payment: " + total;
  buffer += line_feed + "Method:";
  buffer += line_feed + payment;
  if ($SETTINGS.string.cancellation.length) {
    if ($SETTINGS.string.footer_branch_company == "true") {
      buffer += line_feed + "@:separator:";
      buffer += line_feed + "" + $f_settings.text_cx_branch.get();
    } else {
      var cancellation = $SETTINGS.string.cancellation.split("|");
      buffer += line_feed + "@:separator:";
      for (var i = 0; i < cancellation.length; i++) {
        buffer += line_feed + "" + cancellation[i];
      }
    }
  }
  buffer += line_feed + "@:separator:";
  buffer += line_feed + "Rep name   : " + data.rep.toUpperCase();
  buffer += line_feed + "Agent      : " + data.agent.toUpperCase();
  if (typeof data.agent_group !== "undefined") {
    if (data.agent_group.trim().length != 0) {
      buffer += line_feed + "Agent group: " + data.agent_group.toUpperCase();
    }
  }
  buffer += line_feed + "Supplier   : " + data.supplier.toUpperCase();
  buffer += line_feed + "@:separator:";
  buffer += line_feed;
  buffer += line_feed;
  buffer += line_feed;
  buffer += line_feed;
  buffer += line_feed + "Sign:" + line_bottom.slice(0, -5);

  if ($SETTINGS.string.footer_branch_company == "true") {
    buffer += line_feed + "" + $SETTINGS.branch.name.toUpperCase();
    buffer += line_feed + "" + $SETTINGS.string.address_of_branch.toUpperCase();
    buffer += line_feed + "Phone   : " + $SETTINGS.string.phone_branch;
  }

  if ($SETTINGS.string.hotline.length) {
    buffer += line_feed + "Hotline : " + $SETTINGS.string.hotline;
  }
  if ($SETTINGS.string.other_information.length) {
    var others = $SETTINGS.string.other_information.split("|");
    //buffer += line_feed+"@:separator:"
    for (var i = 0; i < others.length; i++) {
      buffer += line_feed + "" + others[i];
    }
  }
  buffer += line_feed;
  buffer += line_feed;
  buffer += line_feed;
  buffer += line_feed + ".................cut here.................";
  buffer += line_feed;
  buffer += line_feed;
  buffer += line_feed;
  buffer += ($SETTINGS.print_size == "small" ? "{/s}" : "") + "{/left}";

  //default layout
  /*
    buffer  = line_feed+"{w}{b}VOUCHER{/b}{/w}"+line_feed
    buffer += "{left}"+($SETTINGS.print_size=='small' ? '{s}' : '');
    buffer += line_feed+"@:separator:"
    buffer += line_feed+"Numb: "+data.voucher
    buffer += line_feed+"Date: "+data.date_tr
    buffer += line_feed+"@:separator:"
    buffer += line_feed+"{b}"+data.excursion_alias.toUpperCase()+"{/b}"
    buffer += line_feed+"@:separator:"
    buffer += line_feed+""+data.guestname.toUpperCase();
    buffer += line_feed+""+pax
    if(namelist.length) {
    buffer  += line_feed+"@:separator:"
    buffer  += line_feed+"Guest list:"
    buffer  += namelist
    }

    buffer += line_feed+"@:separator:"
    buffer += line_feed+""+data.hotel.toUpperCase()
    buffer += line_feed+"Room   : "+data.hotel_room.toUpperCase()
    buffer += line_feed+"Pickup : "+data.pickup

    buffer += line_feed+"@:separator:"
    buffer += line_feed+"Excursion : "+data.currency+' '+data.salesrate

    if(promosum>0) {
    buffer += line_feed+'Discount  : '+data.currency+' -'+promosum
    }

    if(surcharges.length) {
    buffer  += line_feed+"Surcharge :"
    buffer  += surcharges
    }

    buffer += line_feed+"@:separator:"
    buffer += line_feed+"Total payment: {b}"+total+"{/b}"
    buffer += line_feed+"@:separator:"
    buffer += line_feed+"Method:"
    buffer += line_feed+""+data.val_payment
    if($SETTINGS.string.cancellation.length) {
        var cancellation = $SETTINGS.string.cancellation.split('|');
            buffer += line_feed+"@:separator:"
        for(var i=0; i<cancellation.length; i++) {
            buffer += line_feed+""+cancellation[i];
        }
    }
    buffer += line_feed+"@:separator:"
    buffer += line_feed+"Rep.Name : "+data.rep.toUpperCase()
    buffer += line_feed+"Agent    : "+data.agent.toUpperCase()
    buffer += line_feed+"Supplier : "+data.supplier.toUpperCase()
    buffer += line_feed+"@:separator:"
    buffer += line_feed
    buffer += line_feed
    buffer += line_feed
    buffer += line_feed
    buffer += line_feed+"SIGN:"+(line_bottom.slice(0,-5))
    buffer += line_feed+""+$SETTINGS.branch.name.toUpperCase()
    buffer += line_feed+""+$SETTINGS.string.address_of_branch.toUpperCase()
    buffer += line_feed+"Phone   : "+$SETTINGS.string.phone
    if($SETTINGS.string.hotline.length) {
    buffer += line_feed+"Hotline : "+$SETTINGS.string.hotline
    }
    if($SETTINGS.string.other_information.length) {
        var others = $SETTINGS.string.other_information.split('|');
            buffer += line_feed+"@:separator:"
        for(var i=0; i<others.length; i++) {
            buffer += line_feed+""+others[i];
        }
    }
    buffer += line_feed
    buffer += line_feed
    buffer += line_feed
    buffer += line_feed
    buffer += line_feed+"-- cut here --"
    buffer += line_feed
    buffer += line_feed
    buffer += ($SETTINGS.print_size=='small' ? '{/s}' : '')+"{/left}"
    */

  return buffer.replace(/@:separator:/g, line);
}

function get_company_logo(initial) {
  var initial_x =
    identify_company($SETTINGS.company.id) == "DEMO"
      ? "sts"
      : initial.toLowerCase();
  var file = {
    //path:   $SETTINGS.server + '/images/logo/logom.png',
    path: "img/logo_" + initial.toLowerCase() + ".jpg",
    height: 128,
    width: 300,
  };
  return file;
}

function printer_print_image(file, item, callback) {
  if (string_to_boolean($SETTINGS.print_company_logo)) {
    var image = new Image();
    image.src = file.path;
    image.onload = function () {
      var canvas = document.createElement("canvas");
      canvas.height = file.height;
      canvas.width = file.width;

      var context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);

      var imageData = canvas
        .toDataURL("image/jpeg")
        .replace(/^data:image\/(png|jpg|jpeg);base64,/, ""); //remove mimetype

      window.DatecsPrinter.printImage(
        imageData, //base64
        canvas.width,
        canvas.height,
        1,
        function () {
          callback(item);
        },
        function (error) {
          $app.alert(error.message, $STRING.info_warning);
          callback(item);
        }
      );
    };
  } else {
    callback(item);
  }
}

function printer_print_text(text, callback) {
  console.log(text);
  window.DatecsPrinter.printText(
    text,
    "ISO-8859-1",
    function () {
      callback();
    },
    function (error) {
      $app.alert(error.message, $STRING.info_warning);
    }
  );
}

function printer_print_ticket(idx_mf, product_id, note, callback) {
  var line = "................................";
  var logo = get_company_logo($SETTINGS.initial_company);
  var line_feed = "{br}";
  var input = "";

  $status.set("Print Ticket LP");
  $loader.show();

  var module = get_core_module();
  var serialize = "act=lp-find-ticket";
  serialize += "&idx_mf=" + idx_mf;
  serialize += "&productid=" + product_id;

  input = "";

  console.log(serialize);
  $.ajax({
    url: module,
    data: serialize,
    success: function (r) {
      var d = $.parseJSON(r);

      console.log(d, d.length);
      if (d.length > 0) {
        if (Array.isArray(d)) {
          var $i = 0;

          $.each(d, function (m) {
            var dtEntradas = d[m];
            console.log(dtEntradas);
            if (dtEntradas.totalbonosentradas !== "0") {
              var ss = dtEntradas.ticketbonos;
              var tt = JSON.parse(ss.replace(/\\/g, ""));

              printer_print_image(logo, "", function () {
                input =
                  line_feed + "{b}" + note + "{/b}" + line_feed + line_feed;
                input += "{b}" + dtEntradas.nombreproducto + "{/b}" + line_feed;
                input +=
                  "{s}" + dtEntradas.descripcionproducto + "{/s}" + line_feed;
                input +=
                  "{left}" + ($SETTINGS.print_size == "small" ? "{s}" : "");
                var _barcode = "";

                for (const mmm in tt) {
                  var $mmm = tt[mmm];
                  console.log($mmm);
                  for (const mmmm in $mmm) {
                    if (mmmm === "Barcode") {
                      if ($mmm[mmmm] !== "") {
                        _barcode = $mmm[mmmm];
                      }
                    } else {
                      input +=
                        line_feed + mmmm.toUpperCase() + " : " + $mmm[mmmm];
                    }
                  }
                  input += line_feed;
                }

                input += line_feed;
                input +=
                  ($SETTINGS.print_size == "small" ? "{/s}" : "") + "{/left}";

                var input2 = "";
                printer_print_text(input, function () {
                  printQRCodeJS(_barcode, function (r) {
                    input2 =
                      "{left}" + ($SETTINGS.print_size == "small" ? "{s}" : "");
                    // input2 += _barcode
                    input2 += line_feed;
                    input2 += line_feed;
                    input2 +=
                      line_feed + ".................cut here.................";
                    input2 += line_feed;
                    input2 += line_feed;
                    input2 += line_feed;
                    input2 +=
                      ($SETTINGS.print_size == "small" ? "{/s}" : "") +
                      "{/left}";

                    printer_print_text(input2, function () { });
                  });
                });
              });
              //for (const mm in tt.Entradas) {

              //}
            } else {
              printer_print_image(logo, "", function () {
                input =
                  line_feed +
                  "{b}" +
                  $SETTINGS.print_header +
                  "{/b}" +
                  line_feed;
                input +=
                  "{left}" + ($SETTINGS.print_size == "small" ? "{s}" : "");
                for (const mm in dtEntradas) {
                  if (typeof dtEntradas[mm] !== "object") {
                    if (mm === "barcode") {
                    } else if (mm === "note" || mm == "totalbonosentradas") {
                    } else {
                      if (dtEntradas[mm].length > 24) {
                        input += line_feed + mm.toUpperCase() + " :";
                        input += line_feed + dtEntradas[mm];
                      } else {
                        input +=
                          line_feed + mm.toUpperCase() + " : " + dtEntradas[mm];
                      }
                    }
                  }
                }
                input += line_feed;
                input +=
                  ($SETTINGS.print_size == "small" ? "{/s}" : "") + "{/left}";
                var input2 = "";

                printer_print_text(input, function () {
                  printQRCodeJS(dtEntradas["barcode"], function (r) {
                    input2 =
                      "{left}" + ($SETTINGS.print_size == "small" ? "{s}" : "");
                    //input2 += dtEntradas['barcode']
                    input2 += line_feed;
                    input2 += line_feed;
                    input2 +=
                      line_feed + ".................cut here.................";
                    input2 += line_feed;
                    input2 += line_feed;
                    input2 += line_feed;
                    input2 +=
                      ($SETTINGS.print_size == "small" ? "{/s}" : "") +
                      "{/left}";

                    printer_print_text(input2, function () { });
                  });
                });
              });
            }
          });

          $loader.hide();
          //callback(buffer);
        }
      } else {
        $loader.hide();
        $app.alert(
          $STRING.info_data_not_found,
          $STRING.info_important,
          function () {
            //callback()
          }
        );
      }
    },
  });
}

function printMyBarcode(data, callback) {
  /* code type
    UPC-A = 65 ///--- tidak support
    UPC-E = 66 --xx
    EAN13 (JAN13) = 67--xx
    EAN 8 (JAN8) = 68--xx
    CODE 39 = 69 --ok
    ITF = 70--- ok
    CODABAR (NW-7) = 71 --xx
    CODE 93 = 72 -xx
    CODE 128 = 73 -ok
    PDF417 = 74 -xx
    CODE 128 Auto = 75--xx
    EAN 128 = 76
    */
  //var databarcode=data[0].voucher.split('/')[1]
  console.log("Print barcode", $SETTINGS);
  var ln_barcode = parseInt($SETTINGS.barcode_length);
  //var databarcode  = data.barcode;
  var databarcode =
    data[0].barcode != undefined ? data[0].barcode : "49116500000000000001";
  console.log("Print barcode data", data, databarcode, databarcode.length);

  var setbarcode = {
    dpalign: 1,
    dpsmall: true,
    dpscale: 2,
    dphri: parseInt($SETTINGS.barcode_hri),
    dpheight: 100,
  };

  if ($SETTINGS.print_barcode == "true") {
    window.DatecsPrinter.setBarcode(
      setbarcode.dpalign,
      setbarcode.dpsmall,
      setbarcode.dpscale,
      setbarcode.dphri,
      setbarcode.dpheight,
      function () {
        window.DatecsPrinter.printBarcode(
          $SETTINGS.barcode_type, //here goes the barcode type code
          databarcode.substring(0, ln_barcode), //your barcode data
          function () {
            callback();

            var sparator = "{br}{br}{br}{br}{br}";
            printer_print_text(sparator, function () { });
          },
          function () {
            $app.alert(error.message, $STRING.info_warning);
          }
        );
      },
      function () {
        $app.alert(error.message, $STRING.info_warning);
      }
    );
  }
}

function printQRCode(data, callback) {
  if ($SETTINGS.tpv_qr === "true") {
    //window.DatecsPrinter.setBarcode(1, false, 2, 0, 100);
    window.DatecsPrinter.setBarcode(1, false, 2, 0, 100);
    window.DatecsPrinter.printQRCode(
      4, // qr code size
      4, // qr code error correction
      data, // barcode data
      function () {
        callback(0);
        console.log("Print QRCode", data);
      },
      function () {
        $app.alert(error.message, $STRING.info_warning);
      }
    );
  } else {
    callback();
  }
}

function printQRCodeJS(data, callback) {
  if ($SETTINGS.tpv_qr === "true") {
    var canvas = document.createElement("canvas");
    canvas.height = parseInt($SETTINGS.tpv_qrsize) * 105;
    canvas.width = parseInt($SETTINGS.tpv_qrsize) * 105;

    QRCode.toCanvas(canvas, data, function (error) {
      if (error) {
        console.error(error);
        $app.alert(error, $STRING.info_warning);
      } else {
        console.log("success!");
        var imageData = canvas
          .toDataURL("image/jpeg")
          .replace(/^data:image\/(png|jpg|jpeg);base64,/, ""); //remove mimetype

        window.DatecsPrinter.printImage(
          imageData, //base64
          canvas.width,
          canvas.height,
          1,
          function () {
            callback();
          },
          function (error) {
            $app.alert(error.message, $STRING.info_warning);
            callback();
          }
        );
      }
    });
  } else {
    callback();
  }
}

function printer_print_text(text, callback) {
  console.log(text);
  window.DatecsPrinter.printText(
    text,
    "ISO-8859-1",
    function () {
      callback();
    },
    function (error) {
      $app.alert(error.message, $STRING.info_warning);
    }
  );
}

function printer_device_disconnect(callback) {
  window.DatecsPrinter.disconnect(
    function () {
      callback();
    },
    function (error) {
      $app.alert(error.message, $STRING.info_warning);
    }
  );
}

function printer_device_connect(device, callback) {
  if (device) {
    window.DatecsPrinter.connect(
      device.address,
      function (status) {
        console.log(device.name + ": " + status);
        callback();
      },
      function () {
        $app.alert(
          "Turn on your printer before printing!<br>" +
          "Failed to connect: <b>" +
          device.name +
          "</b>",
          $STRING.info_important
        );
      }
    );
  } else {
    $app.alert("Printer not selected!", $STRING.info_important);
  }
}

function printer_device_buffer(data, i) {
  var device_name = data.name;
  var divice_mac = data.address;
  var buffer = "";

  buffer += "<li data-item='" + JSON.stringify(data) + "'>";
  buffer +=
    '<label class="label-checkbox item-content" style="padding-left:10px;">';
  buffer +=
    '    <input type="checkbox" value="' +
    divice_mac +
    '" ' +
    (i == 0 ? 'checked="checked"' : "") +
    ">";
  buffer += '    <div class="item-media">';
  buffer += '        <i class="icon icon-form-checkbox"></i>';
  buffer += "    </div>";
  buffer += '    <div class="item-inner">';
  //buffer += '        <div class="item-title" style="margin-top:-10px; white-space:normal;">'+device_name+'</div>'
  buffer +=
    '        <div class="item-title" style="margin-top:-10px; white-space:normal;">';
  buffer += "         <p ><b>" + device_name + "</b></p>";
  buffer += '         <p style="line-height:0;">' + divice_mac + "</p>";
  buffer += "        </div>";
  buffer += "    </div>";
  buffer += "</label>";
  buffer += "</li>";

  return buffer;
}

function printer_device_list($data, $title) {
  /*
        LISTING PAIRED BLE DEVICE
    
        This method will showing only all paired BLE device
        even when the devices is off.
    */
  var $_data = [];

  if (Array.isArray($data)) {
    $_data = $data;
  } else {
    $_data.push($data);
  }
  if (device.platform != "iOS") {
    if (window.DatecsPrinter) {
      window.DatecsPrinter.listBluetoothDevices(
        function (devices) {
          var $table = $("#printer-list");
          var $button = $("#printer-print");
          var buffer = "";
          if (devices.length) {
            for (var i = 0; i < devices.length; i++) {
              buffer += printer_device_buffer(devices[i], i);
            }
          } else {
            buffer += '<li style="color:red;">Printer not found</li>';
          }
          $table.empty();
          $table.append(buffer);
          $button.data("title", $title);
          $button.data("item", $_data);

          $app.popup(".popup-printer");
          console.log(devices);
        },
        function (error) {
          console.log(JSON.stringify(error));
          $app.alert(
            "Couldn't find any paired bluetooth printer.<br>" +
            "Please check your bluetooth connection!",
            $STRING.info_warning
          );
        }
      );
    } else {
      $app.alert("Plugin not installed!", $STRING.info_warning);
    }
  } else {
    print_iOS($_data, $title);
  }
}
