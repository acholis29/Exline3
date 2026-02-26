/*
    SQLite SSQL MODULE
    for Excursion Offline (STS1)
    version 0.2 (2017-09-16)
	
    (c) Ipunk Vizard
 */

// shared variable!

var SQL_QUERY_DATA;
var SQL_ROWS;
var SQL_ARRAY;

var ssql;
var ssql_prepare = function (callback) {

    $status.set('PREPARING SSQL');

    ssql_prepare_table(function () {
        ssql_prepare_query(function () {
            ssql_module_check(function () {
                callback();
            });
        });
    });
}

function sql(query, result) {
    console.log('********** ');
    console.log('--execute: ' + query);
    $db.transaction(function (txn) {
        txn.executeSql(query, [], function (tx, res) {
            console.log('********* ');
            console.log('--return: ' + JSON.stringify(res));
            console.log('--returnjson: ', res);
            if (typeof result == 'function') {
                result(res);
            }
        });
    });
}

function sql_data(ssql_script, callback) {
    sql(ssql_script, function (result) {
        SQL_ROWS = result.rows;
        SQL_ARRAY = arr_props_to_lower(SQL_ROWS._array);

        callback(SQL_ARRAY);
    });
}
function is_table_exist(name_of_table, callback) {
    ssql = " SELECT name FROM sqlite_master "
    ssql += " WHERE type='table' "
    ssql += " AND name='" + name_of_table + "' COLLATE NOCASE";

    sql_data(ssql, function (result) {
        callback(result);
    });
}

function list_table_name(callback) {
    var table = [];
    ssql = " SELECT name FROM sqlite_master WHERE type='table'; ";

    sql_data(ssql, function (result) {
        for (var i = 0; i < result.length; i++) {
            table.push(result[i].name);
        }
        callback(table);
    });
}

function ssql_load(fn, id, callback) {
    var result;

    try {

        for (var i = 0; i < SQL_QUERY_DATA.length; i++) {
            var fn_name = SQL_QUERY_DATA[i].fn_name;
            var id_comp = SQL_QUERY_DATA[i].id_comp;

            if (fn_name == fn && id_comp == id) {
                result = SQL_QUERY_DATA[i];
            }
        }

        if (result.length != 0) {
            callback(result);
        } else {
            alert(fn + ' is not found on ' + id);
        }

    } catch (e) {
        alert(e)
    }
}

function ssql_prepare_table(callback) {
    /*
    ssql  = " CREATE TABLE IF NOT EXISTS [_manual_booking_] ";
    ssql += "   ( ";
    ssql += "      [booking_date] VARCHAR COLLATE NOCASE, ";
    ssql += "      [id_excursion] VARCHAR COLLATE NOCASE, ";
    ssql += "      [id_sub]       VARCHAR COLLATE NOCASE, ";
    ssql += "      [product]      VARCHAR COLLATE NOCASE, ";
    ssql += "      [id_supplier]  VARCHAR COLLATE NOCASE, ";
    ssql += "      [supplier]     VARCHAR COLLATE NOCASE, ";
    ssql += "      [id_agent]     VARCHAR COLLATE NOCASE, ";
    ssql += "      [agent]        VARCHAR COLLATE NOCASE, ";
    ssql += "      [id_hotel]     VARCHAR COLLATE NOCASE, ";
    ssql += "      [hotel]        VARCHAR COLLATE NOCASE, ";
    ssql += "      [room]         VARCHAR COLLATE NOCASE, ";
    ssql += "      [pickup_time]  VARCHAR COLLATE NOCASE, ";
    ssql += "      [tour_date]    VARCHAR COLLATE NOCASE, ";
    ssql += "      [pax_adult]    INTEGER COLLATE NOCASE, ";
    ssql += "      [pax_child]    INTEGER COLLATE NOCASE, ";
    ssql += "      [pax_infant]   INTEGER COLLATE NOCASE, ";
    ssql += "      [guest_name]   VARCHAR COLLATE NOCASE, ";
    ssql += "      [payment]      VARCHAR COLLATE NOCASE, ";
    ssql += "      [price]        VARCHAR COLLATE NOCASE, ";
    ssql += "      [currency]     VARCHAR COLLATE NOCASE, ";
    ssql += "      [pupp]         VARCHAR COLLATE NOCASE, ";
    ssql += "      [remark]       VARCHAR COLLATE NOCASE ";
    ssql += "   ) ";
    sql(ssql);
    */

    ssql = " CREATE TABLE IF NOT EXISTS [config_paygate] ( ";
    ssql += " [provider]	     TEXT   COLLATE NOCASE, ";
    ssql += " [post_url]	     TEXT   COLLATE NOCASE, ";
    ssql += " [post_parameters]	 TEXT   COLLATE NOCASE, ";
    ssql += " [idx_company]	     TEXT   COLLATE NOCASE, ";
    ssql += " [dev_status]       TEXT   COLLATE NOCASE ";
    ssql += " ) ";
    sql(ssql);

    ssql = " CREATE TABLE IF NOT EXISTS [MSExcursion_language] ( ";
    ssql += " [description]	nvarchar(200) COLLATE NOCASE, ";
    ssql += " [idx_excursion]	nvarchar(50) COLLATE NOCASE, ";
    ssql += " [idx_language]	nvarchar(50) COLLATE NOCASE, ";
    ssql += " [idx_exc_lang]	nvarchar(50) COLLATE NOCASE, ";
    ssql += " [crea_by]	nvarchar(50) COLLATE NOCASE, ";
    ssql += " [crea_date]	datetime, ";
    ssql += " [modi_by]	nvarchar(50) COLLATE NOCASE, ";
    ssql += " [modi_date]	datetime ";
    ssql += " ) ";
    sql(ssql);

    ssql = " CREATE TABLE IF NOT EXISTS [MSExcursionSub_language] ( ";
    ssql += " [description]	nvarchar(200) COLLATE NOCASE, ";
    ssql += " [idx_excursion]	nvarchar(50) COLLATE NOCASE, ";
    ssql += " [idx_sub]	nvarchar(50) COLLATE NOCASE, ";
    ssql += " [idx_language]	nvarchar(50) COLLATE NOCASE, ";
    ssql += " [idx_sub_lang]	nvarchar(50) COLLATE NOCASE, ";
    ssql += " [crea_by]	nvarchar(50) COLLATE NOCASE, ";
    ssql += " [crea_date]	datetime, ";
    ssql += " [modi_by]	nvarchar(50) COLLATE NOCASE, ";
    ssql += " [modi_date]	datetime ";
    ssql += " ) ";
    sql(ssql);

    ssql = " CREATE TABLE IF NOT EXISTS [TMP_MFExcursionTransactionDiscount]( ";
    ssql += " [idx_mfexcursion] nvarchar(50) COLLATE NOCASE, ";
    ssql += " [idx_transaction] nvarchar(50) COLLATE NOCASE, ";
    ssql += " [idx_promo] nvarchar(50) COLLATE NOCASE, ";
    ssql += " [value_promo] float COLLATE NOCASE, ";
    ssql += " [idx_trnpromo] nvarchar(50) COLLATE NOCASE ";
    ssql += " ); ";
    sql(ssql);

    ssql = "DROP TABLE ssql;"
    sql(ssql);

    ssql = " CREATE TABLE IF NOT EXISTS ssql ";
    ssql += " ( ";
    ssql += "   id_comp VARCHAR(50) COLLATE NOCASE, ";
    ssql += "   fn_name VARCHAR(50) COLLATE NOCASE, ";
    ssql += "   fn_parameter TEXT COLLATE NOCASE, "
    ssql += "   script TEXT COLLATE NOCASE ";
    ssql += " ); ";
    sql(ssql);

    ssql = " CREATE TABLE IF NOT EXISTS [MFExcursionMETA] ";
    ssql += " ( ";
    ssql += "	[created] datetime COLLATE NOCASE, ";
    ssql += "	[mf] varchar(50) COLLATE NOCASE, ";
    ssql += "	[voucher] varchar(50) COLLATE NOCASE, ";
    ssql += "	[imei] varchar(50) COLLATE NOCASE, ";
    ssql += "	[geo_latitude] varchar(50) COLLATE NOCASE, ";
    ssql += "	[geo_longitude] varchar(50) COLLATE NOCASE, ";
    ssql += "	[geo_country] varchar(50) COLLATE NOCASE, ";
    ssql += "	[geo_city] varchar(50) COLLATE NOCASE, ";
    ssql += "	[geo_postal] varchar(50) COLLATE NOCASE, ";
    ssql += "	[geo_address] varchar(500) COLLATE NOCASE, ";
    ssql += "	[os] varchar(50) COLLATE NOCASE, ";
    ssql += "	[app] varchar(50) COLLATE NOCASE ";
    ssql += " ); ";
    sql(ssql);

    ssql = " CREATE TABLE IF NOT EXISTS [MFExcursionNameList]( ";
    ssql += " [idx_mfexcursion] nvarchar(50) COLLATE NOCASE, ";
    ssql += " [idx_transaction] nvarchar(50) COLLATE NOCASE, ";
    ssql += " [suffix] nvarchar(50) COLLATE NOCASE, ";
    ssql += " [guest_name] nvarchar(500) COLLATE NOCASE, ";
    ssql += " [age] nvarchar(50) COLLATE NOCASE, ";
    ssql += " [crea_by]	nvarchar(50) COLLATE NOCASE, ";
    ssql += " [crea_date]	datetime, ";
    ssql += " [modi_by]	nvarchar(50) COLLATE NOCASE, ";
    ssql += " [modi_date]	datetime, ";
    ssql += " [idx_mfnamelist] nvarchar(50) COLLATE NOCASE ";
    ssql += " ); ";
    sql(ssql);

    callback();
}

