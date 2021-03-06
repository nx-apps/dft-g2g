exports.getById = function (req, res) {
    var r = req.r;
    r.db('g2g2').table('fee_detail')
        .get(req.params.fee_det_id)
        .merge(function (fee_merge) {
            return {
                invoice: fee_merge('invoice').map(function (fee_map) {
                    return fee_map.merge(function (fee_merge1) {
                        return r.db('g2g2').table('invoice')
                            .get(fee_merge1('invoice_id'))
                            .merge(function (m) {
                                return {
                                    shipment_detail: r.db('g2g2').table('shipment_detail')
                                        .getAll(m('book_id'), { index: 'book_id' })
                                        .coerceTo('array')
                                        .pluck("id", "book_id", "package_id", "exporter_id", "shm_det_quantity", "type_rice_id", "price_per_ton")
                                        .eqJoin("book_id", r.db('g2g2').table("book")).pluck('left', { right: ['cl_id'] }).zip()
                                        .eqJoin("cl_id", r.db('g2g2').table("confirm_letter")).without({ right: ['id', 'date_created', 'date_updated', 'creater', 'updater', "cl_date", "cl_quality"] }).zip()
                                        .eqJoin("package_id", r.db('common').table("package")).without({ right: ["id", "date_created", "date_updated", "creater", "updater"] }).zip()
                                        .eqJoin("exporter_id", r.db('external').table("exporter")).without({ right: ["id", "date_created", "date_updated", "creater", "updater"] }).zip()
                                        .eqJoin("company_id", r.db('external').table("company")).without({ right: ["id", "date_created", "date_updated", "creater", "updater", "country_id"] }).zip()
                                        .merge(function (m1) {
                                            return {
                                                shm_det_id: m1('id'),
                                                // price_per_ton: m1('cl_type_rice')
                                                //     .filter(function (tb) {
                                                //         return tb('type_rice_id').eq(m1('type_rice_id'))
                                                //     }).getField("package")(0)
                                                //     .filter(function (f) {
                                                //         return f('package_id').eq(m1('package_id'))
                                                //     })(0)
                                                //     .pluck('price_per_ton')
                                                //     .values()(0),
                                                quantity_tons: m1('shm_det_quantity'),
                                                quantity_bags: m1('shm_det_quantity').mul(1000).div(m1('package_kg_per_bag'))

                                            }
                                        })
                                        .merge(function (m1) {
                                            return {
                                                weight_gross: m1('quantity_bags').mul(m1('package_kg_per_bag').add(m1('package_weight_bag').div(1000))).div(1000),
                                                weight_net: m1('quantity_bags').mul(m1('package_kg_per_bag')).div(1000),
                                                weight_tare: m1('quantity_bags').mul(m1('package_weight_bag').div(1000)).div(1000)
                                            }
                                        })
                                        .merge(function (m1) {
                                            return {
                                                amount_usd: m1('price_per_ton').mul(m1('weight_net'))
                                            }
                                        })
                                        .without('id', 'cl_type_rice', 'shm_det_quantity')
                                }
                            })
                            .merge(function (m) {
                                return r.db('g2g2').table('book').get(m('book_id')).without('id', 'date_created', 'date_updated', 'creater', 'updater', 'tags')
                            })
                            .merge(function (m) {
                                return {
                                    invoice_id: m('id'),
                                    weight_gross: m('shipment_detail').sum('weight_gross'),
                                    weight_net: m('shipment_detail').sum('weight_net'),
                                    weight_tare: m('shipment_detail').sum('weight_tare'),
                                    amount_usd: m('shipment_detail').sum('amount_usd'),
                                    invoice_date: m('invoice_date').split('T')(0),
                                    invoice_detail: fee_merge1('invoice_detail').map(function (map1) {
                                        return m('shipment_detail').filter({ shm_det_id: map1('shm_det_id') })(0).merge(map1)
                                            // .merge(function (m2) {
                                            //     return {
                                            //         exporter_date_approve: m2('exporter_date_approve').split('T')(0)
                                            //     }
                                            // })
                                            .without('tags')
                                    })
                                }
                            })
                            .without("id", "shipment_detail", 'tags')
                            .merge(function (m) {
                                return r.db('common').table("shipline").get(m('shipline_id')).without('id', 'date_created', 'date_updated', 'creater', 'updater')
                            })
                            .merge(function (m) {
                                return {
                                    ship: m('ship').map(function (arr_ship) {
                                        return arr_ship.merge(function (row_ship) {
                                            return r.db('common').table('ship').get(row_ship('ship_id')).without('id', 'date_created', 'date_updated', 'creater', 'updater')
                                        })
                                    })
                                }
                            })
                    })
                })
            }
        })
        .merge(function (fee_merge) {
            return {
                fee_det_id: fee_merge('id'),
                fee_date_receipt: fee_merge('fee_date_receipt').split('T')(0),
                amount_usd: fee_merge('invoice').sum('amount_usd'),
                weight_gross: fee_merge('invoice').sum('weight_gross'),
                weight_net: fee_merge('invoice').sum('weight_net'),
                weight_tare: fee_merge('invoice').sum('weight_tare'),
                payterm: r.db('g2g2').table('contract').get(
                    r.db('g2g2').table('fee').get(fee_merge('fee_id')).getField('tags')(0)
                ).getField('payterm')
            }
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
    var valid = req.ajv.validate('g2g.fee_detail', req.body);
    var r = req.r;
    var result = { result: false, message: null, id: null };
    if (valid) {
        var obj = Object.assign(req.body, { date_created: new Date().toISOString(), date_updated: new Date().toISOString(), creater: 'admin', updater: 'admin' });
        r.db('g2g2').table("fee_detail")
            .insert(obj)
            .do(fee_det_do => {
                return r.db('g2g2').table('fee_detail').get(fee_det_do('generated_keys')(0))
                    .do(update_inv_do => {
                        return update_inv_do('invoice').forEach(inv_each => {
                            return r.db('g2g2').table('invoice').get(inv_each('invoice_id')).update({ invoice_status: true })
                        })
                    })
            })
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
        r.db('g2g2').table("fee_detail")
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
        var q = r.db('g2g2').table("fee_detail").get(req.params.id).do(function (result) {
            return r.branch(
                result('fee_det_status').eq(false)
                , r.db('g2g2').table('fee_detail').get(req.params.id)
                    .do(fee_det_do => {
                        return fee_det_do('invoice').forEach(inv_each => {
                            return r.db('g2g2').table('invoice').get(inv_each('invoice_id')).update({ invoice_status: false })
                        })
                    })
                    .do(fee_det_do => {
                        return r.db('g2g2').table('fee_detail').get(req.params.id).delete()
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