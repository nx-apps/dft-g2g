exports.getByContractId = function (req, res) {
    var r = req._r;
    var orderby = req.query.orderby;
    r.db('g2g').table('book')
        .getAll(req.params.contract_id, { index: 'tags' })
        .filter({ book_status: false })
        .eqJoin("shm_id", r.db('g2g').table("shipment")).pluck("left", { right: ["cl_id", "contract_id", "shm_no", "shm_status"] }).zip()
        .filter({ shm_status: true })
        .eqJoin("cl_id", r.db('g2g').table("confirm_letter")).pluck("left", { right: [ "cl_no", "cl_date", "incoterms"] }).zip()
        .eqJoin("contract_id", r.db('g2g').table("contract")).pluck("left", { right: ["contract_name", "contract_date"] }).zip()
        .eqJoin('carrier_id', r.db('common').table('carrier')).pluck("left", { right: "carrier_name" }).zip()
        .eqJoin('shipline_id', r.db('common').table('shipline')).pluck("left", { right: ["shipline_name", "shipline_tel"] }).zip()
        .eqJoin("load_port_id", r.db('common').table("port")).map(function (port) {
            return port.merge({
                right: {
                    load_port_name: port("right")("port_name"),//r.row["right"]["port_name"]
                    load_port_code: port("right")("port_code")
                }
            })
        }).pluck("left", { right: ["load_port_name", "load_port_code"] }).zip()
        .eqJoin("dest_port_id", r.db('common').table("port")).map(function (port) {
            return port.merge({
                right: {
                    dest_port_name: port("right")("port_name"),//r.row["right"]["port_name"]
                    dest_port_code: port("right")("port_code")
                }
            })
        }).pluck("left", { right: ["dest_port_name", "dest_port_code"] }).zip()
        .eqJoin("deli_port_id", r.db('common').table("port")).map(function (port) {
            return port.merge({
                right: {
                    deli_port_name: port("right")("port_name"),//r.row["right"]["port_name"]
                    deli_port_code: port("right")("port_code")
                }
            })
        }).pluck("left", { right: ["deli_port_name", "deli_port_code"] }).zip()
        .merge(function (m) {
            return {
                book_id: m('id'),
                ship: m('ship').map(function (arr_ship) {
                    return arr_ship.merge(function (row_ship) {
                        return r.db('common').table('ship').get(row_ship('ship_id')).pluck('ship_name')
                    })
                }),
                surveyor: m('surveyor').map(function (arr_surveyor) {
                    return arr_surveyor.merge(function (row_surveyor) {
                        return r.db('common').table('surveyor').get(row_surveyor('surveyor_id')).pluck('surveyor_name')
                    })
                }),
                incoterms: m('incoterms').map(function (arr_inct) {
                    return arr_inct.merge(function (row_inct) {
                        return r.db('common').table('incoterms').get(row_inct('inct_id')).pluck('inct_name')
                    })
                }),
                etd_date: m('etd_date').split('T')(0),
                eta_date: m('eta_date').split('T')(0),
                packing_date: m('packing_date').split('T')(0),
                product_date: m('product_date').split('T')(0),
                cl_date: m('cl_date').split('T')(0),
                contract_date: m('contract_date').split('T')(0),
                cut_of_date: m('cut_of_date').split('T')(0),
                // date_created: m('date_created').split('T')(0),
                // date_updated: m('date_updated').split('T')(0)
            }
        })
        .without('id', 'tags')
        .orderBy(r.desc('date_created'), 'bl_no')
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.getByShmId = function (req, res) {
    var r = req._r;
    r.db('g2g').table('book')
        .getAll(req.params.shm_id, { index: 'shm_id' })
        .eqJoin("shm_id", r.db('g2g').table("shipment")).without({ right: ["id", "date_created", "date_updated", "creater", "updater", "tags"] }).zip()
        .eqJoin("cl_id", r.db('g2g').table("confirm_letter")).pluck("left", { right: ["cl_date", "incoterms"] }).zip()
        .eqJoin('carrier_id', r.db('common').table('carrier')).pluck("left", { right: "carrier_name" }).zip()
        .eqJoin('shipline_id', r.db('common').table('shipline')).pluck("left", { right: ["shipline_name", "shipline_tel"] }).zip()
        .eqJoin("load_port_id", r.db('common').table("port")).map(function (port) {
            return port.merge({
                right: {
                    load_port_name: port("right")("port_name"),//r.row["right"]["port_name"]
                    load_port_code: port("right")("port_code")
                }
            })
        }).pluck("left", { right: ["load_port_name", "load_port_code"] }).zip()
        .eqJoin("dest_port_id", r.db('common').table("port")).map(function (port) {
            return port.merge({
                right: {
                    dest_port_name: port("right")("port_name"),//r.row["right"]["port_name"]
                    dest_port_code: port("right")("port_code")
                }
            })
        }).pluck("left", { right: ["dest_port_name", "dest_port_code"] }).zip()
        .eqJoin("deli_port_id", r.db('common').table("port")).map(function (port) {
            return port.merge({
                right: {
                    deli_port_name: port("right")("port_name"),//r.row["right"]["port_name"]
                    deli_port_code: port("right")("port_code")
                }
            })
        }).pluck("left", { right: ["deli_port_name", "deli_port_code"] }).zip()
        .merge(function (m) {
            return {
                book_id: m('id'),
                ship: m('ship').map(function (arr_ship) {
                    return arr_ship.merge(function (row_ship) {
                        return r.db('common').table('ship').get(row_ship('ship_id')).pluck('ship_name')
                    })
                }),
                surveyor: m('surveyor').map(function (arr_surveyor) {
                    return arr_surveyor.merge(function (row_surveyor) {
                        return r.db('common').table('surveyor').get(row_surveyor('surveyor_id')).pluck('surveyor_name')
                    })
                }),
                incoterms: m('incoterms').map(function (arr_inct) {
                    return arr_inct.merge(function (row_inct) {
                        return r.db('common').table('incoterms').get(row_inct('inct_id')).pluck('inct_name')
                    })
                }),
                etd_date: m('etd_date').split('T')(0),
                eta_date: m('eta_date').split('T')(0),
                packing_date: m('packing_date').split('T')(0),
                product_date: m('product_date').split('T')(0),
                cl_date: m('cl_date').split('T')(0),
                cut_of_date: m('cut_of_date').split('T')(0),
                // date_created: m('date_created').split('T')(0),
                // date_updated: m('date_updated').split('T')(0)
            }
        })
        .without('id', 'tags')
        .orderBy(r.desc('date_created'), 'bl_no')
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.getById = function (req, res) {
    var r = req._r;
    r.db('g2g').table('book')
        .get(req.params.book_id)
        .merge(function (m) {
            return r.db('g2g').table("shipment").get(m('shm_id')).pluck("cl_id", "contract_id", "shm_no")
        })
        .merge(function (m) {
            return r.db('g2g').table("confirm_letter").get(m('cl_id')).pluck("cl_no", "incoterms", "cl_date")
        })
        .merge(function (m) {
            return r.db('g2g').table("contract").get(m('contract_id')).pluck("contract_date", "contract_name", "buyer_id")
        })
        .merge(function (me) {
            return {
                book_id: me('id'),
                bl_detail: r.db('g2g').table('shipment_detail')
                    .getAll(req.params.book_id, { index: 'book_id' })
                    .group(function (g) {
                        return g.pluck(
                            "type_rice_id", "package_id", "price_per_ton"
                        )
                    })
                    .sum("shm_det_quantity")
                    .ungroup()
                    .merge(function (me2) {
                        return {
                            type_rice_id: me2('group')('type_rice_id'),
                            package_id: me2('group')('package_id'),
                            price_per_ton: me2('group')('price_per_ton'),
                            quantity_tons: me2('reduction')
                        }
                    })
                    .without("group", "reduction")
                    .eqJoin("package_id", r.db('common').table("package")).without({ right: ["id", "date_created", "date_updated", "creater", "updater"] }).zip()
                    .merge(function (me2) {
                        return {
                            quantity_bags: me2('quantity_tons').mul(1000).div(me2('package_kg_per_bag'))
                        }
                    })
                    .merge(function (me2) {
                        return {
                            weight_gross: me2('quantity_bags').mul(me2('package_kg_per_bag').add(me2('package_weight_bag').div(1000))).div(1000),
                            weight_net: me2('quantity_bags').mul(me2('package_kg_per_bag')).div(1000),
                            weight_tare: me2('quantity_bags').mul(me2('package_weight_bag').div(1000)).div(1000)

                        }
                    })
                    .merge(function (me2) {
                        return {
                            amount_usd: me2('price_per_ton').mul(me2('weight_net'))
                        }
                    })
                    .eqJoin("type_rice_id", r.db('common').table("type_rice")).without({ right: ["id", "date_created", "date_updated", "creater", "updater"] }).zip()
                    .coerceTo('array')
                    .orderBy('date_updated')
            }
        })
        .merge(function (me) {
            return {
                weight_gross: me('bl_detail').sum('weight_gross'),
                weight_net: me('bl_detail').sum('weight_net'),
                weight_tare: me('bl_detail').sum('weight_tare'),
                amount_usd: me('bl_detail').sum('amount_usd'),
                quantity_bags: me('bl_detail').sum('quantity_bags'),
                cl_date: me('cl_date').split('T')(0),
                contract_date: me('contract_date').split('T')(0),
                eta_date: me('eta_date').split('T')(0),
                etd_date: me('etd_date').split('T')(0),
                packing_date: me('packing_date').split('T')(0),
                product_date: me('product_date').split('T')(0),
                ship: me('ship').map(function (arr_ship) {
                    return arr_ship.merge(function (row_ship) {
                        return r.db('common').table('ship').get(row_ship('ship_id')).pluck('ship_name')
                    })
                }),
                surveyor: me('surveyor').map(function (arr_surveyor) {
                    return arr_surveyor.merge(function (row_surveyor) {
                        return r.db('common').table('surveyor').get(row_surveyor('surveyor_id')).pluck('surveyor_name')
                    })
                }),
                incoterms: me('incoterms').map(function (arr_inct) {
                    return arr_inct.merge(function (row_inct) {
                        return r.db('common').table('incoterms').get(row_inct('inct_id')).pluck('inct_name')
                    })
                })
            }
        })
        .merge(function (m) {
            return {
                buyer_country_id: r.db('common').table("buyer").get(m('buyer_id')).getField('country_id'),
                dest_port_name: r.db('common').table("port").get(m('dest_port_id')).getField('port_name'),
                dest_port_code: r.db('common').table("port").get(m('dest_port_id')).getField('port_code'),
                dest_country_id: r.db('common').table("port").get(m('dest_port_id')).getField('country_id'),
                deli_port_name: r.db('common').table("port").get(m('deli_port_id')).getField('port_name'),
                deli_port_code: r.db('common').table("port").get(m('deli_port_id')).getField('port_code'),
                deli_country_id: r.db('common').table("port").get(m('deli_port_id')).getField('country_id'),
                load_port_name: r.db('common').table("port").get(m('load_port_id')).getField('port_name'),
                load_port_code: r.db('common').table("port").get(m('load_port_id')).getField('port_code'),
                load_country_id: r.db('common').table("port").get(m('load_port_id')).getField('country_id')
            }
        })
        .merge(function (m) {
            return {
                buyer_country_fullname_en: r.db('common').table("country").get(m('buyer_country_id')).getField('country_fullname_en'),
                buyer_country_name_en: r.db('common').table("country").get(m('buyer_country_id')).getField('country_name_en'),
                buyer_country_name_th: r.db('common').table("country").get(m('buyer_country_id')).getField('country_name_th'),
                dest_country_fullname_en: r.db('common').table("country").get(m('dest_country_id')).getField('country_fullname_en'),
                dest_country_name_en: r.db('common').table("country").get(m('dest_country_id')).getField('country_name_en'),
                dest_country_name_th: r.db('common').table("country").get(m('dest_country_id')).getField('country_name_th'),
                deli_country_fullname_en: r.db('common').table("country").get(m('deli_country_id')).getField('country_fullname_en'),
                deli_country_name_en: r.db('common').table("country").get(m('deli_country_id')).getField('country_name_en'),
                deli_country_name_th: r.db('common').table("country").get(m('deli_country_id')).getField('country_name_th'),
                load_country_fullname_en: r.db('common').table("country").get(m('load_country_id')).getField('country_fullname_en'),
                load_country_name_en: r.db('common').table("country").get(m('load_country_id')).getField('country_name_en'),
                load_country_name_th: r.db('common').table("country").get(m('load_country_id')).getField('country_name_th')
            }
        })
        .merge(function (m) {
            return r.db('common').table("buyer").get(m('buyer_id')).pluck('buyer_name', 'buyer_address', 'buyer_tel', 'buyer_fax', 'buyer_email', 'buyer_masks')
        })
        .merge(function (m) {
            return r.db('common').table("shipline").get(m('shipline_id')).pluck('shipline_name', 'shipline_tel')
        })
        .merge(function (m) {
            return r.db('common').table("carrier").get(m('carrier_id')).pluck('carrier_name')
        })
        .without('id', 'tags')
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.insert = function (req, res) {
    var valid = req._validator.validate('g2g.book', req.body);
    var r = req._r;
    var result = { result: false, message: null, id: null };
    if (valid) {
        r.db("g2g").table("book")
            .insert(req.body)
            .run()
            .then(function (response) {
                result.message = response;
                if (response.errors == 0) {
                    result.result = true;
                    result.id = response.generated_keys;
                }
                res.json(result);
            })
            .error(function (err) {
                result.message = err;
                res.json(result);
            })
    } else {
        result.message = req._validator.errorsText()
        res.json(result);
    }
}
exports.update = function (req, res) {
    var r = req._r;
    var result = { result: false, message: null, id: null };
    if (req.body.id != '' && req.body.id != null && typeof req.body.id != 'undefined') {
        result.id = req.body.id;
        r.db("g2g").table("book")
            .get(req.body.id)
            .update(req.body)
            .run()
            .then(function (response) {
                result.message = response;
                if (response.errors == 0) {
                    result.result = true;
                }
                res.json(result);
            })
            .error(function (err) {
                result.message = err;
                res.json(result);
            })
    } else {
        result.message = 'require field id';
        res.json(result);
    }
}
exports.delete = function (req, res) {
    var r = req._r;
    var result = { result: false, message: null, id: null };
    if (req.params.id != '' || req.params.id != null) {
        result.id = req.params.id;
        var q = r.db('g2g').table("book").get(req.params.id).do(function (result) {
            return r.branch(
                result('book_status').eq(false)
                , r.db('g2g').table('shipment_detail').getAll(req.params.id, { index: 'book_id' }).delete()
                    .do(delete_do => {
                        return r.db('g2g').table('book').get(req.params.id).delete()
                    })
                , r.expr("Can't delete because this status = true.")
            )
        })
        q.run()
            .then(function (response) {
                result.message = response;
                if (response.errors == 0) {
                    result.result = true;
                }
                res.json(result);
            })
            .error(function (err) {
                result.message = err;
                res.json(result);
            })
    } else {
        result.message = 'require field id';
        res.json(result);
    }
}