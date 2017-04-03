exports.getByBookId = function (req, res) {
    var r = req.r;
    r.db('g2g2').table("shipment_detail")
        .getAll(req.params.book_id, { index: "book_id" })
        // .orderBy(r.desc('shm_det_quantity'))
        .eqJoin("book_id", r.db('g2g2').table("book")).without({ right: ["id", "date_created", "date_updated", "creater", "updater", "tags"] }).zip()
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
        .eqJoin('carrier_id', r.db('common').table('carrier')).pluck("left", { right: "carrier_name" }).zip()
        .eqJoin("exporter_id", r.db('external').table("exporter")).without({ right: ["id", "date_created", "date_updated", "creater", "updater"] }).zip()
        // .eqJoin("trader_id", r.db('external').table("trader")).without({ right: ["id", "date_created", "date_updated", "creater", "updater"] }).zip()
        .eqJoin("company_id", r.db('external').table("company")).without({ right: ["id", "date_created", "date_updated", "creater", "updater", "country_id"] }).zip()
        .eqJoin('shipline_id', r.db('common').table('shipline')).pluck("left", { right: ["shipline_name", "shipline_tel"] }).zip()
        .eqJoin("type_rice_id", r.db('common').table("type_rice")).without({ right: ["id", "date_created", "date_updated", "creater", "updater"] }).zip()
        .eqJoin("package_id", r.db('common').table("package")).without({ right: ["id", "date_created", "date_updated", "creater", "updater"] }).zip()

        .merge(function (me) {
            return {
                shm_det_id: me('id'),
                eta_date: me('eta_date').split('T')(0),
                etd_date: me('etd_date').split('T')(0),
                packing_date: me('packing_date').split('T')(0),
                cut_of_date: me('cut_of_date').split('T')(0),
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
                })
            }
        })
        .without('id', 'creater', 'updater', 'date_created', 'date_updated', 'tags')
        .coerceTo('array')
        .merge(function (m) {
            return r.db('g2g2').table("confirm_letter").get(m('cl_id')).without('id', "tags")
                .merge(function (mm) {
                    return {
                        cl_type_rice: mm('cl_type_rice')
                            .merge(function (mmm) {
                                return r.db('common').table('type_rice').get(mmm('type_rice_id')).without('id', 'creater', 'updater', 'date_created', 'date_updated')
                            })
                            .merge(function (limit) {
                                return {
                                    type_rice_quantity_confirm: r.db('g2g2').table('shipment_detail')
                                        .getAll(m('cl_id'), { index: 'tags' })
                                        //.eqJoin("shm_id", r.db('g2g2').table("shipment")).without({ right: ["id", "date_created", "date_updated", "creater", "updater", "tags"] }).zip()
                                        .filter({
                                            //cl_id: m('cl_id'),
                                            type_rice_id: limit('type_rice_id')
                                        })
                                        .coerceTo('array')
                                        .getField('shm_det_quantity')
                                        .reduce(function (left, right) {
                                            return left.add(right);
                                        }).default(0)
                                }
                            })
                            .merge(function (mmm) {
                                return {
                                    package: mmm('package').map(function (arr_package) {
                                        return arr_package.merge(function (row_package) {
                                            return r.db('common').table('package').get(row_package('package_id')).without('id', 'creater', 'updater', 'date_created', 'date_updated')
                                        })
                                    }),
                                    type_rice_quantity_min: mmm('type_rice_quantity').sub(mmm('type_rice_quantity').mul(mmm('tolerance_rate').div(100)
                                    )),
                                    type_rice_quantity_max: mmm('type_rice_quantity').mul(mmm('tolerance_rate').div(100)
                                    ).add(mmm('type_rice_quantity')),
                                    type_rice_quantity_limit_min: mmm('type_rice_quantity').sub(mmm('type_rice_quantity').mul(mmm('tolerance_rate').div(100)
                                    )).sub(mmm('type_rice_quantity_confirm')),
                                    type_rice_quantity_limit_max: mmm('type_rice_quantity').mul(mmm('tolerance_rate').div(100)
                                    ).add(mmm('type_rice_quantity')).sub(mmm('type_rice_quantity_confirm'))
                                }
                            })
                    }
                })
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
    var valid = req.ajv.validate('g2g.shipment_detail', req.body);
    var r = req.r;
    var result = { result: false, message: null, id: null };
    if (valid) {
        var obj = Object.assign(req.body, { date_created: new Date().toISOString(), date_updated: new Date().toISOString(), creater: 'admin', updater: 'admin' });
        r.db('g2g2').table("shipment_detail")
            .insert(obj)
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
        result.message = req.ajv.errorsText()
        res.json(result);
    }
}
exports.update = function (req, res) {
    var r = req.r;
    var result = { result: false, message: null, id: null };
    if (req.body.id != '' && req.body.id != null && typeof req.body.id != 'undefined') {
        result.id = req.body.id;
        var obj = Object.assign(req.body, { date_updated: new Date().toISOString(), updater: 'admin' });
        r.db('g2g2').table("shipment_detail")
            .get(req.body.id)
            .update(obj)
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
    var r = req.r;
    var result = { result: false, message: null, id: null };
    if (req.params.id != '' || req.params.id != null) {
        result.id = req.params.id;
        var q = r.db('g2g2').table("shipment_detail").get(req.params.id).delete()
        // .do(function (result) {
        //     return r.branch(
        //         result('shm_det_status').eq(false)
        //         , r.db('g2g2').table('shipment_detail').get(req.params.id).delete()
        //         , r.expr("Can't delete because this status = true.")
        //     )
        // })
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