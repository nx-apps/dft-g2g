exports.list = function (req, res) {
    var r = req._r;
    var orderby = req.query.orderby;
    r.db('g2g').table("contract")
        .merge(function (row) {
            return {
                contract_id: row('id'),
                contract_date: row('contract_date').split('T')(0),
                contract_type_rice: row('contract_type_rice').map(function (arr_type_rice) {
                    return arr_type_rice.merge(function (row_type_rice) {
                        return r.db('common').table('type_rice').get(row_type_rice('type_rice_id')).without('id', 'date_created', 'date_updated', 'creater', 'updater')
                    })
                }),
                confirm_letter: r.db('g2g').table('confirm_letter')
                    .getAll(row('id'), { index: 'contract_id' })
                    .merge(function (cl) {
                        return {
                            cl_id: cl('id'),
                            cl_quantity_total: cl('cl_type_rice').sum('type_rice_quantity'),
                            cl_date: cl('cl_date').split('T')(0),
                            cl_status_name: r.branch(cl('cl_status').eq(true), 'อนุมัติ', 'ยังไม่อนุมัติ')
                        }
                    })
                    .orderBy('cl_no')
                    .without('id')
                    .coerceTo('array'),
                shipment: r.db('g2g').table('shipment')
                    .getAll(row('id'), { index: 'contract_id' })
                    .merge(function (shm) {
                        return {
                            shm_id: shm('id'),
                            shm_quantity: r.db('g2g').table("shipment_detail")
                                .getAll(shm('id'), { index: "shm_id" })
                                .sum("shm_det_quantity"),
                            shm_status_name: r.branch(shm('shm_status').eq(true), 'อนุมัติ', 'ยังไม่อนุมัติ')
                        }
                    })
                    .orderBy('shm_no')
                    .without('id', "tags")
                    .coerceTo('array')
                    .eqJoin("cl_id", r.db('g2g').table("confirm_letter")).without({ right: ["id", "date_created", "date_updated", "cl_type_rice", "cl_quality", "tags"] }).zip()
            }
        })
        .merge(function (row) {
            return {
                contract_quantity_confirm: row('confirm_letter')
                    .filter(function (f) {
                        return f('cl_status').eq(true)
                    })
                    .sum('cl_quantity_total'),
                contract_quantity_confirm_balance: row('contract_quantity').sub(
                    row('confirm_letter')
                        .filter(function (f) {
                            return f('cl_status').eq(true)
                        })
                        .sum('cl_quantity_total')
                ),
                contract_quantity_shipment: row('shipment')
                    .filter(function (f) {
                        return f('shm_status').eq(true)
                    })
                    .sum('shm_quantity'),
                contract_quantity_shipment_balance: row('contract_quantity').sub(
                    row('shipment')
                        .filter(function (f) {
                            return f('shm_status').eq(true)
                        })
                        .sum('shm_quantity')
                )
            }
        })
        .without('id', 'tags', 'tolerance_rate')
        .eqJoin("buyer_id", r.db('common').table("buyer")).without({ right: ["id", "date_created", "date_updated", "creater", "updater"] }).zip()
        .eqJoin("country_id", r.db('common').table("country")).without({ right: ["id", "date_created", "date_updated", "creater", "updater"] }).zip()
        .orderBy(r.desc('contract_date'))
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
    r.db('g2g').table("contract")
        .get(req.params.contract_id)
        .merge(function (row) {
            return {
                contract_id: row('id'),
                contract_type_rice: row('contract_type_rice').map(function (arr_type_rice) {
                    return arr_type_rice.merge(function (row_type_rice) {
                        return r.db('common').table('type_rice').get(row_type_rice('type_rice_id')).without('id', 'date_created', 'date_updated', 'creater', 'updater')
                    })
                        .merge(function (limit) {
                            return {
                                type_rice_quantity_confirm: r.db('g2g').table('confirm_letter')
                                    .filter(function (f) {
                                        return f('cl_type_rice').contains(function (c) {
                                            return c('type_rice_id').eq(limit('type_rice_id'))
                                        }).and(f('contract_id').eq(row('id')))
                                    })
                                    .coerceTo('array')
                                    .pluck("cl_type_rice")
                                    .map(function (m) {
                                        return m('cl_type_rice').merge(function (mer) {
                                            return r.branch(mer('type_rice_id').eq(limit('type_rice_id')), mer('type_rice_quantity'), 0)
                                        })
                                    })
                                    .reduce(function (left, right) {
                                        return left.add(right);
                                    }).default([])
                                    .reduce(function (left, right) {
                                        return left.add(right);
                                    }).default(0)
                            }
                        })
                }),
                contract_date: row('contract_date').split('T')(0)
            }
        })
        .merge(function (row) {
            return {
                contract_quantity_confirm: row('contract_type_rice').sum('type_rice_quantity_confirm'),
                contract_quantity_limit: row('contract_quantity').sub(row('contract_type_rice').sum('type_rice_quantity_confirm'))
            }
        })
        .merge(function (row) {
            return r.db('common').table("buyer").get(row('buyer_id')).without('id')
                .merge(function (r_buyer) {
                    return r.db('common').table("country").get(r_buyer("country_id")).without('id', 'date_created', 'date_updated', 'creater', 'updater')
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
    var valid = req._validator.validate('g2g.contract', req.body);
    var r = req._r;
    var result = { result: false, message: null, id: null };
    if (valid) {
        r.db("g2g").table("contract")
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
        r.db("g2g").table("contract")
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
        var q = r.db('g2g').table("contract").get(req.params.id).do(function (result) {
            return r.branch(
                result('contract_status').eq(false)
                , r.db('g2g').table("contract").get(req.params.id).delete()
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