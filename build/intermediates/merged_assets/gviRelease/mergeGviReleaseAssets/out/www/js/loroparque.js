//const { json } = require("stream/consumers");

var dbwebsql_lp = openDatabase('db_lp', '1.0', 'DB Loroparqu', 5 * 1024 * 1024);
var ssql_dbwebsql = '';
var $lp = function () {
    return {
        init: function (param, callback) {
            var is_online = $MODE == 'online' ? true : false;
            $status.set('LOGIN TO LOROPARQUE');

            $.ajax({
                url: param.site.url + 'IniciarLog',
                data: JSON.stringify(param.login),
                type: "POST",
                processData: false,
                contentType: 'application/json',
                success: function (r) {
                    console.log(r)
                    callback(r);

                    if (r.DatosResult == null) {
                        $loader.hide();
                        $app.modal({
                            title: 'Error Login',
                            text: 'LoroParque (No Token)',
                            buttons: [
                                {
                                    text: 'Reset',
                                    bold: true,
                                    onClick: function () {
                                        checkout_reset(is_online, function () {
                                            $main_view.router.back();
                                            $loader.hide();
                                        });


                                    }
                                },
                                {
                                    text: 'Iqnore',
                                    onClick: function () {
                                        $loader.hide();
                                    }
                                }]
                        });
                    } else {
                        //--- create table for tmp trx

                        dbwebsql_lp.transaction(function (tx) {

                            var tbl_trxheader = " CREATE TABLE IF NOT EXISTS [trx_header] ( ";
                            tbl_trxheader += " [idx_mf], ";
                            tbl_trxheader += " [ConexionIacpos], ";
                            tbl_trxheader += " [Idioma], ";
                            tbl_trxheader += " [NumeroEntradasTotal], ";
                            tbl_trxheader += " [Fecha], ";
                            tbl_trxheader += " [Hora], ";
                            tbl_trxheader += " [ImporteInicial], ";
                            tbl_trxheader += " [TotalReserva], ";
                            tbl_trxheader += " [TipoReserva], ";
                            tbl_trxheader += " [ClaveReserva], "; 0
                            tbl_trxheader += " [LetraLocalizador], ";
                            tbl_trxheader += " [CodigoValidacionUnico], ";
                            tbl_trxheader += " [EnlaceMenu], ";
                            tbl_trxheader += " [clienteAPI], ";
                            tbl_trxheader += " [clienteCompra_Nombre], ";
                            tbl_trxheader += " [clienteCompra_Contrasena], ";
                            tbl_trxheader += " [clienteCompra_NombreContacto], ";
                            tbl_trxheader += " [clienteCompra_PersonaPago], ";
                            tbl_trxheader += " [clienteCompra_Telefono]";
                            tbl_trxheader += " ) ";

                            tx.executeSql(tbl_trxheader);


                            var tbl_trxitem = " CREATE TABLE IF NOT EXISTS [trx_item] ( ";
                            tbl_trxitem += " [idx_mf], ";
                            tbl_trxitem += " [ConexionIacpos], ";
                            tbl_trxitem += " [EnlaceMenu], ";
                            tbl_trxitem += " [idx_trx], ";
                            tbl_trxitem += " [EsBono], ";
                            tbl_trxitem += " [ProductoId], ";
                            tbl_trxitem += " [BonoId], ";
                            tbl_trxitem += " [NombreProducto], ";
                            tbl_trxitem += " [DescripcionProducto], ";
                            tbl_trxitem += " [Cantidad], ";
                            tbl_trxitem += " [GrupoInternet], ";
                            tbl_trxitem += " [NombreGrupoInternet], ";
                            tbl_trxitem += " [PrecioBruto], ";
                            tbl_trxitem += " [PvpProducto], ";
                            tbl_trxitem += " [FechaVisita], ";
                            tbl_trxitem += " [AforosConsumidos_IdRecinto], ";
                            tbl_trxitem += " [AforosConsumidos_NombreRecinto], ";
                            tbl_trxitem += " [AforosConsumidos_DescripcionRecinto], ";
                            tbl_trxitem += " [AforosConsumidos_FechaVisita], ";
                            tbl_trxitem += " [AforosConsumidos_HoraVisita], ";
                            tbl_trxitem += " [AforosConsumidos_TotalAforo], ";
                            tbl_trxitem += " [AforosConsumidos_TipoAforo],";
                            tbl_trxitem += " [Note]";
                            tbl_trxitem += " ) ";

                            tx.executeSql(tbl_trxitem);

                            var tbl_trxitemBono = " CREATE TABLE IF NOT EXISTS [trx_itemBono] ( ";
                            tbl_trxitemBono += " [idx_mf], ";
                            tbl_trxitemBono += " [idx_trx], ";
                            tbl_trxitemBono += " [Note]";
                            tbl_trxitemBono += " ) ";

                            tx.executeSql(tbl_trxitemBono);


                            var ssql_dbwebsql = "CREATE TABLE IF NOT EXISTS [tiket_LP] (";
                            ssql_dbwebsql += "[NumeroTicket],";
                            ssql_dbwebsql += "[Cantidad],";
                            ssql_dbwebsql += "[ProductoId],";
                            ssql_dbwebsql += "[NombreProducto],";
                            ssql_dbwebsql += "[DescripcionProducto],";
                            ssql_dbwebsql += "[EsBono] [nvarchar](50),";
                            ssql_dbwebsql += "[TotalBonosEntradas],";
                            ssql_dbwebsql += "[TicketBonos],";
                            ssql_dbwebsql += "[Barcode],";
                            ssql_dbwebsql += "[idx_mf],";
                            ssql_dbwebsql += "[Note]";
                            ssql_dbwebsql += ") ";



                        });

                    }


                },
                error: function (e) {

                    $loader.hide();
                    $app.modal({
                        title: 'Error',
                        text: 'Login Loroparque',
                        buttons: [
                            {
                                text: 'Reset',
                                bold: true,
                                onClick: function () {
                                    checkout_reset(is_online, function () {
                                        $main_view.router.back();
                                        $loader.hide();
                                    });


                                }
                            },
                            {
                                text: 'Iqnore',
                                onClick: function () {
                                    $loader.hide();
                                }
                            }]
                    });
                }
            });


        },
        HIBDisponible: function (param, month, year, callback) {

            var lastdate = new Date(year, month, 0).getDate();

            $return_HIBDisponible = '';
            $paramdispo.ConexionIacpos = param.conexios;
            $paramdispo.EnlaceMenuId = param.enlace_menu;
            $paramdispo.GruposInternet = param.group_internet;
            $paramdispo.Fecha = year + '-' + month + '-01';
            $paramdispo.FechaHasta = year + '-' + month + '-' + lastdate;
            $paramdispo.clienteAPI = $SETTINGS.loroparque.clienteAPI;
            $paramdispo.clienteCompra.Nombre = $SETTINGS.loroparque.general.Nombre;
            $paramdispo.clienteCompra.Contrasena = $SETTINGS.loroparque.general.Contrasena;

            $SETTINGS.loroparque.general.EnlaceMenuId = param.enlace_menu;
            $SETTINGS.loroparque.general.GruposInternet = param.group_internet;


            console.log(JSON.stringify($paramdispo));

            $.ajax({
                url: $SETTINGS.loroparque.site.url + 'HIBDisponible',
                data: JSON.stringify($paramdispo),
                type: "POST",
                processData: false,
                contentType: 'application/json',
                success: function (r) {
                    if (r.Mensajes.length !== 0) {
                        console.log(r.Mensajes[0]);
                        $loader.hide();
                        $app.alert(r.Mensajes[0].DescripcionMensaje, 'ERROR: ' + r.Mensajes[0].CodigoMensaje);
                        return false;
                    } else {
                        $return_HIBDisponible = r;
                        callback(r);
                    };
                },
                error: function (e) {
                    console.log(e)
                    $app.alert(e.statusText, 'Error');
                    $loader.hide();

                }
            });

        },
        allotment: function (result, product_id, month, year, callback) {
            /*
                
            */
            var tglF = parseInt($paramdispo.Fecha.replace(/-/g, ''));
            var tglT = parseInt($paramdispo.FechaHasta.replace(/-/g, ''));

            var $prod_lp = '';

            $prod_lp = $(result.DatosResult.AforosDisponibles[0].GruposInternetIdDisponible).filter(function (i, n) { return n.ProductoId === product_id; });

            console.log($prod_lp)

            if ($prod_lp.length !== 0) {

                if ($prod_lp[0].BonoId == '') {
                    if ($prod_lp[0].ProductosRecintos.length !== 0) {
                        $lp.allotment_cal($prod_lp[0].ProductosRecintos, tglF, tglT, month, year);
                    } else {
                        $app.alert('Tour Date not available', 'Warning');
                    }
                } else {

                    //---- BonoID 
                    $SETTINGS.loroparque.bono_id = $prod_lp[0].BonoId;
                    $SETTINGS.loroparque.ProductosBono = $prod_lp[0].ProductosBono;

                    if ($prod_lp[0].ProductosBono[0].ProductosRecintosComponenteDelBono[0].length !== 0) {
                        $lp.allotment_cal($prod_lp[0].ProductosBono[0].ProductosRecintosComponenteDelBono, tglF, tglT, month, year);
                    } else {
                        $app.alert('Tour Date not available', 'Warning');
                    }

                }

            } else {
                $app.alert('Tour Date not available', 'Warning');
            }
            $loader.hide();
        },
        allotment_cal: function (data, tglF, tglT, month, year, callback) {
            var tmp_allotment = [];

            for (let i = tglF; i <= tglT; i++) {
                var ttgl = i.toString();
                var $date_lp = '';
                if ($SETTINGS.loroparque.bono_id !== undefined && $SETTINGS.loroparque.bono_id !== '') {
                    $date_lp = $(data[0].ProductosRecintosSesionesComponenteDelBono).filter(function (i, n) { return n.Fecha === ttgl; });
                } else {
                    $date_lp = $(data[0].ProductosRecintosSesiones).filter(function (i, n) { return n.Fecha === ttgl; });
                }



                var tm_year = ttgl.substring(0, 4)
                var tm_month = ttgl.substring(4, 6)
                var tm_date = ttgl.substring(6, 8)
                if ($date_lp.length !== 0) {
                    tmp_allotment.push(
                        {
                            idx_allotment: JSON.stringify($date_lp[0]),
                            date: tm_year + "-" + tm_month + "-" + tm_date + " 00:00",
                            day: date_format(tm_year + "-" + tm_month + "-" + tm_date, 'DAY'),
                            month: monthNames[parseInt(tm_month) - 1],
                            description: "Free Sales",
                            status: "1",
                            src: 'LP'
                        }
                    )

                } else {
                    tmp_allotment.push(
                        {
                            idx_allotment: "",
                            date: tm_year + "-" + tm_month + "-" + tm_date + " 00:00",
                            day: date_format(tm_year + "-" + tm_month + "-" + tm_date, 'DAY'),
                            month: monthNames[parseInt(tm_month) - 1],
                            description: "",
                            status: "0",
                            src: 'LP'
                        }
                    )
                }

            }

            allotment_create_calendar(tmp_allotment, month, year, false, function (r) { });
        },
        ReservaAforo: function (param, callback) {
            var $arr_lp_filterprodID = $($return_HIBDisponible.DatosResult.AforosDisponibles[0].GruposInternetIdDisponible).filter(function (i, n) { return n.ProductoId === $SETTINGS.loroparque.product_id; });

            SESSION.transaction_id = SESSION.transaction_id.replace(/-/g, '') + '#' + $SETTINGS.loroparque.RecintosSesionId + "#" + $arr_lp_filterprodID[0].ProductoId;

            if ($SETTINGS.loroparque.bono_id == '') {
                $lp.ReservaAforo_noBonoID(param, function (r) { callback(1) });
            } else {
                $lp.ReservaAforo_BonoID(param, function (r) { callback(r) });

            }


        },
        ReservaAforo_BonoID: function (param, callback) {
            var $arr_lp_filterprodID = $($return_HIBDisponible.DatosResult.AforosDisponibles[0].GruposInternetIdDisponible).filter(function (i, n) { return n.ProductoId === $SETTINGS.loroparque.product_id; });
            console.log($arr_lp_filterprodID);
            console.log(param)
            var s = 0
            $.each($arr_lp_filterprodID[0].ProductosBono, function (kBono, vBono) {
                console.log(vBono.ProductosRecintosComponenteDelBono)

                if (vBono.ProductosRecintosComponenteDelBono !== null) {
                    var ss = vBono.ProductosRecintosComponenteDelBono;
                    ss.forEach(myFunction)
                    function myFunction(item) {
                        console.log(item)
                        var tttgl = $SETTINGS.loroparque.Fecha.replace(/\-/g, '').substring(0, 8);
                        var $arr_sessionID = $(item.ProductosRecintosSesionesComponenteDelBono).filter(function (i, n) { return n.Fecha === tttgl; });
                        param.Sesion = $arr_sessionID[0].RecintosSesionId;
                        $lp.ReservaAforo_noBonoID(param, function (r) { callback(s += 1) });
                    };

                }
            });

        },
        ReservaAforo_noBonoID: function (param, callback) {
            $.ajax({
                url: $SETTINGS.loroparque.site.url + 'ReservaAforo',
                data: JSON.stringify(param),
                type: "POST",
                processData: false,
                contentType: 'application/json',
                success: function (r) {
                    if (r.Mensajes.length !== 0) {
                        console.log(r.Mensajes[0]);
                        $loader.hide();
                        $app.alert(r.Mensajes[0].DescripcionMensaje, 'ERROR: ' + r.Mensajes[0].CodigoMensaje);
                        return false;
                    } else {
                        $loader.hide();

                        if (r.DatosResult.MensajeRespuesta == "OK") {

                            var $arr_lp_filterprodID = $($return_HIBDisponible.DatosResult.AforosDisponibles[0].GruposInternetIdDisponible).filter(function (i, n) { return n.ProductoId === $SETTINGS.loroparque.product_id; });
                            // SESSION.transaction_id = SESSION.transaction_id.replace(/-/g, '') + '#' + $SETTINGS.loroparque.RecintosSesionId + "#" + $arr_lp_filterprodID[0].ProductoId;

                            ssql_dbwebsql = "SELECT * FROM trx_header WHERE idx_mf='" + SESSION.transaction_mf + "' AND ConexionIacpos='" + $SETTINGS.loroparque.general.ConexionIacpos + "' AND EnlaceMenu='" + $SETTINGS.loroparque.general.EnlaceMenuId + "'";

                            exec_Sql(dbwebsql_lp, ssql_dbwebsql, function (r) {
                                console.log(r)
                                var len = r.rows.length, i;
                                if (len == 0) {
                                    ssql_dbwebsql = "INSERT INTO [trx_header]  VALUES ('"
                                        + SESSION.transaction_mf + "','"
                                        + $SETTINGS.loroparque.general.ConexionIacpos + "','"
                                        + $SETTINGS.loroparque.general.Idioma + "','"
                                        + $SETTINGS.loroparque.Cantidad + "','"
                                        + date_format($SETTINGS.loroparque.Fecha, 'yyyy/MM/dd') + "','"
                                        + $SETTINGS.loroparque.HoraInicio + ':00' + "','"
                                        + parseFloat($arr_lp_filterprodID[0].BaseImponible) * parseInt($SETTINGS.loroparque.Cantidad) + "','"
                                        + parseFloat($arr_lp_filterprodID[0].PVPInternet) * parseInt($SETTINGS.loroparque.Cantidad) + "','"
                                        + $return_HIBDisponible.DatosResult.AforosDisponibles[0].TipoReservaId + "','"
                                        + ""
                                        + "','"
                                        + $SETTINGS.loroparque.paramInsercion.LetraLocalizador
                                        + "','"
                                        + $SETTINGS.loroparque.login.id + "','"
                                        + $SETTINGS.loroparque.general.EnlaceMenuId + "','"
                                        + "clienteAPI','"
                                        + $SETTINGS.loroparque.general.Nombre + "','"
                                        + $SETTINGS.loroparque.general.Contrasena + "','"
                                        + "" + "','"
                                        + "" + "','"
                                        + "0')";

                                    exec_Sql(dbwebsql_lp, ssql_dbwebsql, function (r) {
                                        console.log($arr_lp_filterprodID[0])

                                        ///---- insert TRX_item
                                        ssql_dbwebsql = str_trx_item($arr_lp_filterprodID[0]);
                                        exec_Sql(dbwebsql_lp, ssql_dbwebsql, function (r) {
                                            callback();
                                        });

                                    });


                                } else {

                                    if ($SETTINGS.loroparque.bono_id == '') {
                                        ssql_dbwebsql = "SELECT * FROM trx_item WHERE idx_mf='" + SESSION.transaction_mf + "' AND ConexionIacpos='" + $SETTINGS.loroparque.general.ConexionIacpos + "' AND EnlaceMenu='" + $SETTINGS.loroparque.general.EnlaceMenuId + "'";
                                        exec_Sql(dbwebsql_lp, ssql_dbwebsql, function (r) {
                                            ssql_dbwebsql = str_trx_item($arr_lp_filterprodID[0]);
                                            exec_Sql(dbwebsql_lp, ssql_dbwebsql, function () {
                                                callback();
                                            });
                                        });

                                    } else {
                                        ssql_dbwebsql = str_trx_item($arr_lp_filterprodID[0]);
                                        exec_Sql(dbwebsql_lp, ssql_dbwebsql, function () {
                                            callback();
                                        });
                                    };

                                }
                            });


                        } else {
                            $app.alert(r.DatosResult.MensajeRespuesta, 'ERROR');
                            return false;

                        }

                    };
                },
                error: function (e) {
                    console.log(e)
                    $app.alert(e, 'Error');
                    $loader.hide();

                }
            });
        },
        Insercion: function (callback) {
            $status.set('Insercion to Loroparue');
            $loader.show();
            $buffer_arrResultInsercion = [];

            ssql_dbwebsql = "SELECT DISTINCT * FROM trx_header";
            exec_Sql(dbwebsql_lp, ssql_dbwebsql, function (r) {

                console.log(r.rows)
                if (r.rows.length > 0) {
                    if ($SETTINGS.loroparque.bono_id == undefined || $SETTINGS.loroparque.bono_id == '') {
                        $lp.InsercionNonBonoId(r, function () {
                            callback();
                        });
                    } else {
                        if (r.rows.length == 1) {
                            //----- kondisi jika hanya 1 booking
                            $lp.InsercionNonBonoId(r, function () {
                                callback();
                            });
                        } else {
                            $lp.InsercionBonoId(r, function () {
                                callback();
                            });
                        }
                        /*
                        ssql_dbwebsql = "SELECT DISTINCT * FROM trx_item WHERE [ConexionIacpos]='" + v1.ConexionIacpos + "' AND [EnlaceMenu]='" + v1.EnlaceMenu + "'";
                        exec_Sql(dbwebsql_lp, ssql_dbwebsql, function (r_trxitem) {
                                                     
                        }) */

                    }

                } else {
                    callback();
                }
            })
        },
        InsercionBonoId: function (r, callback) {
            console.log(r)
            $.each(r.rows, function (k1, v1) {
                ssql_dbwebsql = "SELECT DISTINCT * FROM trx_item WHERE [ConexionIacpos]='" + v1.ConexionIacpos + "' AND [EnlaceMenu]='" + v1.EnlaceMenu + "'";
                exec_Sql(dbwebsql_lp, ssql_dbwebsql, function (r_trxitem) {
                    console.log(r_trxitem)
                    $.ajax({
                        url: get_core_jsonfile('', $SETTINGS.lp_status_dev + '.json'),
                        type: 'GET',
                        dataType: 'json',
                        success: function (result) {

                            $.ajax({
                                url: $SETTINGS.loroparque.site.url + 'Insercion',
                                data: JSON.stringify($baffer_tmplpinsercion),
                                type: "POST",
                                processData: false,
                                contentType: 'application/json',
                                success: function (rr) {
                                    console.log(rr)
                                    if (rr.Mensajes.length !== 0) {
                                        $loader.hide();
                                        $app.alert(rr.Mensajes[0].DescripcionMensaje, 'ERROR: ' + rr.Mensajes[0].CodigoMensaje);
                                        return false;
                                    } else {
                                        if (rr.DatosResult !== null) {
                                            $lp.insert_ticket(rr.DatosResult, v1.idx_mf, function () {
                                                $buffer_arrResultInsercion.push(rr.DatosResult);
                                            })
                                            callback();

                                        }
                                    };

                                },
                                error: function (e) {
                                    $app.alert(e, 'Error');
                                    $loader.hide();
                                    return false;
                                }
                            });

                        }
                    })
                })
            })

        },
        InsercionNonBonoId: function (r, callback) {

            $.each(r.rows, function (k1, v1) {
                ssql_dbwebsql = "SELECT DISTINCT * FROM trx_item WHERE [ConexionIacpos]='" + v1.ConexionIacpos + "' AND [EnlaceMenu]='" + v1.EnlaceMenu + "'";
                exec_Sql(dbwebsql_lp, ssql_dbwebsql, function (r_trxitem) {
                    console.log(r_trxitem)
                    $.ajax({
                        url: get_core_jsonfile('', $SETTINGS.lp_status_dev + '.json'),
                        type: 'GET',
                        dataType: 'json',
                        success: function (result) {
                            var $baffer_tmplpinsercion = '';
                            $baffer_tmplpinsercion = result.paramInsercion;

                            $baffer_tmplpinsercion.ProductosCompra = [];
                            $baffer_tmplpinsercion.NumeroEntradasTotal = 0;
                            $baffer_tmplpinsercion.ImporteInicial = 0;
                            $baffer_tmplpinsercion.TotalReserva = 0;


                            $.each(r_trxitem.rows, function (k, v) {

                                var tmp_ProductosCompra = '';
                                var tmp_AforosConsumidos = '';

                                if (v.BonoId == '') {
                                    // ------ BonoId kosong

                                    tmp_AforosConsumidos = {
                                        IdRecinto: '',
                                        NombreRecinto: '',
                                        DescripcionRecinto: '',
                                        FechaVisita: '',
                                        HoraVisita: '',
                                        TotalAforo: '',
                                        TipoAforo: ''
                                    };

                                    tmp_ProductosCompra = {
                                        EsBono: '',
                                        ProductoId: '',
                                        BonoId: '',
                                        NombreProducto: '',
                                        DescripcionProducto: '',
                                        Cantidad: '',
                                        GrupoInternet: '',
                                        NombreGrupoInternet: '',
                                        PrecioBruto: '',
                                        PvpProducto: '',
                                        FechaVisita: '',
                                        AforosConsumidos: []
                                    };

                                    tmp_ProductosCompra.EsBono = v.EsBono;
                                    tmp_ProductosCompra.ProductoId = v.ProductoId;
                                    tmp_ProductosCompra.BonoId = v.BonoId;
                                    tmp_ProductosCompra.NombreProducto = v.NombreProducto;
                                    tmp_ProductosCompra.DescripcionProducto = v.DescripcionProducto;
                                    tmp_ProductosCompra.Cantidad = v.Cantidad;
                                    tmp_ProductosCompra.GrupoInternet = v.GrupoInternet;
                                    tmp_ProductosCompra.NombreGrupoInternet = v.NombreGrupoInternet;
                                    tmp_ProductosCompra.PrecioBruto = parseFloat(v.PrecioBruto);
                                    tmp_ProductosCompra.PvpProducto = parseFloat(v.PvpProducto);
                                    tmp_ProductosCompra.FechaVisita = v.FechaVisita;

                                    tmp_AforosConsumidos.IdRecinto = v.AforosConsumidos_IdRecinto;
                                    tmp_AforosConsumidos.NombreRecinto = v.AforosConsumidos_NombreRecinto;
                                    tmp_AforosConsumidos.DescripcionRecinto = v.AforosConsumidos_DescripcionRecinto;
                                    tmp_AforosConsumidos.FechaVisita = v.AforosConsumidos_FechaVisita;
                                    tmp_AforosConsumidos.HoraVisita = v.AforosConsumidos_HoraVisita;
                                    tmp_AforosConsumidos.TotalAforo = v.AforosConsumidos_TotalAforo;
                                    tmp_AforosConsumidos.TipoAforo = v.AforosConsumidos_TipoAforo;

                                    tmp_ProductosCompra.AforosConsumidos.push(tmp_AforosConsumidos)

                                    /*
                                    tmp_ProductosCompra.AforosConsumidos[0].IdRecinto = v.AforosConsumidos_IdRecinto;
                                    tmp_ProductosCompra.AforosConsumidos[0].NombreRecinto = v.AforosConsumidos_NombreRecinto;
                                    tmp_ProductosCompra.AforosConsumidos[0].DescripcionRecinto = v.AforosConsumidos_DescripcionRecinto;
                                    tmp_ProductosCompra.AforosConsumidos[0].FechaVisita = v.AforosConsumidos_FechaVisita;
                                    tmp_ProductosCompra.AforosConsumidos[0].HoraVisita = v.AforosConsumidos_HoraVisita;
                                    tmp_ProductosCompra.AforosConsumidos[0].TotalAforo = v.AforosConsumidos_TotalAforo;
                                    tmp_ProductosCompra.AforosConsumidos[0].TipoAforo = v.AforosConsumidos_TipoAforo;
                                    */

                                    $baffer_tmplpinsercion.NumeroEntradasTotal += parseInt(v.Cantidad);
                                    $baffer_tmplpinsercion.ImporteInicial += parseFloat(v.PrecioBruto) * parseInt(v.Cantidad);
                                    $baffer_tmplpinsercion.TotalReserva += parseFloat(v.PvpProducto) * parseInt(v.Cantidad);

                                    $baffer_tmplpinsercion.ProductosCompra.push(tmp_ProductosCompra);


                                } else {
                                    // ------ BonoId tidak kosong

                                    var $dtitem_bonoid = JSON.parse(v.Note);

                                    // $baffer_tmplpinsercion.ProductosCompra.push(trx_itemBono($dtitem_bonoid.ProductosBono[0], v, $dtitem_bonoid.ProductosBono.length));
                                    $baffer_tmplpinsercion.ProductosCompra.push(trx_itemBono($dtitem_bonoid.ProductosBono, v, $dtitem_bonoid.ProductosBono.length));
                                    // console.log($dtitem_bonoid)
                                    //console.log(v)

                                    $.each($dtitem_bonoid.ProductosBono, function (kBono, vBono) {
                                        $baffer_tmplpinsercion.NumeroEntradasTotal += parseInt(v.Cantidad);
                                        $baffer_tmplpinsercion.ImporteInicial += parseFloat($dtitem_bonoid.ProductosBono[kBono].BaseImponible) * parseInt(v.Cantidad);
                                        $baffer_tmplpinsercion.TotalReserva += parseFloat($dtitem_bonoid.ProductosBono[kBono].PVPInternet) * parseInt(v.Cantidad);



                                        //$baffer_tmplpinsercion.ProductosCompra[kBono].PrecioBruto = v.PrecioBruto;
                                        //$baffer_tmplpinsercion.ProductosCompra[kBono].PvpProducto = v.PvpProducto;
                                    });

                                    //console.log($baffer_tmplpinsercion.ProductosCompra)
                                }



                            });

                            $baffer_tmplpinsercion.transaction_id = '';
                            $baffer_tmplpinsercion.ConexionIacpos = v1.ConexionIacpos;
                            $baffer_tmplpinsercion.Idioma = v1.Idioma;
                            $baffer_tmplpinsercion.Fecha = v1.Fecha;
                            $baffer_tmplpinsercion.Hora = v1.Hora;
                            $baffer_tmplpinsercion.TipoReserva = v1.TipoReserva;
                            $baffer_tmplpinsercion.ClaveReserva = v1.ClaveReserva;
                            $baffer_tmplpinsercion.LetraLocalizador = v1.LetraLocalizador;
                            $baffer_tmplpinsercion.CodigoValidacionUnico = v1.CodigoValidacionUnico;
                            $baffer_tmplpinsercion.EnlaceMenu = v1.EnlaceMenu;
                            $baffer_tmplpinsercion.clienteAPI = $SETTINGS.loroparque.clienteAPI;
                            $baffer_tmplpinsercion.clienteCompra.Nombre = v1.clienteCompra_Nombre;
                            $baffer_tmplpinsercion.clienteCompra.Contrasena = v1.clienteCompra_Contrasena;
                            $baffer_tmplpinsercion.clienteCompra.NombreContacto = v1.clienteCompra_NombreContacto;
                            $baffer_tmplpinsercion.clienteCompra.PersonaPago = v1.clienteCompra_PersonaPago;
                            $baffer_tmplpinsercion.clienteCompra.Telefono = v1.clienteCompra_Telefono;

                            console.log(v1.idx_mf + '#' + v1.ConexionIacpos + '#' + v1.EnlaceMenu, $baffer_tmplpinsercion)


                            $.ajax({
                                url: $SETTINGS.loroparque.site.url + 'Insercion',
                                data: JSON.stringify($baffer_tmplpinsercion),
                                type: "POST",
                                processData: false,
                                contentType: 'application/json',
                                success: function (r) {
                                    console.log(r)
                                    if (r.Mensajes.length !== 0) {
                                        $loader.hide();
                                        $app.alert(r.Mensajes[0].DescripcionMensaje, 'ERROR: ' + r.Mensajes[0].CodigoMensaje);
                                        return false;
                                    } else {
                                        if (r.DatosResult !== null) {
                                            $lp.insert_ticket(r.DatosResult, v1.idx_mf, function () {
                                                $buffer_arrResultInsercion.push(r.DatosResult);
                                            })
                                            callback();

                                        }
                                    };

                                },
                                error: function (e) {
                                    $app.alert(e, 'Error');
                                    $loader.hide();
                                    return false;
                                }
                            });

                        }
                    });
                });
            });
        },
        insert_ticket: function (data, idx_mf, callback) {
            var p = '';
            $.each(data.Entradas, function (k, v) {
                console.log(k)
                if (typeof data.Entradas[k].TicketBonos === 'object') {
                    p += 'TicketBonosjson' + k + '=' + JSON.stringify(data.Entradas[k].TicketBonos) + '&'
                    p += 'note' + k + '=' + JSON.stringify(data.Entradas[k]) + '&'
                }
                p += JsontoParam(data.Entradas[k]) + '&'

                //}
            })

            var module = get_core_module();
            var serialize = 'act=lp-insert-ticket'
            serialize += '&localizador=' + data.Localizador
            serialize += '&pedido=' + data.Pedido
            serialize += '&prefijo=' + data.Prefijo
            serialize += '&sufijo=' + data.Sufijo
            serialize += '&idx_trx=&idx_mf=' + idx_mf + '&' + p.substring(0, p.length - 1)

            console.log(serialize)

            $.ajax({
                url: module,
                data: serialize,
                success: function (data) {
                    callback();
                }
            });


        },
        delete_trx_websql: function (idx_mf, idx_trx) {
            dbwebsql_lp.transaction(function (tx) {
                tx.executeSql("DELETE FROM trx_item WHERE idx_mf='" + idx_mf + "' AND idx_trx='" + idx_trx + "'")
            });
        }
    }
}();

