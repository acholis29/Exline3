var $MODE = "offline";

var $SETTINGS = {
  company: {
    id: "",
    name: "",
  },
  branch: {
    id: "",
    name: "",
  },
  user: {
    id: "",
    name: "",
  },
  currency: {
    id: "",
    name: "",
  },
  market: {
    id: "",
    name: "",
  },
  language: {
    id: "",
    name: "",
  },
  company_active_date: "",
  initial_company: "",
  initial_user: "",
  last_sync_db_daily: "",
  last_sync_db_master: "",
  last_sync_transact: "",
  length_of_voucher_number: 9,
  payment_manual: false /* GVS 3.0.33 */,
  required_guest_details: false,
  server: "" /* for demo use http://fo.gvindonesia.local/ */,
  discount_before_surcharge: false,
  discount_split_view: false,
  discount_validation: false /* 3.0.40 */,
  last_minute_booking: 0,
  payment_combinable: false,
  payment_default: "ca" /* GKT 3.0.49 */,
  print_company_logo: false,
  print_size: "normal",
  print_header: "VOUCHER",
  print_barcode: false,
  barcode_type: "72",
  barcode_length: "12",
  barcode_hri: "0",
  tax_for_credit_card: 0,
  voucher_edit: false /* GVS 3.0.36 */,
  voucher_manual: false /* DER 3.0.37 */,
  string: {
    /* 	
			safe zone!
			will not affect the application algorithm 
		*/
    address_of_branch: "",
    address_of_company: "",
    cancellation: "",
    hotline: "",
    phone: "",
    other_information: "",
  },
};

/* 
var $MODULE = {
	get_voucher: {
		online: 	"excursion.asmx/booking_get_voucher?",
		offline:	"get-voucher"
	},
	list_location: {
		online: 	"excursion.asmx/booking_form_location?",
		offline: 	"list-location"
	},
	list_excursion: {
		online: 	"excursion.asmx/booking_form_excursion?",
		offline:	"list-excursion"
	},
	list_agent: {
		online: 	"excursion.asmx/booking_form_agent?",
		offline:	"list-agent"
	},
	list_hotel: {
		online: 	"excursion.asmx/booking_form_hotel?",
		offline:	"list-hotel"
	},
	list_allotment: {
		online: 	"excursion.asmx/booking_form_allotment?",
		offline:	"list-allotment"
	},
	list_maxpax: {
		online: 	"excursion.asmx/booking_form_maxpax?",
		offline:	"list-maxpax"
	},
	get_price_pax: {
		online: 	"excursion.asmx/booking_get_price_pax?",
		offline:	"get-price-pax"
	}
}

function prepare(command) {
	switch($MODE) {
		case 'offline':
			return $MODULE[command]['offline'];
		case 'online':
			return $MODULE[command]['online'];
		default:
			alert('Unknown prepare command!');
	}
}

function execute(command, result) {
	$loader.show();
	switch($MODE) {
		case 'offline':
			window.webkit.messageHandlers.app.postMessage(command);
			break;
		case 'online':
			var serialize	= command.query;
				serialize  += '&shared_key='+'3E62FCDB-D6AD-465F-ABA9-69197BEC02B1';
				serialize  += '&xml='+'false';
				
				$.ajax({
					url: $SETTINGS.server + command.function + serialize
				}).done(function(data) {
					result(data);
				});	
			break;
		default:
			alert('Unknown execute command!');
	}
}
*/
//function appendDATA(value) {data.push(value); alert(value);}
//function getAPI(name, parameter) {window.location = "api://"+name+"?"+parameter;}
//function getSQL(name, parameter, callback) {window.location = "sql://"+name+"?"+parameter;}

// CORDOVA
var DB_FILE;
var $db;

function db_initialize(dbFile, success, error) {
  var wwwPath = window.location.pathname;
  var basePath = "file://" + wwwPath.substring(0, wwwPath.length - 10);
  console.log(basePath);
  $status.set("INITIALIZE DATABASE");

  db_find(dbFile, function (exist) {
    if (exist) {
      //alert('db already copied')
      db_open();
      success();
    } else {
      db_copy(basePath, dbFile, success, error);
    }
  });
}

function db_remove(dbFile, callback) {
  var dataPath = cordova.file.dataDirectory;

  window.resolveLocalFileSystemURL(dataPath, function (dir) {
    dir.getFile(dbFile, { create: false }, function (fileEntry) {
      fileEntry.remove(
        function (file) {
          //$loader.hide();
          alert("Database removed successfuly!");
          callback();
        },
        function (e) {
          //$loader.hide();
          alert("remove error " + e.code);
          callback();
        }
      );
    });
  });
}
function db_find(dbFile, exist) {
  var dataPath = cordova.file.dataDirectory;
  console.log(dataPath + dbFile);
  window.resolveLocalFileSystemURL(
    dataPath + dbFile,
    function (dbFile) {
      //alert('database was found')
      exist(true);
    },
    function () {
      //alert('database was not found')
      exist(false);
    }
  );
}

function db_open() {
  $status.set("CONNECTING DATABASE");
  $db = sqlitePlugin.openDatabase({ name: DB_FILE });
}

function db_copy(basePath, dbFile, success, error) {
  $status.set("CREATING DATABASE");

  window.resolveLocalFileSystemURL(
    basePath + dbFile,
    function (fileDB) {
      //alert('success! database was found')

      window.requestFileSystem(
        LocalFileSystem.PERSISTENT,
        0,
        function (fileSystem) {
          var dataPath = cordova.file.dataDirectory;
          window.resolveLocalFileSystemURL(
            dataPath,
            function (dir) {
              fileDB.copyTo(
                dir,
                dbFile,
                function () {
                  //alert('copying was successful')
                  db_open();
                  success();
                },
                function () {
                  //alert('unsuccessful copying')
                  error();
                }
              );
            },
            function () {
              //alert('destination path failure')
              error();
            }
          );
        },
        function (e) {
          //alert(e)
          error();
        }
      );
    },
    function () {
      //alert('failure! database was not found')
      error();
    }
  );
}

function get_connection_status() {
  var networkState = navigator.connection.type;

  var states = {};
  states[Connection.UNKNOWN] = "Unknown connection";
  states[Connection.ETHERNET] = "Ethernet connection";
  states[Connection.WIFI] = "WiFi connection";
  states[Connection.CELL_2G] = "Cell 2G connection";
  states[Connection.CELL_3G] = "Cell 3G connection";
  states[Connection.CELL_4G] = "Cell 4G connection";
  states[Connection.CELL] = "Cell generic connection";
  states[Connection.NONE] = "No network connection";

  return states[networkState];
}
