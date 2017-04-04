exports.getByContractId = function (req, res) {
    var r = req.r;
    var orderby = req.query.orderby;
    r.db('g2g2').table("confirm_letter")
        .getAll(req.params.contract_id, { index: "contract_id" })
        .filter({ "cl_status": true })
        .merge(function (row) {
            return {
                cl_id: row('id'),
                cl_date: row('cl_date').split('T')(0),
                cl_type_rice: row('cl_type_rice').map(function (arr_type_rice) {
                    return arr_type_rice.merge(function (row_type_rice) {
                        return {
                            package: row_type_rice('package').map(function (arr_package) {
                                return arr_package.merge(function (row_package) {
                                    return r.db('common').table('package').get(row_package('package_id')).without('id', 'date_created', 'date_updated', 'creater', 'updater')
                                })
                            })
                        }
                    })
                        .merge(function (row_type_rice) {
                            return r.db('common').table('type_rice').get(row_type_rice('type_rice_id')).without('id', 'date_created', 'date_updated', 'creater', 'updater')
                        })
                }),
                cl_quantity_total: row('cl_type_rice').sum('type_rice_quantity')
            }
        })
        .without('id', 'tags')
        .orderBy('cl_no')
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}

exports.getById = function (req, res) {
    var r = req.r;
    r.db('g2g2').table("confirm_letter")
        .get(req.params.cl_id)
        .merge(function (row) {
            return {
                cl_id: row('id'),
                cl_date: row('cl_date').split('T')(0),
                cl_type_rice: row('cl_type_rice').map(function (arr_type_rice) {
                    return arr_type_rice.merge(function (row_type_rice) {
                        return {
                            package: row_type_rice('package').map(function (arr_package) {
                                return arr_package.merge(function (row_package) {
                                    return r.db('common').table('package').get(row_package('package_id')).without('id', 'date_created', 'date_updated', 'creater', 'updater')
                                })
                            })
                        }
                    })
                        .merge(function (row_type_rice) {
                            return r.db('common').table('type_rice').get(row_type_rice('type_rice_id')).without('id', 'date_created', 'date_updated', 'creater', 'updater')
                        })
                }),
                cl_quantity_total: row('cl_type_rice').sum('type_rice_quantity')
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
exports.getByExporterId = function (req, res) {
    var r = req.r;
    r.db('g2g2').table('confirm_letter')
        .getAll(req.query.contract_id, { index: 'contract_id' })
        .filter({ cl_status: true })
        .map(function (cl) {
            return {
                cl_id: cl('id'),
                cl_no: cl('cl_no'),
                cl_type_rice: cl('cl_type_rice')
                    .merge(function (mmm) {
                        return r.db('common').table('type_rice').get(mmm('type_rice_id')).without('id', 'creater', 'updater', 'date_created', 'date_updated')
                    })
                    .merge(function (limit) {
                        return {
                            type_rice_quantity_confirm: r.db('g2g2').table('shipment_detail')
                                .getAll(cl('id'), { index: 'tags' })
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
                    }),
                cl_quantity_total: cl('cl_type_rice').sum('type_rice_quantity'),
                cl_status: cl('cl_status'),
                book_quantity: r.table('shipment_detail')
                    .getAll(req.query.exporter_id, { index: 'exporter_id' })
                    .filter(function (f) {
                        return f('tags').contains(cl('id'))
                    })
                    .sum('shm_det_quantity')
            }
        })
        .orderBy('cl_no')
        .run()
        .then(function (result) {
            res.json(result);
        })
}
exports.insert = function (req, res) {
    var valid = req.ajv.validate('g2g.confirm_letter', req.body);
    var r = req.r;
    var result = { result: false, message: null, id: null };
    if (valid) {
        var obj = Object.assign(req.body, { date_created: new Date().toISOString(), date_updated: new Date().toISOString(), creater: 'admin', updater: 'admin' });
        r.db('g2g2').table("confirm_letter")
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
        r.db('g2g2').table("confirm_letter")
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
        var q = r.db('g2g2').table("confirm_letter").get(req.params.id).do(function (result) {
            return r.branch(
                result('cl_status').eq(false)
                , r.db('g2g2').table("confirm_letter").get(req.params.id).delete()
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