function doQuery(tx, query, values, successHandler) {

    tx.executeSql(query, values, successHandler, errorHandler);


    if (typeof successHandler == 'function') {
        successHandler()
    } else {
        successHandler("---- Success---\n" + query);
    }


}

function exec_Sql(dblocal, query, result) {
    console.log('********** ');
    console.log('--execute: ' + query);
    dblocal.transaction(function (txn) {
        txn.executeSql(query, [], function (tx, res) {
            console.log('********* ');
            console.log('--return: ' + JSON.stringify(res));
            if (typeof result == 'function') {
                result(res);
            }
        }, errorHandler);
    });

    function errorHandler(trx, error) {
        var m = error.message;
        var pm = m.search("no such table");

        console.log(m, pm)
        if (pm == -1) {
            alert("Error : " + error.message + " in " + query);
        }
        console.log("Error : " + m + " in " + query);
        return false;
    }
}

function str_trx_item(dtitem) {
    console.log(dtitem);

    var ssql_dbwebsqlr = '';

    ssql_dbwebsqlr = "INSERT INTO trx_item VALUES ('"
        + SESSION.transaction_mf + "','" // idx_mf
        + $SETTINGS.loroparque.general.ConexionIacpos + "','"
        + $SETTINGS.loroparque.general.EnlaceMenuId + "','"
        + SESSION.transaction_id + "','" // idx_trx
        + dtitem.Esbono + "','"
        + dtitem.ProductoId + "','"
        + dtitem.BonoId + "','"
        + dtitem.NombreProducto.replace(/\n/g, '').replace(/\r/g, '') + "','"
        + dtitem.DescripcionProducto + "','"
        + $SETTINGS.loroparque.Cantidad + "','"
        + $SETTINGS.loroparque.general.GruposInternet + "','"
        + "" + "','"
        + parseFloat(dtitem.BaseImponible) + "','"
        + parseFloat(dtitem.PVPInternet) + "','"
        + date_format($SETTINGS.loroparque.Fecha, 'yyyy/MM/dd') + "','"

    if (dtitem.BonoId == '') {
        ssql_dbwebsqlr = ssql_dbwebsqlr + dtitem.ProductosRecintos[0].RecintoId + "','"
            + dtitem.ProductosRecintos[0].NombreRecinto + "','"
            + dtitem.ProductosRecintos[0].DescripciomIdioma + "','"
    } else {
        ssql_dbwebsqlr = ssql_dbwebsqlr + "" + "','"
            + dtitem.NombreProducto + "','"
            + dtitem.DescripcionProducto + "','"
    }

    ssql_dbwebsqlr = ssql_dbwebsqlr + date_format($SETTINGS.loroparque.Fecha, 'yyyy/MM/dd') + "','"
        + $SETTINGS.loroparque.HoraInicio + ':00' + "','"
        + $SETTINGS.loroparque.Cantidad + "','"

        + (dtitem.ProductosRecintos.length == 0 ? '' : dtitem.ProductosRecintos[0].TipoAforo) + "','"

        + JSON.stringify(dtitem)
        + "')";
    return ssql_dbwebsqlr;
}

