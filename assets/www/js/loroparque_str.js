$SETTINGS.loroparque                    = "";
$SETTINGS.loroparque.product_id         = "";
$SETTINGS.loroparque.RecintosSesionId   = "";
$SETTINGS.loroparque.Cantidad           = 0;

var $return_HIBDisponible       = '';

var $paramdispo = {
    "ConexionIacpos": '',
    "Idioma": 'es-ES',
    "EnlaceMenuId": '',
    "GruposInternet": '',
    "Fecha": get_date(),
    "Hora": "",
    "FechaHasta": date_format(new Date(new Date().getTime() + (30 * 24 * 60 * 60 * 1000)), "yyyy-mm-dd"),
    "HoraHasta": "",
    "IncluirSesiones": "1",
    "clienteAPI": '',
    "clienteCompra": {
        "Nombre": '',
        "Contrasena": "020d550cb38d01df0a411d38c8b4937847aba61f2e063ee7e7ffd6a544f56edf80bf355de7c6e6d8de251758c940e9979d22afbbb41268e673558744d3633c2f",
        "NombreContacto": "",
        "PersonaPago": "",
        "CIFoDNI": "",
        "Telefono": "",
        "Direccion": "",
        "Ciudad": "",
        "ProvinciaContacto": "",
        "CodigoPostal": "",
        "Pais": "",
        "Email": "",
        "Apellidos": "",
        "Apellido2Contacto": "",
        "TelefonoMovilContacto": "",
        "TipoViaContacto": "",
        "PisoContacto": "",
        "Nacionalidad": "",
        "PrefijoInternacional": "",
        "Edad": "0",
        "Sexo": "",
        "otroEmail": "",
        "Nota": null,
        "TipoDescuento": null,
        "Descuento": "0",
        "PoliticaPrivacidad": null
    }

}

var $paramReservaAforo ={
	"ConexionIacpos": 1437,
	"clienteAPI": '',
	"IdentificadorUnico": "1633344481",
	"Sesion": 33975,
	"Cantidad": 1,
	"IdEntrada": 0
}

var $buffer_arrInsercion = [];
var $buffer_arrResultInsercion = [{
    "Localizador": "N003552",
    "Pedido": "051812003552",
    "Prefijo": "",
    "Sufijo": "",
    "Entradas": [{ 
        "NumeroTicket": "1",
        "Cantidad": "1",
        "ProductoId": "340",
        "NombreProducto": "LP ADULTO",
        "DescripcionProducto": "Descubre todos los secretos del mundo animal en el mejor zoológico del mundo. Ticket válido para mayores de 11 años.",
        "EsBono": "0",
        "TotalBonosEntradas": "0",
        "TicketBonos": [],
        "Barcode": "/OI/P1437/I0/AN003552/E340/N001/B003/J1/F211224/H1000/G51/R1:Y2-B3-F211224-H1000"
    },{
        "NumeroTicket": "2",
        "Cantidad": "1",
        "ProductoId": "340",
        "NombreProducto": "LP ADULTO",
        "DescripcionProducto": "Descubre todos los secretos del mundo animal en el mejor zoológico del mundo. Ticket válido para mayores de 11 años.",
        "EsBono": "0",
        "TotalBonosEntradas": "0",
        "TicketBonos": [],
        "Barcode": "/OI/P1437/I0/AN003552/E340/N002/B003/J1/F211224/H1000/G52/R1:Y2-B3-F211224-H1000"
    }],
    "Mensajes": []
    },
    {
        "Localizador": "N003552",
        "Pedido": "051812003552",
        "Prefijo": "",
        "Sufijo": "",
        "Entradas": [{ 
            "NumeroTicket": "1",
            "Cantidad": "1",
            "ProductoId": "340",
            "NombreProducto": "LP ADULTO",
            "DescripcionProducto": "Descubre todos los secretos del mundo animal en el mejor zoológico del mundo. Ticket válido para mayores de 11 años.",
            "EsBono": "0",
            "TotalBonosEntradas": "0",
            "TicketBonos": [],
            "Barcode": "/OI/P1437/I0/AN003552/E340/N001/B003/J1/F211224/H1000/G51/R1:Y2-B3-F211224-H1000"
        },{
            "NumeroTicket": "2",
            "Cantidad": "1",
            "ProductoId": "340",
            "NombreProducto": "LP ADULTO",
            "DescripcionProducto": "Descubre todos los secretos del mundo animal en el mejor zoológico del mundo. Ticket válido para mayores de 11 años.",
            "EsBono": "0",
            "TotalBonosEntradas": "0",
            "TicketBonos": [],
            "Barcode": "/OI/P1437/I0/AN003552/E340/N002/B003/J1/F211224/H1000/G52/R1:Y2-B3-F211224-H1000"
        }],
        "Mensajes": []
        }];

var $paramInsercion = "";