function ssql_prepare_query(callback) {

    //get price
    ssql = "INSERT INTO ssql VALUES('ALL', 'GET_PRICE', '@:id_currency:,@:aci:,@:date:,@:id_market:,@:id_excur:,@:id_excursub:,@:pax:', 'SELECT ValidFrom, ValidTo, category, ChargeType, Idx_CurrencyBeli, HBali, Idx_CurrencyJual, hjual AS hjual, CASE WHEN Idx_CurrencyJual <> ''@:id_currency:'' THEN(ROUND(hjual * (SELECT a.Rate FROM MSExchangeRate a WHERE DATE(RateDate) IN (SELECT DATE(MAX(ratedate)) FROM MSExchangeRate) AND a.idx_currency_from = idx_currencyjual AND a.idx_currency_to = ''@:id_currency:''), 2)) WHEN Idx_CurrencyJual = ''@:id_currency:'' THEN Hjual END AS hjual_asli, Rate, Margin, idx_markupjual, pax_from, pax_to, idx_excursion, idx_sub_excursion, CASE WHEN Idx_CurrencyJual <> ''@:id_currency:'' THEN CASE WHEN chargetype = ''S'' THEN (ROUND(hjual * (SELECT a.Rate FROM MSExchangeRate a WHERE DATE(RateDate) IN (SELECT DATE(MAX(ratedate)) FROM MSExchangeRate) AND a.idx_currency_from = idx_currencyjual AND a.idx_currency_to = ''@:id_currency:''), 2)) WHEN chargetype <> ''S'' THEN (ROUND((hjual * @:pax:) * (SELECT a.Rate FROM MSExchangeRate a WHERE DATE(RateDate) IN (SELECT DATE(MAX(ratedate)) FROM MSExchangeRate) AND a.idx_currency_from = idx_currencyjual AND a.idx_currency_to = ''@:id_currency:''), 2)) END WHEN Idx_CurrencyJual = ''@:id_currency:'' THEN CASE WHEN chargetype = ''S'' THEN Hjual WHEN chargetype <> ''S'' THEN Hjual * @:pax: END END AS xPRICE, (SELECT code FROM mscurrency WHERE idx_currency = ''@:id_currency:'') AS xCURRENCY FROM msmarkup_jual WHERE ChargeType IN (''@:aci:'', ''S'') AND DATE(ValidFrom) <= DATE(''@:date:'') AND DATE(ValidTo) >= DATE(''@:date:'') AND idx_market = ''@:id_market:'' AND idx_excursion = ''@:id_excur:'' AND idx_sub_excursion = ''@:id_excursub:'' AND pax_from <= ''@:pax:'' AND pax_to >= ''@:pax:'' ')";
    sql(ssql);

    //get price surpax
    ssql = "INSERT INTO ssql VALUES('ALL', 'GET_PRICE_SURPAX_GKT', '@:id_currency:,@:date:,@:id_market:,@:id_excur:,@:id_excursub:,@:paxa:,@:paxc:,@:paxi:,@:paxac_total:', 'SELECT idx_Supplement AS idx_surcharge, descr AS surcharge, mandatory, adult, child, infant, pax_adult, pax_child, pax_infant,(h.serv * 1) + CASE WHEN pupp=''PU'' THEN h.adult * ((@:paxa: + @:paxc: + @:paxi:)) WHEN pupp=''PP'' THEN h.adult * @:paxa: END + CASE WHEN pupp=''PU'' THEN ''0'' WHEN pupp=''PP'' THEN (h.child * @:paxc:) END + CASE WHEN pupp=''PU'' THEN ''0'' WHEN pupp=''PP'' THEN (h.infant * @:paxi:) END AS price FROM ( SELECT g.idx_Supplement, g.descr, g.Mandatory, g.pupp, pax_adult, pax_child, pax_infant, IFNULL( ( SELECT CASE WHEN g.idx_curr <>''@:id_currency:'' THEN (ROUND(( IFNULL(buyrate ,''0'')) * ( SELECT Rate FROM MSExchangeRate WHERE DATE(RateDate) IN ( SELECT DATE(MAX(ratedate)) FROM MSExchangeRate) AND idx_currency_from=g.idx_curr AND idx_currency_to=''@:id_currency:''),2)) WHEN g.idx_curr =''@:id_currency:'' THEN IFNULL(buyrate ,''0'') END FROM MSExcursion_Supplements WHERE idx_excursion=g.idx_excursion AND idx_sub_excursion=g.idx_sub_excursion AND idx_Supplement=g.idx_Supplement AND DATE(FromDate)<=''@:date:'' AND DATE(ToDate)>=''@:date:'' AND idx_market=''@:id_market:'' AND FromQty<=''1'' AND toqty>=''1'' AND ChargeType=''S''),''0'') serv, IFNULL( ( SELECT CASE WHEN g.idx_curr <>''@:id_currency:'' THEN (ROUND(( IFNULL(buyrate ,''0'')) * ( SELECT Rate FROM MSExchangeRate WHERE DATE(RateDate) IN ( SELECT DATE(MAX(ratedate)) FROM MSExchangeRate) AND idx_currency_from=g.idx_curr AND idx_currency_to=''@:id_currency:''),2)) WHEN g.idx_curr =''@:id_currency:'' THEN IFNULL(buyrate ,''0'') END FROM MSExcursion_Supplements WHERE idx_excursion=g.idx_excursion AND idx_sub_excursion=g.idx_sub_excursion AND idx_Supplement=g.idx_Supplement AND DATE(FromDate)<=''@:date:'' AND DATE(ToDate)>=''@:date:'' AND idx_market=''@:id_market:'' AND FromQty<=''@:paxa:'' AND toqty>=''@:paxa:'' AND ChargeType=''A'' OR idx_excursion=g.idx_excursion AND idx_sub_excursion=g.idx_sub_excursion AND idx_Supplement=g.idx_Supplement AND DATE(FromDate)<=''@:date:'' AND DATE(ToDate)>=''@:date:'' AND idx_market=''@:id_market:'' AND FromQty<=pax_adult AND toqty>=pax_adult AND ChargeType=''A''),''0'') Adult, IFNULL( ( SELECT CASE WHEN g.idx_curr <>''@:id_currency:'' THEN (ROUND(( IFNULL(buyrate ,''0'')) * ( SELECT Rate FROM MSExchangeRate WHERE DATE(RateDate) IN ( SELECT DATE(MAX(ratedate)) FROM MSExchangeRate) AND idx_currency_from=g.idx_curr AND idx_currency_to=''@:id_currency:''),2)) WHEN g.idx_curr =''@:id_currency:'' THEN IFNULL(buyrate ,''0'') END FROM MSExcursion_Supplements WHERE idx_excursion=g.idx_excursion AND idx_sub_excursion=g.idx_sub_excursion AND idx_Supplement=g.idx_Supplement AND DATE(FromDate)<=''@:date:'' AND DATE(ToDate)>=''@:date:'' AND idx_market=''@:id_market:'' AND FromQty<=''@:paxc:'' AND toqty>=''@:paxc:'' AND ChargeType=''C'' AND pupp=''PP'' OR idx_excursion=g.idx_excursion AND idx_sub_excursion=g.idx_sub_excursion AND idx_Supplement=g.idx_Supplement AND DATE(FromDate)<=''@:date:'' AND DATE(ToDate)>=''@:date:'' AND idx_market=''@:id_market:'' AND FromQty<=pax_child AND toqty>=pax_child AND ChargeType=''C'' AND pupp=''PU''),''0'') Child, IFNULL( ( SELECT CASE WHEN g.idx_curr <>''@:id_currency:'' THEN (ROUND(( IFNULL(buyrate ,''0'')) * ( SELECT Rate FROM MSExchangeRate WHERE DATE(RateDate) IN ( SELECT DATE(MAX(ratedate)) FROM MSExchangeRate) AND idx_currency_from=g.idx_curr AND idx_currency_to=''@:id_currency:''),2)) WHEN g.idx_curr =''@:id_currency:'' THEN IFNULL(buyrate ,''0'') END FROM MSExcursion_Supplements WHERE idx_excursion=g.idx_excursion AND idx_sub_excursion=g.idx_sub_excursion AND idx_Supplement=g.idx_Supplement AND DATE(FromDate)<=''@:date:'' AND DATE(ToDate)>=''@:date:'' AND idx_market=''@:id_market:'' AND FromQty<=''@:paxi:'' AND toqty>=''@:paxi:'' AND ChargeType=''I'' AND pupp=''PP'' OR idx_excursion=g.idx_excursion AND idx_sub_excursion=g.idx_sub_excursion AND idx_Supplement=g.idx_Supplement AND DATE(FromDate)<=''@:date:'' AND DATE(ToDate)>=''@:date:'' AND idx_market=''@:id_market:'' AND FromQty<=pax_infant AND toqty>=pax_infant AND ChargeType=''I'' AND pupp=''PU'' ),''0'') Infant FROM ( SELECT DISTINCT idx_supplement, a.descr, Mandatory, a.idx_excursion, idx_sub_excursion, pupp, idx_curr, PT_Adult, CASE WHEN pt_adult=@:paxa: THEN ''0'' WHEN pt_adult>@:paxa: THEN ''0'' WHEN pt_adult<@:paxa: THEN @:paxa:-pt_adult END pax_adult, CASE WHEN pt_adult=@:paxa: THEN ''@:paxa:'' WHEN pt_adult>@:paxa: THEN @:paxc: - (pt_adult-@:paxa:) WHEN pt_adult<@:paxa: THEN @:paxc: END pax_child, CASE WHEN pt_adult=@:paxa: THEN ''@:paxa:'' WHEN pt_adult>@:paxa: THEN @:paxi: - (pt_adult-@:paxa:) WHEN pt_adult<@:paxa: THEN @:paxi: END pax_infant FROM MSExcursion_Supplements a INNER JOIN msexcursion b ON a.idx_excursion=b.idx_excursion WHERE a.idx_excursion=''@:id_excur:'' AND sub_supplement=''O'' AND idx_sub_excursion=''@:id_excursub:'' AND DATE(FromDate)<=''@:date:'' AND DATE(ToDate)>=''@:date:'' AND idx_market=''@:id_market:'' AND FromQty<=''@:paxac_total:'' AND toqty>=''@:paxac_total:'' AND pupp=''PP'' OR a.idx_excursion=''@:id_excur:'' AND sub_supplement=''O'' AND idx_sub_excursion=''@:id_excursub:'' AND DATE(FromDate)<=''@:date:'' AND DATE(ToDate)>=''@:date:'' AND idx_market=''@:id_market:'' AND fromqty<=''@:paxac_total:'' AND toqty>=''@:paxac_total:'' AND pupp=''PU'' ) g)h ORDER BY rowid DESC ') ";
    sql(ssql);

    ssql = "INSERT INTO ssql VALUES('ALL', 'GET_PRICE_SURPAX', '@:id_currency:,@:date:,@:id_market:,@:id_excur:,@:id_excursub:,@:paxa:,@:paxc:,@:paxi:,@:paxac_total:', 'SELECT idx_Supplement AS idx_surcharge, descr AS surcharge, mandatory, adult, child, infant, pax_adult, pax_child, pax_infant,(h.serv * 1) + CASE WHEN pupp=''PU'' THEN h.adult * ((@:paxa: + @:paxc: + @:paxi:) - ( SELECT PT_ADULT FROM msexcursion WHERE idx_excursion=''@:id_excur:'')) WHEN pupp=''PP'' THEN h.adult * @:paxa: END + CASE WHEN pupp=''PU'' THEN ''0'' WHEN pupp=''PP'' THEN (h.child * @:paxc:) END + CASE WHEN pupp=''PU'' THEN ''0'' WHEN pupp=''PP'' THEN (h.infant * @:paxi:) END AS price FROM ( SELECT g.idx_Supplement, g.descr, g.Mandatory, g.pupp, pax_adult, pax_child, pax_infant, IFNULL( ( SELECT CASE WHEN g.idx_curr <>''@:id_currency:'' THEN (ROUND(( IFNULL(buyrate ,''0'')) * ( SELECT Rate FROM MSExchangeRate WHERE DATE(RateDate) IN ( SELECT DATE(MAX(ratedate)) FROM MSExchangeRate) AND idx_currency_from=g.idx_curr AND idx_currency_to=''@:id_currency:''),2)) WHEN g.idx_curr =''@:id_currency:'' THEN IFNULL(buyrate ,''0'') END FROM MSExcursion_Supplements WHERE idx_excursion=g.idx_excursion AND idx_sub_excursion=g.idx_sub_excursion AND idx_Supplement=g.idx_Supplement AND DATE(FromDate)<=''@:date:'' AND DATE(ToDate)>=''@:date:'' AND idx_market=''@:id_market:'' AND FromQty<=''1'' AND toqty>=''1'' AND ChargeType=''S''),''0'') serv, IFNULL( ( SELECT CASE WHEN g.idx_curr <>''@:id_currency:'' THEN (ROUND(( IFNULL(buyrate ,''0'')) * ( SELECT Rate FROM MSExchangeRate WHERE DATE(RateDate) IN ( SELECT DATE(MAX(ratedate)) FROM MSExchangeRate) AND idx_currency_from=g.idx_curr AND idx_currency_to=''@:id_currency:''),2)) WHEN g.idx_curr =''@:id_currency:'' THEN IFNULL(buyrate ,''0'') END FROM MSExcursion_Supplements WHERE idx_excursion=g.idx_excursion AND idx_sub_excursion=g.idx_sub_excursion AND idx_Supplement=g.idx_Supplement AND DATE(FromDate)<=''@:date:'' AND DATE(ToDate)>=''@:date:'' AND idx_market=''@:id_market:'' AND FromQty<=''@:paxa:'' AND toqty>=''@:paxa:'' AND ChargeType=''A'' OR idx_excursion=g.idx_excursion AND idx_sub_excursion=g.idx_sub_excursion AND idx_Supplement=g.idx_Supplement AND DATE(FromDate)<=''@:date:'' AND DATE(ToDate)>=''@:date:'' AND idx_market=''@:id_market:'' AND FromQty<=pax_adult AND toqty>=pax_adult AND ChargeType=''A''),''0'') Adult, IFNULL( ( SELECT CASE WHEN g.idx_curr <>''@:id_currency:'' THEN (ROUND(( IFNULL(buyrate ,''0'')) * ( SELECT Rate FROM MSExchangeRate WHERE DATE(RateDate) IN ( SELECT DATE(MAX(ratedate)) FROM MSExchangeRate) AND idx_currency_from=g.idx_curr AND idx_currency_to=''@:id_currency:''),2)) WHEN g.idx_curr =''@:id_currency:'' THEN IFNULL(buyrate ,''0'') END FROM MSExcursion_Supplements WHERE idx_excursion=g.idx_excursion AND idx_sub_excursion=g.idx_sub_excursion AND idx_Supplement=g.idx_Supplement AND DATE(FromDate)<=''@:date:'' AND DATE(ToDate)>=''@:date:'' AND idx_market=''@:id_market:'' AND FromQty<=''@:paxc:'' AND toqty>=''@:paxc:'' AND ChargeType=''C'' AND pupp=''PP'' OR idx_excursion=g.idx_excursion AND idx_sub_excursion=g.idx_sub_excursion AND idx_Supplement=g.idx_Supplement AND DATE(FromDate)<=''@:date:'' AND DATE(ToDate)>=''@:date:'' AND idx_market=''@:id_market:'' AND FromQty<=pax_child AND toqty>=pax_child AND ChargeType=''C'' AND pupp=''PU''),''0'') Child, IFNULL( ( SELECT CASE WHEN g.idx_curr <>''@:id_currency:'' THEN (ROUND(( IFNULL(buyrate ,''0'')) * ( SELECT Rate FROM MSExchangeRate WHERE DATE(RateDate) IN ( SELECT DATE(MAX(ratedate)) FROM MSExchangeRate) AND idx_currency_from=g.idx_curr AND idx_currency_to=''@:id_currency:''),2)) WHEN g.idx_curr =''@:id_currency:'' THEN IFNULL(buyrate ,''0'') END FROM MSExcursion_Supplements WHERE idx_excursion=g.idx_excursion AND idx_sub_excursion=g.idx_sub_excursion AND idx_Supplement=g.idx_Supplement AND DATE(FromDate)<=''@:date:'' AND DATE(ToDate)>=''@:date:'' AND idx_market=''@:id_market:'' AND FromQty<=''@:paxi:'' AND toqty>=''@:paxi:'' AND ChargeType=''I'' AND pupp=''PP'' OR idx_excursion=g.idx_excursion AND idx_sub_excursion=g.idx_sub_excursion AND idx_Supplement=g.idx_Supplement AND DATE(FromDate)<=''@:date:'' AND DATE(ToDate)>=''@:date:'' AND idx_market=''@:id_market:'' AND FromQty<=pax_infant AND toqty>=pax_infant AND ChargeType=''I'' AND pupp=''PU'' ),''0'') Infant FROM ( SELECT DISTINCT idx_supplement, a.descr, Mandatory, a.idx_excursion, idx_sub_excursion, pupp, idx_curr, PT_Adult, CASE WHEN pt_adult=@:paxa: THEN ''0'' WHEN pt_adult>@:paxa: THEN ''0'' WHEN pt_adult<@:paxa: THEN @:paxa:-pt_adult END pax_adult, CASE WHEN pt_adult=@:paxa: THEN ''@:paxa:'' WHEN pt_adult>@:paxa: THEN @:paxc: - (pt_adult-@:paxa:) WHEN pt_adult<@:paxa: THEN @:paxc: END pax_child, CASE WHEN pt_adult=@:paxa: THEN ''@:paxa:'' WHEN pt_adult>@:paxa: THEN @:paxi: - (pt_adult-@:paxa:) WHEN pt_adult<@:paxa: THEN @:paxi: END pax_infant FROM MSExcursion_Supplements a INNER JOIN msexcursion b ON a.idx_excursion=b.idx_excursion WHERE a.idx_excursion=''@:id_excur:'' AND sub_supplement=''O'' AND idx_sub_excursion=''@:id_excursub:'' AND DATE(FromDate)<=''@:date:'' AND DATE(ToDate)>=''@:date:'' AND idx_market=''@:id_market:'' AND FromQty<=''@:paxac_total:'' AND toqty>=''@:paxac_total:'' AND pupp=''PP'' OR a.idx_excursion=''@:id_excur:'' AND sub_supplement=''O'' AND idx_sub_excursion=''@:id_excursub:'' AND DATE(FromDate)<=''@:date:'' AND DATE(ToDate)>=''@:date:'' AND idx_market=''@:id_market:'' AND fromqty<=''@:paxac_total:'' AND toqty>=''@:paxac_total:'' AND pupp=''PU'' ) g)h ORDER BY rowid DESC ') ";
    sql(ssql);

    //get price surtel
    ssql = "INSERT INTO ssql VALUES('ALL', 'GET_PRICE_SURTEL', '@:id_currency:,@:id_hotel:,@:id_market:,@:id_excur:,@:id_excursub:,@:date:,@:paxa:,@:paxc:', 'SELECT DISTINCT a1.idx_supplement AS idx_surcharge, a1.supplement AS surcharge, ''1'' AS mandatory, CASE WHEN a1.idx_curr <> ''@:id_currency:'' THEN(ROUND((IFNULL(Abuyrate, ''0'') + IFNULL(cbuyrate, ''0'')) * (SELECT Rate FROM MSExchangeRate WHERE DATE(RateDate) IN (SELECT DATE(MAX(ratedate)) FROM MSExchangeRate) AND idx_currency_from = a1.idx_curr AND idx_currency_to = ''@:id_currency:''), 2)) WHEN a1.idx_curr = ''@:id_currency:'' THEN IFNULL(Abuyrate, ''0'') + IFNULL(cbuyrate, ''0'') END AS price FROM (SELECT a.idx_supplement, b.supplement, c.idx_curr, CASE WHEN (c.idx_typeofqty = ''PP'') THEN IFNULL(c.buyrate, ''0'') * ''@:paxa:'' WHEN (c.idx_typeofqty = ''PS'') THEN IFNULL(c.buyrate, ''0'') END AS ABuyRate FROM (SELECT * FROM MSSupplementSub WHERE category = ''H'' AND idx_from = ''@:id_hotel:'') a INNER JOIN (SELECT * FROM MSSupplement) b ON a.idx_supplement = b.idx_Supplement INNER JOIN (SELECT * FROM msexcursion_supplements WHERE idx_market = ''@:id_market:'' AND idx_excursion = ''@:id_excur:'' AND idx_sub_excursion = ''@:id_excursub:'' AND DATE(FromDate) <= DATE(''@:date:'') AND DATE(ToDate) >= DATE(''@:date:'') AND fromqty <= ''@:paxa:'' AND toqty >= ''@:paxa:'' AND chargetype = ''A'') c ON a.idx_supplement = c.idx_supplement) a1 LEFT OUTER JOIN (SELECT a.idx_supplement, b.supplement, CASE WHEN (c.idx_typeofqty = ''PP'') THEN IFNULL(c.buyrate, ''0'') * ''@:paxc:'' WHEN (c.idx_typeofqty = ''PS'') THEN IFNULL(c.buyrate, ''0'') END AS CBuyRate FROM (SELECT * FROM MSSupplementSub WHERE category = ''H'' AND idx_from = ''@:id_hotel:'') a INNER JOIN (SELECT * FROM MSSupplement) b ON a.idx_supplement = b.idx_Supplement INNER JOIN (SELECT * FROM msexcursion_supplements WHERE idx_market = ''@:id_market:'' AND idx_excursion = ''@:id_excur:'' AND idx_sub_excursion = ''@:id_excursub:'' AND DATE(FromDate) <= DATE(''@:date:'') AND DATE(ToDate) >= DATE(''@:date:'') AND fromqty <= ''@:paxc:'' AND toqty >= ''@:paxc:'' AND chargetype = ''C'') c ON a.idx_supplement = c.idx_supplement) b1 ON a1.idx_supplement = b1.idx_supplement ')"
    sql(ssql);

    //list cart (dcpi)
    ssql = "INSERT INTO ssql VALUES('ALL', 'LIST_CART_DCPI', '@:id_mf:,@:promo_code:,@:id_market:', 'SELECT *, price-ifnull(promotion,''0'') AS total FROM(SELECT crea_date AS date_tr, exc_numb, idx_transaction, idx_excursion, excursion, idx_sub_excursion, sub, pickup, idx_hotel, hotel, Room_no AS room, idx_client, idx_supplier, supplier, idx_from, promo, Adult, Child, Infant, promotion, PUPP, RECPP, minpax, RECPU, QTYTOUR, discountvalue, currencydisc, proceed_allotment, currency, price, pax, (SELECT (SELECT header.price FROM TMP_MFExcursionTransactionHeader header WHERE header.idx_transaction = j.idx_transaction)-IFNULL(SUM(surcharge.price),0) FROM TMP_MFExcursionSurcharge surcharge WHERE surcharge.idx_transaction = j.idx_transaction) AS total_price_pax, (SELECT IFNULL(SUM(surcharge.price),0) FROM TMP_MFExcursionSurcharge surcharge WHERE surcharge.idx_transaction = j.idx_transaction) AS total_price_surcharge, CASE WHEN recpp+recpu<qtytour THEN ''0'' WHEN recpp+recpu=qtytour AND recpu>0 THEN discountvalue WHEN recpp>=qtytour THEN CASE WHEN PUPP=''PP'' THEN CASE WHEN pax<minpax THEN discountvalue * pax WHEN pax>=minpax THEN discountvalue * minpax END WHEN PUPP=''PU'' THEN discountvalue END WHEN recpp+recpu=qtytour AND recpu=0 THEN CASE WHEN pax<minpax THEN discountvalue * pax WHEN pax>=minpax THEN discountvalue * minpax END WHEN recpp+recpu>qtytour AND recpp<qtytour THEN CASE WHEN PUPP=''PP'' THEN CASE WHEN pax<minpax THEN discountvalue WHEN pax>=minpax THEN discountvalue END WHEN PUPP=''PU'' THEN discountvalue END END AS disc1, (SELECT CASE WHEN lower(idx_paymenttype)=''cc'' THEN ''CREDIT CARD'' WHEN lower(idx_paymenttype)=''cash'' THEN ''CASH'' WHEN lower(idx_paymenttype)=''ca'' THEN ''CASH'' WHEN lower(idx_paymenttype)=''pot'' THEN ''PAY ON TOUR'' END || group_concat('' '' || b1.code ||'' ''|| amount) FROM MFExcursionPaymentDetail a1 INNER JOIN mscurrency b1 ON a1.idx_currency=b1.idx_currency WHERE idx_mfexcursion=''@:id_mf:'') AS val_payment FROM (SELECT *, IFNULL( (SELECT SUM(pax) FROM TMP_MFExcursionTransactionItem WHERE chargetype<>''S'' AND idx_transaction=TMP_MFExcursionTransactionHeader.idx_transaction),''0'') AS PAX, IFNULL( (SELECT SUM(pax) FROM TMP_MFExcursionTransactionItem WHERE chargetype=''A'' AND idx_transaction=TMP_MFExcursionTransactionHeader.idx_transaction),''0'') AS Adult, IFNULL( (SELECT SUM(pax) FROM TMP_MFExcursionTransactionItem WHERE chargetype=''C'' AND idx_transaction=TMP_MFExcursionTransactionHeader.idx_transaction),''0'') AS Child, IFNULL( (SELECT SUM(pax) FROM TMP_MFExcursionTransactionItem WHERE chargetype=''I'' AND idx_transaction=TMP_MFExcursionTransactionHeader.idx_transaction),''0'') AS Infant, IFNULL( (SELECT SUM(value_promo) FROM TMP_MFExcursionTransactiondiscount WHERE idx_transaction=TMP_MFExcursionTransactionHeader.idx_transaction),''0'') promotion, IFNULL( (SELECT idx_promotion FROM mspromotion WHERE code=''@:promo_code:'' COLLATE NOCASE), ''0'') AS idx_promotion, (SELECT PUPP FROM msexcursion WHERE idx_excursion=TMP_MFExcursionTransactionHeader.idx_excursion) AS PUPP, (SELECT count(*) AS RecPP FROM TMP_MFExcursionTransactionHeader a INNER JOIN msexcursion b ON a.idx_excursion=b.idx_excursion INNER JOIN (SELECT DISTINCT idx_excursion, idx_sub_exc FROM mspromoexcursion) c ON a.idx_excursion=c.idx_excursion AND a.idx_sub_excursion=c.idx_sub_exc WHERE pupp=''PP'') AS RECPP, (SELECT min(pax) FROM (SELECT sum(pax) AS pax, a.idx_transaction FROM TMP_MFExcursionTransactionHeader a INNER JOIN TMP_MFExcursionTransactionitem b ON a.idx_transaction=b.idx_transaction INNER JOIN msexcursion c ON a.idx_excursion=c.idx_excursion WHERE pupp=''PP'' GROUP BY a.idx_transaction ORDER BY pax DESC LIMIT 3) g) AS minpax, (SELECT count(*) AS RecPU FROM TMP_MFExcursionTransactionHeader a INNER JOIN msexcursion b ON a.idx_excursion=b.idx_excursion INNER JOIN (SELECT DISTINCT idx_excursion, idx_sub_exc FROM mspromoexcursion) c ON a.idx_excursion=c.idx_excursion AND a.idx_sub_excursion=c.idx_sub_exc WHERE pupp=''PU'') AS RECPU, (SELECT qtytour FROM mspromo WHERE DATE(fromdate)<=datetime(''now'', ''localtime'') AND DATE(todate)>=datetime(''now'', ''localtime'') AND idx_market=''@:id_market:'') AS QTYTOUR, (SELECT qtytour FROM mspromo WHERE DATE(fromdate)<=datetime(''now'', ''localtime'') AND DATE(todate)>=datetime(''now'', ''localtime'') AND idx_market=''@:id_market:'') AS discountvalue, (SELECT idx_currency FROM mspromo WHERE DATE(fromdate)<=datetime(''now'', ''localtime'') AND DATE(todate)>=datetime(''now'', ''localtime'') AND idx_market=''@:id_market:'') AS currencydisc, (SELECT supplier_name FROM msexcursion a1 INNER JOIN mssupplier b1 ON a1.idx_supplier=b1.idx_supplier WHERE a1.idx_excursion=TMP_MFExcursionTransactionHeader .idx_excursion) AS supplier FROM TMP_MFExcursionTransactionHeader) j ORDER BY pupp, pax DESC) k ')"
    sql(ssql);

    //list location
    ssql = "INSERT INTO ssql VALUES('ALL', 'LIST_LOCATION', '@:search:', 'SELECT Upper(state) AS state, idx_state FROM msstate WHERE state LIKE ''%@:search:%''')"
    sql(ssql);

    //list excursion (with language support)
    ssql = "INSERT INTO ssql VALUES('ALL', 'LIST_EXCURSION', '@:id_user:,@:id_language:,@:search:,@:id_state:,@:id_market:', 'SELECT DISTINCT a.idx_excursion || ''|'' || IFNULL(b.idx_sub_excursion, '''') as idx_excursion_and_sub, a.idx_excursion, CASE WHEN b.idx_sub_excursion IS NULL THEN '''' WHEN b.idx_sub_excursion IS NOT NULL THEN b.idx_sub_excursion END AS idx_sub, Replace(Replace(Upper(Ifnull(z.description, a.name_exc) || Ifnull('' '' || y.description, Ifnull('' '' || b.sub_excursion, ''''))), ''\"'', ''''), '''''''', '''') AS excursion, Ifnull(b.sub_excursion, '''') AS sub_excursion, a.pf_adult, a.pf_child, a.pf_infant, CASE WHEN d.max_pax IS NULL THEN a.pt_adult WHEN d.max_pax IS NOT NULL THEN d.max_pax END AS pt_adult, CASE WHEN d.max_pax IS NULL THEN a.pt_child WHEN d.max_pax IS NOT NULL THEN d.max_pax END AS pt_child, CASE WHEN d.max_pax IS NULL THEN a.pt_infant WHEN d.max_pax IS NOT NULL THEN d.max_pax END AS pt_infant, a.af_adult, a.af_child, a.af_infant, a.at_adult, a.at_child, a.at_infant, a.pupp, idx_supplier FROM msexcursion a LEFT OUTER JOIN msexcursionsub b ON a.idx_excursion = b.idx_excursion INNER JOIN msdestination c ON a.idx_excursion = c.idx_excursion LEFT OUTER JOIN msexcursionmaxpax d ON a. idx_excursion = d.idx_excursion LEFT JOIN msexcursion_language z ON z.idx_excursion = a.idx_excursion AND z.idx_language = (SELECT value FROM config WHERE NAME = ''language'') AND z.description <> '''' LEFT JOIN msexcursionsub_language y ON y.idx_sub = b.idx_sub_excursion AND y.idx_language = (SELECT value FROM config WHERE NAME = ''language'') INNER JOIN MSMarkup_Jual a1 ON a.idx_excursion=a1.idx_excursion WHERE c.idx_rep = ''@:id_user:'' AND( excursion LIKE ''%@:search:%'' OR z.description LIKE ''%@:search:%'') AND a.idx_state LIKE ''%@:id_state:%'' AND a1.idx_market=''@:id_market:'' ORDER BY a.name_exc ')"
    sql(ssql);

    //list agent
    ssql = "INSERT INTO ssql VALUES('ALL', 'LIST_AGENT', '@:id_user:,@:search:', 'SELECT a.idx_a AS idx_agent, Upper(a.Name_A) AS agent FROM msagent a INNER JOIN MS_EmployeeAgent b ON a.idx_a=b.idx_agent WHERE b.idx_user=''@:id_user:'' AND Name_A LIKE ''%@:search:%''')"
    sql(ssql);

    //list hotel
    ssql = "INSERT INTO ssql VALUES('ALL', 'LIST_HOTEL', '@:search:', 'SELECT Upper(name_h) AS hotel,idx_htl AS idx_hotel FROM mshotel where name_h like ''%@:search:%'' ORDER BY name_h LIMIT 10 ')"
    sql(ssql);

    //list pickup time
    ssql = "INSERT INTO ssql VALUES('ALL', 'LIST_PICKUP', '@:id_excur:,@:id_excursub:,@:id_hotel:', 'SELECT pickup FROM msexcursionpickup a INNER JOIN mshotel b ON a.idx_hotel=b.idx_htl where a.idx_excursion = ''@:id_excur:'' AND idx_sub_exc = ''@:id_excursub:'' AND idx_hotel = ''@:id_hotel:'' ')"
    sql(ssql);

    //list allotment
    ssql = "INSERT INTO ssql VALUES('ALL', 'LIST_ALLOTMENT', '@:id_excursion:,@:id_excursub:,@:cmonth:,@:cyear:', 'SELECT idx_allotment AS idx_allotment, dateallot AS date, case when cast(strftime(''%w'', dateallot) as integer)= 0 then ''Sunday'' when cast (strftime(''%w'', dateallot) as integer)=1 then ''Monday'' when cast (strftime(''%w'', dateallot) as integer)=2 then ''Tuesday'' when cast (strftime(''%w'', dateallot) as integer)=3 then ''Wednesday'' when cast (strftime(''%w'',dateallot) as integer)=4 then ''Thursday'' when cast (strftime(''%w'', dateallot) as integer)=5 then ''Friday'' else ''Saturday'' end as day, case when cast (strftime(''%m'', dateallot) as integer)= 1 then ''Jan'' when cast (strftime(''%m'', dateallot) as integer)=2 then ''Feb'' when cast (strftime(''%m'', dateallot) as integer)=3 then ''Mar'' when cast (strftime(''%m'', dateallot) as integer)=4 then ''Apr'' when cast (strftime(''%m'',dateallot) as integer)=5 then ''May'' when cast (strftime(''%m'', dateallot) as integer)=6 then ''Jun'' when cast (strftime(''%m'', dateallot) as integer)=7 then ''Jul'' when cast (strftime(''%m'', dateallot) as integer)=8 then ''Aug'' when cast (strftime(''%m'', dateallot) as integer)=9 then ''Sep'' when cast (strftime(''%m'', dateallot) as integer)=10 then ''Oct'' when cast (strftime(''%m'', dateallot) as integer)=11 then ''Nov'' else ''Des'' end as month, CASE WHEN freesales=''GN'' AND balance<>''0'' THEN ''Quota : '' ||'' ''||balance||'' ''|| CASE WHEN jenis_allotment=''PU'' THEN ''Unit'' WHEN jenis_allotment=''PP'' THEN ''Pax'' END WHEN freesales=''GN'' AND balance=''0'' THEN ''Not Available'' WHEN freesales=''FS'' THEN ''Free Sales'' END AS description, CASE WHEN sts_sales THEN ''0'' WHEN dateallot<datetime(''now'', ''localtime'') THEN ''0'' WHEN freesales=''GN'' AND balance<>''0'' THEN ''1'' WHEN freesales=''GN'' AND balance=''0'' THEN ''0'' WHEN freesales=''FS'' THEN ''1'' END AS status from MFALLOTMENT where idx_excursion=''@:id_excur:'' and idx_subexcursion=''@:id_excursub:'' and idx_from=''@:id_market:'' and strftime(''%m'', dateallot)=''@:cmonth:'' and strftime(''%Y'', dateallot)=''@:cyear:'' order by dateallot ')"
    sql(ssql);

    //get transaction number
    ssql = "INSERT INTO ssql VALUES('ALL', 'GET_TRANSACTION_NUMBER', '@:initial:,@:year:,@:nik_len:,@:nik_len_min1:', 'SELECT case when count(*)=0 then ''@:initial:@:year:1'' when count(*)>0 then ''@:initial:@:year:''||''''||cast(cast(substr(exc_number,@:nik_len:,3) as int) +1 as nvarchar(3)) end as random FROM MFExcursionHeader where substr(exc_number,1,@:nik_len_min1:)=''@:initial:@:year:'' order by exc_number desc limit 1 ')"
    sql(ssql);

    //get price cc
    ssql = "INSERT INTO ssql VALUES('ALL', 'GET_PRICE_CC', '@:id_currency_company:,@:id_currency:,@:original_currency_value:,@:id_currency_company:,@:lbl_currency_company:', 'SELECT cast(h.rate as nvarchar(10)) as rate,h.code from(select case WHEN ''@:id_currency_company:''=''@:id_currency:'' then (select ''@:original_currency_value:''+ROUND(((''@:original_currency_value:'' * 3)/100),2) AS rate) WHEN ''@:id_currency_company:''<>''@:id_currency:'' THEN (SELECT ROUND(''@:original_currency_value:'' * ROUND((a.rate+((a.rate * 3)/100)),0) ,2) AS rate FROM MSExchangeRate a WHERE date(RateDate) IN (SELECT date(MAX(ratedate)) FROM MSExchangeRate) AND a.idx_currency_from=''@:id_currency:'' AND a.idx_currency_to=''@:id_currency_company:'') END AS rate,''@:lbl_currency_company:'' AS code) h ')"
    sql(ssql);

    //get currency company
    ssql = "INSERT INTO ssql VALUES('ALL', 'GET_CURRENCY_COMPANY', '@:id_currency:,@:original_currency_value:,@:id_currency_company:,@:lbl_currency_company:', 'SELECT * FROM mscurrency WHERE set_default = ''True'' OR set_default = ''1'' LIMIT 1')"
    sql(ssql);

    //get exchangerate
    ssql = "INSERT INTO ssql VALUES('ALL', 'GET_EXCHANGERATE', '@:id_currency_from:,@:id_currency_to:', 'SELECT idx_currency_from, idx_currency_to,Rate, RateDate FROM MSExchangeRate WHERE date(RateDate) IN(SELECT date(MAX(ratedate)) FROM MSExchangeRate) and idx_currency_from=''@:id_currency_from:'' and idx_currency_to=''@:id_currency_to:'' ')"
    sql(ssql);

    //list exchangerate
    ssql = "INSERT INTO ssql VALUES('ALL', 'LIST_EXCHANGERATE', '', 'SELECT a.idx_currency_from AS idx_currency_from, (SELECT code FROM mscurrency WHERE a.idx_currency_from = idx_currency) AS codefrom, a.idx_currency_to AS idx_currency_to, (SELECT code FROM mscurrency WHERE a.idx_currency_to = idx_currency) AS codeto, a.Rate AS rate, a.RateDate AS ratedate FROM MSExchangeRate a WHERE date(RateDate) IN (SELECT date(MAX(ratedate)) FROM MSExchangeRate) ORDER BY codefrom, codeto; ')"
    sql(ssql);

    //list exchangerate cc
    ssql = "INSERT INTO ssql VALUES('ALL', 'LIST_EXCHANGERATE_CC', '', 'SELECT(SELECT MSCurrency.code FROM MSCurrency WHERE idx_currency=idx_currency_from) AS currency_from, (SELECT MSCurrency.code FROM MSCurrency WHERE idx_currency=idx_currency_to) AS currency_to, rate, ratedate AS date FROM MSExchangeRate WHERE date(RateDate) IN (SELECT date(MAX(ratedate)) FROM MSExchangeRate) and idx_currency_to IN (SELECT idx_currency FROM MSCurrency WHERE set_default=''1'') union SELECT (SELECT MSCurrency.code FROM MSCurrency WHERE idx_currency=idx_currency_from) AS idx_currency_from, ''Credit Card'', ROUND((rate+((rate * 3)/100)),0), ratedate FROM MSExchangeRate WHERE date(RateDate) IN (SELECT date(MAX(ratedate)) FROM MSExchangeRate) and idx_currency_to IN (SELECT idx_currency FROM MSCurrency WHERE set_default=''1'') ')"
    sql(ssql);

    //list currency
    ssql = "INSERT INTO ssql VALUES('ALL', 'LIST_CURRENCY', '', 'SELECT code, idx_currency, currency, set_default FROM mscurrency')"
    sql(ssql);

    //list month
    ssql = "INSERT INTO ssql VALUES('ALL', 'LIST_MONTH', '', 'select ''Jan'' as bln,''01'' as id union select ''Feb'' as bln,''02'' as id union select ''Mar'' as bln,''03'' as id union select ''Apr'' as bln,''04'' as id union select ''May'' as bln,''05'' as id union select ''Jun'' as bln,''06'' as id union select ''Jul'' as bln,''07'' as id union select ''Aug'' as bln,''08'' as id union select ''Sep'' as bln,''09'' as id union select ''Oct'' as bln,''10'' as id union select ''Nov'' as bln,''11'' as id union select ''Dec'' as bln,''12'' as id order by id ')"
    sql(ssql);

    //get discount
    ssql = "INSERT INTO ssql VALUES('ALL', 'GET_DISCOUNT', '', 'SELECT idx_promotion FROM MSPromotion WHERE Code = ''@:promo_code:'' COLLATE NOCASE')"
    sql(ssql);

    //get discount dcpi
    ssql = "INSERT INTO ssql VALUES('ALL', 'GET_DISCOUNT_DCPI', '@:id_currency:,@:value:,@:promocode:', 'select code, case when promo_ValPrec=''V'' then case when ''@:id_currency:''=idx_currency then ifnull(value,''0'') when ''@:id_currency:''<>idx_currency then ifnull((SELECT Rate FROM MSExchangeRate WHERE RateDate IN(SELECT MAX(ratedate) AS ratedate FROM MSExchangeRate) and idx_currency_from=''@:id_currency:'' and idx_currency_to=idx_currency),''0'') end when promo_ValPrec=''P'' then (''@:value:'' * value)/100 end AS discvalue, idx_promotion, crea_by, crea_date, modi_by, modi_date ,''''descr,'''' AS promo,'''' AS satpromo,'''' AS idx_mf,'''' AS exc_numb from MSPromotion where Code=''@:promocode:'' and exp_date<=date() and exp_date_to>=date() ')"
    sql(ssql);

    //list transaction
    ssql = "INSERT INTO ssql VALUES('ALL', 'LIST_TRANSACTION', '@:search:,@:fromdate:,@:id_language:,@:repname:', 'SELECT (SELECT GROUP_CONCAT(suffix || '' '' || guest_name) FROM MFExcursionNameList WHERE idx_transaction = b.idx_transaction) AS namelist, b.Remark AS remark, b.Remark_supplier AS remark_supplier, a.status AS stat , a.idx_mfexcursion AS idx_mfexcursion, strftime(''%d/%m/%Y %H:%M'', a.crea_date) AS date_tr, b.idx_transaction AS idx_transaction, c.code_exc AS excursion_code, UPPER( Ifnull(z.description, c.name_exc) || Ifnull(y.description, Ifnull('' ('' || d.sub_excursion || '')'', ''''))) AS excursion_alias, UPPER(c.name_exc) AS excursion, Ifnull(d.sub_excursion, '''') AS sub, ''('' || UPPER(e.gender) || '') '' || UPPER(e.firstname) || '' ''  || UPPER(e.familyname) AS guestname, a.exc_number AS voucher, UPPER(o.name_a) AS agent, UPPER(f.name_h) || CASE WHEN LENGTH(b.room_no)>0 THEN '' / ROOM '' || b.room_no ELSE '''' END AS hotel, b.room_no AS hotel_room, strftime(''%d/%m/%Y %H:%M'', b.pickup) AS pickup, ''@:repname:'' AS rep, i.salesrate AS salesrate, (b.promo+IFNULL((SELECT value_promo FROM MFExcursionTransactionDiscount md INNER JOIN MFExcursionTransactionHeader mh ON mh.idx_mfexcursion = md.idx_mfexcursion WHERE md.idx_transaction = b.idx_transaction), 0)) AS promo, Ifnull(j.adult, ''0'') AS paxa, Ifnull(k.child, ''0'') AS paxc, Ifnull(l.infant, ''0'') AS paxi, ( i.salesrate + Ifnull(m.sc, ''0'') ) - b.promo - Ifnull(n.val_promo, ''0'') AS totalsales, p.curr AS currency, (SELECT UPPER(supplier_name) FROM msexcursion a1 INNER JOIN mssupplier b1 ON a1.idx_supplier = b1.idx_supplier WHERE a1.idx_excursion = b.idx_excursion) AS supplier, (SELECT idx_paymenttype FROM mfexcursionpaymentdetail WHERE idx_mfexcursion = a.idx_mfexcursion LIMIT 1) AS payment, (SELECT CASE WHEN lower(idx_paymenttype) = ''cc'' THEN ''CREDIT CARD'' WHEN lower(idx_paymenttype) = ''cash'' THEN ''CASH'' WHEN lower(idx_paymenttype) = ''ca'' THEN ''CASH'' WHEN lower(idx_paymenttype) = ''pot'' THEN ''PAY ON TOUR'' end || Group_concat('' '' || b1.code ||'' ''|| amount) FROM mfexcursionpaymentdetail a1 INNER JOIN mscurrency b1 ON a1.idx_currency = b1.idx_currency WHERE idx_mfexcursion = a.idx_mfexcursion) AS val_payment,(SELECT Group_concat(ms.supplement || '' ('' || p.curr || '' '' || mf.price || '')'') FROM MFExcursionSurcharge mf INNER JOIN MFExcursionTransactionHeader mh ON mh.idx_transaction = mf.idx_transaction INNER JOIN MSSupplement ms ON ms.idx_supplement = mf.idx_supplement WHERE mf.idx_transaction = b.idx_transaction) AS surcharge_detail FROM (SELECT * FROM mfexcursionheader) a INNER JOIN (SELECT * FROM mfexcursiontransactionheader) b ON a.idx_mfexcursion = b.idx_mfexcursion INNER JOIN msexcursion c ON b.idx_excursion = c.idx_excursion LEFT OUTER JOIN msexcursionsub d ON b.idx_sub_excursion = d.idx_sub_excursion INNER JOIN mfexcursioncontactdetail e ON a.idx_mfexcursion = e.idx_mfexcursion INNER JOIN mshotel f ON b.idx_hotel = f.idx_htl INNER JOIN (SELECT idx_transaction, Sum(totalsalesrate) AS salesrate FROM mfexcursiontransactionitem GROUP BY idx_transaction) i ON b.idx_transaction = i.idx_transaction LEFT OUTER JOIN (SELECT idx_transaction, Sum(pax) AS Adult FROM mfexcursiontransactionitem WHERE chargetype = ''A'' GROUP BY idx_transaction) j ON b.idx_transaction = j.idx_transaction LEFT OUTER JOIN (SELECT idx_transaction, Sum(pax) AS Child FROM mfexcursiontransactionitem WHERE chargetype = ''C'' GROUP BY idx_transaction) k ON b.idx_transaction = k.idx_transaction LEFT OUTER JOIN (SELECT idx_transaction, Sum(pax) AS Infant FROM mfexcursiontransactionitem WHERE chargetype = ''I'' GROUP BY idx_transaction) l ON b.idx_transaction = l.idx_transaction LEFT OUTER JOIN (SELECT idx_mfexcursion, idx_transaction, Sum(price) AS SC FROM mfexcursionsurcharge GROUP BY idx_mfexcursion, idx_transaction) m ON a.idx_mfexcursion = m.idx_mfexcursion AND b.idx_transaction = m.idx_transaction LEFT OUTER JOIN (SELECT idx_mfexcursion, idx_transaction, Sum(value_promo) AS val_promo FROM mfexcursiontransactiondiscount GROUP BY idx_mfexcursion, idx_transaction) n ON a.idx_mfexcursion = n.idx_mfexcursion AND b.idx_transaction = n.idx_transaction INNER JOIN msagent o ON b.idx_client = o.idx_a INNER JOIN (SELECT DISTINCT idx_transaction, t.code AS curr FROM mfexcursiontransactionitem s INNER JOIN mscurrency t ON s.idx_currencysalesrate = t.idx_currency) p ON b.idx_transaction = p.idx_transaction LEFT JOIN msexcursion_language z ON z.idx_excursion = c.idx_excursion AND z.idx_language = ''@:id_language:'' AND z.description <> '''' LEFT JOIN msexcursionsub_language y ON y.idx_sub = d.idx_sub_excursion AND y.idx_language = ''@:id_language:'' WHERE a.status <> ''x'' AND a.exc_number LIKE ''%@:search:%'' AND Date(a.crea_date) BETWEEN ''@:fromdate:'' AND Strftime(''%Y-%m-%d'', datetime(''now'', ''localtime'')) OR a.status <> ''x'' AND c.name_exc LIKE ''%@:search:%'' AND Date(a.crea_date) BETWEEN ''@:fromdate:'' AND Strftime(''%Y-%m-%d'', datetime(''now'', ''localtime'')) OR a.status <> ''x'' AND e.firstname LIKE ''%@:search:%'' AND Date(a.crea_date) BETWEEN ''@:fromdate:'' AND Strftime(''%Y-%m-%d'', datetime(''now'', ''localtime'')) OR a.status <> ''x'' AND e.familyname LIKE ''%@:search:%'' AND Date(a.crea_date) BETWEEN ''@:fromdate:'' AND Strftime(''%Y-%m-%d'', datetime(''now'', ''localtime'')) OR a.status <> ''x'' AND o.name_a LIKE ''%@:search:%'' AND Date(a.crea_date) BETWEEN ''@:fromdate:'' AND Strftime(''%Y-%m-%d'', datetime(''now'', ''localtime'')) ORDER BY a.exc_number DESC ')"
    sql(ssql);

    //list transaction sync
    ssql = "INSERT INTO ssql VALUES('ALL', 'LIST_TRANSACTION_SYNC', '@:status:', 'SELECT a.idx_mfexcursion AS idx_mfexcursion, a.Exc_number AS number, a.DateTransaksi AS date, b.Gender AS gender, b.FirstName AS fname, b.FamilyName AS lname, c.trn AS count FROM(select * from MFExcursionHeader where status=''@:status:'') a INNER JOIN (select * from MFExcursionContactDetail where status=''@:status:'') b ON a.idx_mfexcursion=b.idx_mfexcursion INNER JOIN (SELECT COUNT(*) AS trn, idx_mfexcursion FROM MFExcursionTransactionHeader where status =''@:status:'' GROUP BY idx_mfexcursion) c ON a.idx_mfexcursion=c.idx_mfexcursion ')"
    sql(ssql);

    //list transaction index
    ssql = "INSERT INTO ssql VALUES('ALL', 'LIST_TRANSACTION_INDEX', '@:idx_mfexcursion:', 'SELECT b.exc_numb, a.email as Email2,b.idx_transaction,b.idx_mfexcursion,c.idx_supplier,c.Email1 FROM MFExcursionTransactionHeader b INNER JOIN MSSupplier c ON b.idx_supplier=c.idx_supplier inner join MFExcursionContactDetail a on b.idx_mfexcursion=a.idx_mfexcursion WHERE a.idx_mfexcursion=''@:idx_mfexcursion:'' ')"
    sql(ssql);

    //delete tmp header
    ssql = "INSERT INTO ssql VALUES('ALL', 'DELETE_TMP_HEADER', '@:id_transaction:', 'DELETE FROM TMP_MFExcursionTransactionHeader WHERE idx_transaction LIKE ''%@:id_transaction:%'' ')"
    sql(ssql);

    //delete tmp item
    ssql = "INSERT INTO ssql VALUES('ALL', 'DELETE_TMP_ITEM', '@:id_transaction:', 'DELETE FROM TMP_MFExcursionTransactionItem WHERE idx_transaction LIKE ''%@:id_transaction:%'' ')"
    sql(ssql);

    //delete tmp surcharge
    ssql = "INSERT INTO ssql VALUES('ALL', 'DELETE_TMP_SURCHARGE', '@:id_transaction:', 'DELETE FROM TMP_MFExcursionSurcharge WHERE idx_transaction LIKE ''%@:id_transaction:%'' ')"
    sql(ssql);

    //delete tmp discount
    ssql = "INSERT INTO ssql VALUES('ALL', 'DELETE_TMP_DISCOUNT', '@:id_transaction:', 'DELETE FROM TMP_MFExcursionTransactionDiscount WHERE idx_transaction LIKE ''%@:id_transaction:%'' ')"
    sql(ssql);

    //insert tmp header
    ssql = "INSERT INTO ssql VALUES('ALL', 'INSERT_TMP_HEADER', '@:tr_number:,@:id_excursion:,@:id_excursub:,@:time_pickup:,@:id_hotel:,@:room:,@:id_agent:,@:id_supplier:,@:remark:,@:remark_supplier:,@:id_transaction:,@:id_market:,@:user:,@:date:,@:lbl_excursion:,@:lbl_hotel:,@:lbl_currency:,@:lbl_price:,@:lbl_excursub:,@:proceed_allotment:', ' INSERT INTO TMP_MFExcursionTransactionHeader VALUES('' '',''@:tr_number:'','' '',''@:id_excursion:'',''@:id_excursub:'','' '',''@:time_pickup:'',''@:id_hotel:'',''@:room:'',''@:id_agent:'',''@:id_supplier:'','' '',''@:remark:'',''@:remark_supplier:'',''0'','' '',''PR'',''@:id_transaction:'',''@:id_market:'','' '',''0'',''@:user:'',''@:date:'',''@:user:'',''@:date:'',''@:lbl_excursion:'',''@:lbl_hotel:'',''@:lbl_currency:'',''@:lbl_price:'',''@:lbl_excursub:'',''@:proceed_allotment:'') ')"
    sql(ssql);

    //insert tmp item
    ssql = "INSERT INTO ssql VALUES('ALL', 'INSERT_TMP_ITEM', '@:id_transaction:,@:aci:,@:pax_qty:,@:age:,@:salesrate:,@:id_currency:,@:total_salesrate:,@:newid:,@:user:,@:date:', 'INSERT INTO TMP_MFExcursionTransactionItem VALUES(''@:id_transaction:'','' '','' '',''@:aci:'',''@:pax_qty:'',''@:age:'','' '','' '',''@:salesrate:'',''@:id_currency:'','' '','' '',''@:total_salesrate:'',''@:newid:'',''@:user:'',''@:date:'',''@:user:'',''@:date:'') ')"
    sql(ssql);

    //insert tmp surcharge
    ssql = "INSERT INTO ssql VALUES('ALL', 'INSERT_TMP_SURCHARGE', '@:tr_number:,@:id_transaction:,@:id_surcharge:,@:price:,@:newid:,@:user:,@:date:', 'INSERT INTO TMP_MFExcursionSurcharge VALUES('' '',''@:tr_number:'',''@:id_transaction:'',''@:id_surcharge:'',''@:price:'',''@:newid:'',''@:user:'',''@:date:'',''@:user:'',''@:date:'') ')"
    sql(ssql);

    //insert tmp discount per item
    ssql = "INSERT INTO ssql VALUES('ALL', 'INSERT_TMP_DISCOUNT', '@:id_mf:,@:id_transaction:,@:id_promo:,@:promo_value:,@:newid:', 'INSERT INTO TMP_MFExcursionTransactionDiscount VALUES(''@:id_mf:'',''@:id_transaction:'',''@:id_promo:'',''@:promo_value:'',''@:newid:'');')"
    sql(ssql);

    //insert mf header
    ssql = "INSERT INTO ssql VALUES('ALL', 'INSERT_MF_HEADER', '@:tr_number:,@:date:,@:ratedate:,@:id_currency:,@:total_price:,@:id_user:,@:id_mf:,@:id_company:,@:id_branch:,@:remark_internal:,@:remark_guest:,@:user:', 'INSERT INTO mfexcursionheader VALUES(''@:tr_number:'', ''@:date:'', ''@:ratedate:'', ''@:id_currency:'', ''@:total_price:'', ''@:id_user:'', ''R'', ''@:id_mf:'', ''@:id_company:'', ''@:id_branch:'', ''@:remark_internal:'', ''@:remark_guest:'', ''@:user:'', ''@:date:'', ''@:user:'', ''@:date:'', ''0'')')"
    sql(ssql);

    //insert mf contact
    ssql = "INSERT INTO ssql VALUES('ALL', 'INSERT_MF_CONTACT', '@:id_mf:,@:tr_number:,@:gender:,@:fname:,@:lname:,@:email:,@:confirm_email:,@:phone:,@:mobile:,@:fax:,@:newid:,@:user:,@:date:', ' INSERT INTO MFExcursionContactDetail VALUES(''@:id_mf:'',''@:tr_number:'',''@:gender:'',''@:fname:'',''@:lname:'',''@:email:'',''@:confirm_email:'',''@:phone:'',''@:mobile:'',''@:fax:'',''@:newid:'',''@:user:'',''@:date:'',''@:user:'',''@:date:'',''0'') ')"
    sql(ssql);

    //insert mf payment
    ssql = "INSERT INTO ssql VALUES('ALL', 'INSERT_MF_PAYMENT', '@:id_mf:,@:tr_number:,@:payment_type:,@:name_of_card:,@:billing_address1:,@:billing_address2:,@:id_country:,@:id_state:,@:zip_code:,@:card_type:,@:card_numb:,@:exp_date:,@:secure_code:,@:total_price:,@:id_currency:,@:newid:,@:user:,@:date:', 'INSERT INTO MFExcursionPaymentDetail VALUES(''@:id_mf:'',''@:tr_number:'',''@:payment_type:'',''@:name_of_card:'',''@:billing_address1:'',''@:billing_address2:'',''@:id_country:'',''@:id_state:'',''@:zip_code:'',''@:card_type:'',''@:card_numb:'',''@:exp_date:'',''@:secure_code:'',''@:total_price:'',''@:id_currency:'',''@:newid:'',''@:user:'',''@:date:'',''@:user:'',''@:date:'',''0'') ')"
    sql(ssql);

    //insert tr header
    ssql = "INSERT INTO ssql VALUES('ALL', 'INSERT_TR_HEADER', '@:id_mf:,@:voucher:', 'INSERT INTO MFExcursionTransactionHeader SELECT ''@:id_mf:'', exc_numb, idx_comp, idx_excursion, idx_sub_excursion, RefNumber, pickup, idx_hotel, Room_no, idx_client, idx_supplier, ConfirmBy, Remark, Remark_supplier, UsedUnitRoom, idx_contract, StsActive, idx_transaction, idx_from, category, promo, crea_by, crea_date, modi_by, Modi_date,''0'' FROM tmp_MFExcursionTransactionHeader WHERE exc_numb LIKE ''%@:voucher:%'' ')"
    sql(ssql);

    //insert tr item
    ssql = "INSERT INTO ssql VALUES('ALL', 'INSERT_TR_ITEM', '@:id_mf:,@:voucher:', ' INSERT INTO MFExcursionTransactionItem SELECT idx_transaction, ''@:id_mf:'', idx_contract, ChargeType, Pax, Age, BuyRate, idx_CurrrencyBuyRate, SalesRate, idx_currencySalesRate, Rate, TotalBuyRate, TotalSalesRate, idx_transactionItem, crea_by, crea_date, modi_by, modi_date,''0'' FROM TMP_MFExcursionTransactionItem WHERE idx_transaction IN(SELECT idx_transaction FROM tmp_MFExcursionTransactionHeader WHERE exc_numb LIKE ''%@:voucher:%'') ')"
    sql(ssql);

    //insert tr surcharge
    ssql = "INSERT INTO ssql VALUES('ALL', 'INSERT_TR_SURCHARGE', '@:id_mf:,@:voucher:', 'INSERT INTO MFExcursionSurcharge SELECT ''@:id_mf:'', exc_numb, idx_transaction, idx_supplement, Price, Idx_Surcharge, crea_by, crea_date, modi_by, modi_date,''0'' FROM TMP_MFExcursionSurcharge WHERE exc_numb LIKE ''%@:voucher:%'' ')"
    sql(ssql);

    //insert mf discount
    ssql = "INSERT INTO ssql VALUES('ALL', 'INSERT_MF_DISCOUNT', '@:id_mf:,@:id_transact:,@:id_promo:,@:discount_value:,@:newid:', 'INSERT INTO MFExcursionTransactionDiscount VALUES(''@:id_mf:'', ''@:id_transact:'', ''@:id_promo:'', ''@:discount_value:'', ''@:newid:'', ''0'') ')"
    sql(ssql);

    //insert mf discount dcpi
    ssql = "INSERT INTO ssql VALUES('ALL', 'INSERT_MF_DISCOUNT_DCPI', '@:id_mf:', 'INSERT INTO MFExcursionTransactionDiscount SELECT ''@:id_mf:'', idx_transaction, idx_promo, value_promo, idx_trnpromo, ''0'' FROM TMP_MFExcursionTransactionDiscount  ')"
    sql(ssql);

    //printf required sqlite 3.8.3 (2014)
    ssql = "INSERT INTO ssql VALUES('ALL', 'LIST_CATALOG', '@:search:,@:date:', 'SELECT Replace(Replace(Upper(Ifnull(z.description, mse.name_exc) || Ifnull('' '' || y.description, Ifnull('' '' || mss.sub_excursion, ''''))), ''\"'', ''''), '''''''', '''') AS product,( CASE WHEN msj.chargetype = ''A'' THEN ''adult'' WHEN msj.chargetype = ''C'' THEN ''child'' WHEN msj.chargetype = ''I'' THEN ''infant'' WHEN msj.chargetype = ''S'' THEN ''service'' END) AS charge, (SELECT code || '' '' FROM mscurrency WHERE idx_currency = msj.idx_currencyjual) || printf(''%.2f'',msj.hjual) AS price, ( CASE WHEN mse.pupp = ''pp'' THEN ''pax'' WHEN mse.pupp = ''pu'' THEN ''unit'' END ) AS type, msj.validfrom, msj.validto FROM msexcursion mse LEFT JOIN msexcursionsub mss ON mss.idx_excursion = mse.idx_excursion INNER JOIN msmarkup_jual msj ON msj.idx_excursion = mse.idx_excursion AND msj.idx_sub_excursion = IFNULL(mss.idx_sub_excursion, '''') AND Date(msj.validfrom) <= Date(''@:date:'') AND Date(msj.validto) >= Date(''@:date:'') AND idx_market = (SELECT value FROM config WHERE name = ''market'') AND (msj.chargetype = ''A'' OR msj.chargetype = ''S'') LEFT JOIN msexcursion_language z ON z.idx_excursion = mse.idx_excursion AND z.idx_language = (SELECT value FROM config WHERE name = ''language'') AND z.description <> '''' LEFT JOIN msexcursionsub_language y ON y.idx_sub = mss.idx_sub_excursion AND y.idx_language = (SELECT value FROM config WHERE name = ''language'') WHERE product LIKE ''%@:search:%'' ORDER BY product, charge ')"
    sql(ssql);

    ssql = "INSERT INTO ssql VALUES('ALL', 'INSERT_MANUAL_BOOKING', '@:booking_date:, @:id_excursion:, @:id_sub:, @:product:, @:id_supplier:,  @:supplier:, @:id_agent:, @:agent:, @:id_hotel:, @:hotel:, @:room:, @:pickup_time:, @:tour_date:, @:pax_adult:, @:pax_child:, @:pax_infant:, @:guest_name:, @:payment:, @:price:, @:currency:, @:pupp:, @:remark:', 'INSERT INTO _manual_booking_ VALUES(''@:booking_date:'', ''@:id_excursion:'', ''@:id_sub:'', ''@:product:'',  ''@:id_supplier:'', ''@:supplier:'', ''@:id_agent:'', ''@:agent:'', ''@:id_hotel:'', ''@:hotel:'', ''@:room:'', ''@:pickup_time:'', ''@:tour_date:'', ''@:pax_adult:'', ''@:pax_child:'', ''@:pax_infant:'', ''@:guest_name:'', ''@:payment:'', ''@:price:'', ''@:currency:'', ''@:pupp:'', ''@:remark:'');')"
    sql(ssql);

    ssql = "INSERT INTO ssql VALUES('ALL', 'LIST_MANUAL_BOOKING', '', 'SELECT * FROM _manual_booking_')"
    sql(ssql);

    ssql = "INSERT INTO ssql VALUES('ALL', 'LIST_PRODUCT_RAW', '@:search:', 'SELECT CASE WHEN s.idx_sub_excursion IS NULL THEN e.name_exc WHEN s.idx_sub_excursion IS NOT NULL THEN e.name_exc || ''('' || s.sub_excursion || '')'' END AS product, supplier_name AS supplier, e.pickup, e.dropoff, e.pupp, e.idx_supplier, e.idx_excursion, s.idx_sub_excursion FROM MSExcursion e LEFT JOIN MSExcursionSub s ON s.idx_excursion = e.idx_excursion INNER JOIN MSSupplier f ON f.idx_supplier = e.idx_supplier WHERE product LIKE ''%@:search:%'' ORDER BY product LIMIT 10')"
    sql(ssql);

    callback();
}
function ssql_module_check(callback) {

    ssql = 'SELECT * FROM ssql';
    sql(ssql, function (result) {
        //validation start
        var valid_fn = 'GET_PRICE,GET_PRICE_SURPAX,GET_PRICE_SURPAX_GKT,GET_PRICE_SURTEL,LIST_CART_DCPI,LIST_LOCATION,LIST_EXCURSION,LIST_AGENT,LIST_HOTEL,LIST_PICKUP,LIST_ALLOTMENT,GET_TRANSACTION_NUMBER,GET_PRICE_CC,GET_CURRENCY_COMPANY,GET_EXCHANGERATE,LIST_EXCHANGERATE,LIST_EXCHANGERATE_CC,LIST_CURRENCY,LIST_MONTH,GET_DISCOUNT,GET_DISCOUNT_DCPI,LIST_TRANSACTION,LIST_TRANSACTION_SYNC,LIST_TRANSACTION_INDEX,DELETE_TMP_HEADER,DELETE_TMP_ITEM,DELETE_TMP_SURCHARGE,DELETE_TMP_DISCOUNT,INSERT_TMP_HEADER,INSERT_TMP_ITEM,INSERT_TMP_SURCHARGE,INSERT_TMP_DISCOUNT,INSERT_MF_HEADER,INSERT_MF_CONTACT,INSERT_MF_PAYMENT,INSERT_TR_HEADER,INSERT_TR_ITEM,INSERT_TR_SURCHARGE,INSERT_MF_DISCOUNT,INSERT_MF_DISCOUNT_DCPI,LIST_CATALOG,INSERT_MANUAL_BOOKING,LIST_MANUAL_BOOKING,LIST_PRODUCT_RAW';
        var valid = valid_fn.split(',');
        var valid_count = valid.length;
        var ssql_count = result.rows.length;

        SQL_QUERY_DATA = result.rows._array;

        if (valid_count != ssql_count) {
            alert('Some of sql script are missing from sqlite database, ' +
                'this application will not run properly!\n\n' +
                'Please contact our database administrator to generate new correct database.');
        }

        callback();
    });
}