function trx_itemBono(dtitem, v, lenrec) {
    console.log('trx_itemBono', lenrec)
    console.log('trx_itemBono', dtitem)
    console.log('trx_itemBono', v)
    var itemBono =
    {
        EsBono: v.EsBono,
        ProductoId: v.BonoId,
        BonoId: v.BonoId,
        NombreProducto: v.NombreProducto,
        DescripcionProducto: v.DescripcionProducto,
        PrecioBruto: parseFloat(v.PrecioBruto), //* v.Cantidad,
        PvpProducto: parseFloat(v.PvpProducto),// * v.Cantidad,
        Cantidad: v.Cantidad,
        GrupoInternet: v.GrupoInternet,
        TotalEntradas: v.Cantidad,
        NombreGrupoInternet: v.NombreGrupoInternet,
        FechaVisita: v.FechaVisita,
        AforosConsumidos: []
    };
    console.log('trx_itemBono', dtitem.ProductosRecintosComponenteDelBono)
    for (let i = 0; i < lenrec; i++) {
        if (dtitem[i].ProductosRecintosComponenteDelBono !== null) {

            $.each(dtitem[i].ProductosRecintosComponenteDelBono, function (kBono, vBono) {
                itemBono.AforosConsumidos.push(trx_itemBonoRecinto(dtitem[i].ProductosRecintosComponenteDelBono[kBono], v));
            });
        }

    }



    return itemBono;
}

function trx_itemBonoRecinto(itemRecinto, v) {

    var horavisita = (itemRecinto.ProductosRecintosSesionesComponenteDelBono.length !== 0 ? itemRecinto.ProductosRecintosSesionesComponenteDelBono[0].HoraInicio : v.AforosConsumidos_HoraVisita)

    horavisita = (horavisita.length == 5 ? horavisita + ':00' : horavisita);

    var itemBonoRecinto = {
        IdRecinto: itemRecinto.RecintoId,
        NombreRecinto: itemRecinto.NombreRecinto,
        DescripcionRecinto: itemRecinto.DescripciomIdioma,
        FechaVisita: v.FechaVisita,
        HoraVisita: horavisita,
        TotalAforo: v.Cantidad,
        TipoAforo: itemRecinto.TipoAforo
    };

    return itemBonoRecinto;

}