/*
//----------------  NOTE INSERCION
{
    "transaction_id" : "", //--- idx from SESSION.transaction_id 
    "ConexionIacpos": 1437,     //--- $SETTINGS.loroparque.general.ConexionIacpos
    "Idioma": "es-ES",          //--- $SETTINGS.loroparque.general.Idioma
    "NumeroEntradasTotal": 0,   //--- (A) => Total number of entries in the operation (Adults + Children + Free)
    "Fecha": "2020/12/31",
    "Hora": "10:00:00",
    "EntradasGratuitas": 0,
    "ImporteInicial": 0,        //--- (B) => Sum of "BaseImponible" of the total number of products
    "TotalReserva": 0,          //--- (C) => Sum of "PVPInternet" of the total number of products
    "TipoReserva": 0,           //--- (D) => Type of Reservation to which the “GrupoInternet” on which the purchase is being made belongs. $return_HIBDisponible.AforosDisponibles[0].TipoReservaId
    "Accion": 1,
    "Audioguia": 0,
    "Notas": "",
    "EntradasSinFecha": 0,
    "EntradasSinHora": 0,
    "ClaveReserva": "",         //--- (E) => OPTIONAL. It can be used to put "locators" of the customer.
    "LetraLocalizador": "N",    //--- (F) => MANDATORY. Specifies the letter to be used in the returned locator.
    "NumeroPedido": "",
    "CodigoValidacionUnico": "",    //--- (G) => Unique identifier of the shopping session.
    "EnlaceMenu": "",               //--- $SETTINGS.loroparque.general.EnlaceMenuId
    "ExternoId": 0,
    "UsuarioBDId": 0,
    "NombreUsuarioBD": "",
    "ReservasAdicionales": {
      "TipoCentro":"",
      "Educador":"",
      "Curso":"",
      "RequiereInterprete":0,
      "ComoConocio":"",
      "NombreAdulto1":"",
      "NombreAdulto2":"",
      "NombreNinio1":"",
      "NombreNinio2":"",
      "NombreNinio3":"",
      "EdadNinio1":0,
      "EdadNinio2":0,
      "EdadNinio3":0,
      "FechaNacimientoNinio1":"",
      "NoDocumento":"",
      "TelefonoNinio1":"",
      "EmailNinio1":"",
      "TelefonoAdulto1":"",
      "EmailAdulto1":"",
      "MesListaEspera":"",
      "TurnoListaEspera":"",
      "CheckPublicidad":0,
      "FechaSolicitudDesde":"",
      "FechaSolicitudHasta":"",
      "HoraSolicitudDesde":"",
      "HoraSolicitudHasta":"",
      "EstadoSolicitud":"",
      "ClaveReservaAnexa":"",
      "FechaSolicitudDesdeUTC":null,
      "FechaSolicitudHastaUTC":null,
      "HoraSolicitudDesdeUTC":null,
      "HoraSolicitudHastaUTC":null,
      "Idioma":"es-ES",
      "Alergias":null,
      "AlergiasRecibido":null
   },
    "clienteAPI": ''                                // --- $SETTINGS.loroparque.clienteAPI
    ,
    "clienteCompra": {
        "Nombre": "",                               // --- $SETTINGS.loroparque.general.Nombre
        "Contrasena": "",                           // --- $SETTINGS.loroparque.general.Contrasena
        "NombreContacto": "",                       // --- input first and last name
        "PersonaPago": "",                          // --- input first and last name
        "Telefono": "0",                            // --- input phone number
        "Direccion": "",
        "Ciudad": "",
        "ProvinciaContacto": "",
        "CodigoPostal": "",
        "Pais": "",
        "Email": ""                                 // --- input email
    },
    "ProductosCompra": [{
        "EsBono": 0,                //--- $return_HIBDisponible.DatosResult.AforosDisponibles[0].GruposInternetIdDisponible filter by product ID
        "ProductoId": 284,
        "NombreProducto": "EXCLUSIVE DAY TOUR ADULTO",
        "DescripcionProducto": "Loro Parque abre sus puertas de jueves a lunes para fascinarte con una experiencia única a través de una visita guiada por un experto, para un exclusivo grupo de amantes de los animales. Además, disfruta de la mejor experiencia culinaria en Brunelli´s.",
        "Cantidad": 2,
        "GrupoInternet": 31,
        "NombreGrupoInternet": "",
        "PrecioBruto": 0,
        "PvpProducto": 0,
        "Comision": 0,
        "IvaComision": 0,
        "CodigoPromocional": "",
        "Conjunta": 0,
        "TotalEntradas": 0,
        "DesglosarComision": 0,
        "FechaVisita": "2020/12/31",
        "butacas": [],
        "AforosConsumidos": [
            {
                "IdRecinto": 13,
                "NombreRecinto": "EXCLUSIVE DAY TOUR",
                "DescripcionRecinto": "",
                "FechaVisita": "2020/12/31",
                "HoraVisita": "10:00:00",
                "TotalAforo": 2,
                "TipoAforo": null
            }
        ],
        "PersonasReserva": null,
        "InformacionListasBlancas": null,
        "TipoListado": 0
    }] ,
    "ClaveReservaOrigen": "",
    "GenerarFactura": 0,
    "FOP": "DP"
}
*/