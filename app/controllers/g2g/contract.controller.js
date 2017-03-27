exports.list = function (req, res) {
    var r = req.r;
    var orderby = req.query.orderby;
     r.db('g2g2').table("contract")
        .merge(function (row) {
            return {
                contract_id: row('id'),
                contract_date: row('contract_date').split('T')(0),
                contract_type_rice: row('contract_type_rice').map(function (arr_type_rice) {
                    return arr_type_rice.merge(function (row_type_rice) {
                        return r.db('common').table('type_rice').get(row_type_rice('type_rice_id')).without('id', 'date_created', 'date_updated', 'creater', 'updater')
                    })
                }),
                confirm_letter: r.db('g2g2').table('confirm_letter')
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
                book: r.db('g2g2').table('confirm_letter')
                    .getAll(row('id'), { index: 'contract_id' })
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
                            book_quantity: r.db('g2g2').table('book')
                                .getAll(row('id'), { index: 'cl_id' })
                                .pluck('id')
                                .map((book) => {
                                    return {
                                        book_id: book('id'),
                                        book_quantity: r.db('g2g2').table('shipment_detail')
                                            .getAll(book('id'), { index: 'book_id' })
                                            .sum('shm_det_quantity')
                                    }
                                })
                                .sum('book_quantity')
                        }
                    })
                    .orderBy('cl_no')
                    .coerceTo('array')
                // r.db('g2g2').table('book')
                //     .getAll(row('id'), { index: 'tags' })
                //     .merge(function (book) {
                //         return {
                //             book_id: book('id'),
                //             book_quantity: r.db('g2g2').table("shipment_detail")
                //                 .getAll(book('id'), { index: "book_id" })
                //                 .sum("shm_det_quantity"),
                //             book_status_name: r.branch(book('book_status').eq(true), 'อนุมัติ', 'ยังไม่อนุมัติ')
                //         }
                //     })
                //     .orderBy('ship_lot_no')
                //     .without('id', "tags")
                //     .coerceTo('array')
                //     .eqJoin("cl_id", r.db('g2g2').table("confirm_letter")).without({ right: ["id", "date_created", "date_updated", "cl_type_rice", "cl_quality", "tags"] }).zip()
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
                contract_quantity_book: row('book')
                    .filter(function (f) {
                        return f('book_status').eq(true)
                    })
                    .sum('book_quantity'),
                contract_quantity_book_balance: row('contract_quantity').sub(
                    row('book')
                        .filter(function (f) {
                            return f('book_status').eq(true)
                        })
                        .sum('book_quantity')
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
exports.list2 = function (req, res) {
    var r = req.r;
    r.db('g2g2').table('contract')
        .getAll(true, { index: 'contract_status' })
        //.filter({ contract_status: true })
        .merge({ contract_id: r.row('id') })
        .pluck("buyer_id", "contract_id", "contract_date")
        .group("buyer_id")
        .ungroup()
        .map(function (buyer_map) {
            return {
                buyer_id: buyer_map('group'),
                contract: buyer_map('reduction').orderBy(r.desc('contract_date')).limit(3)
            }
        })
        .eqJoin('buyer_id', r.db('common').table('buyer'))
        .pluck("left", { right: ["buyer_name", "country_id"] }).zip()
        .eqJoin('country_id', r.db('common').table('country'))
        .pluck("left", { right: ["country_name_th", "country_name_en"] }).zip()
        .merge(function (buyer_merge) {
            return {
                contract: buyer_merge('contract').merge(function (contract_merge) {
                    return {
                        contract_year: contract_merge('contract_date').split('-')(0).coerceTo('number'),
                        confirm: r.db('g2g2').table('confirm_letter').getAll(contract_merge('contract_id'), { index: 'contract_id' })
                            .filter({ cl_status: true })
                            .coerceTo('array')
                            .map(function (cl_merge) {
                                return {
                                    cl_weight: cl_merge('cl_type_rice').sum('type_rice_quantity')
                                }
                            }).sum('cl_weight'),
                        shipment: r.db('g2g2').table('shipment_detail').getAll(contract_merge('contract_id'), { index: 'tags' }).sum('shm_det_quantity'),
                        payment: r.db('g2g2').table('payment').getAll(contract_merge('contract_id'), { index: 'tags' }).sum('pay_amount')
                    }
                })
            }
        })
        .run()
        .then(function (data) {
            res.json(data);
        })
}
exports.buyerId = function (req, res) {
    var r = req.r;
    var orderby = req.query.orderby;
    r.db('g2g2').table("contract")
        .getAll(req.params.buyer_id, { index: 'buyer_id' })
        .merge(function (row) {
            return {
                contract_id: row('id'),
                contract_date: row('contract_date').split('T')(0),
                contract_type_rice: row('contract_type_rice').map(function (arr_type_rice) {
                    return arr_type_rice.merge(function (row_type_rice) {
                        return r.db('common').table('type_rice').get(row_type_rice('type_rice_id')).without('id', 'date_created', 'date_updated', 'creater', 'updater')
                    })
                }),
                confirm_letter: r.db('g2g2').table('confirm_letter')
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
                book: r.db('g2g2').table('confirm_letter')
                    .getAll(row('id'), { index: 'contract_id' })
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
                            book_quantity: r.db('g2g2').table('book')
                                .getAll(row('id'), { index: 'cl_id' })
                                .pluck('id')
                                .map((book) => {
                                    return {
                                        book_id: book('id'),
                                        book_quantity: r.db('g2g2').table('shipment_detail')
                                            .getAll(book('id'), { index: 'book_id' })
                                            .sum('shm_det_quantity')
                                    }
                                })
                                .sum('book_quantity')
                        }
                    })
                    .orderBy('cl_no')
                    .coerceTo('array')
                // r.db('g2g2').table('book')
                //     .getAll(row('id'), { index: 'tags' })
                //     .merge(function (book) {
                //         return {
                //             book_id: book('id'),
                //             book_quantity: r.db('g2g2').table("shipment_detail")
                //                 .getAll(book('id'), { index: "book_id" })
                //                 .sum("shm_det_quantity"),
                //             book_status_name: r.branch(book('book_status').eq(true), 'อนุมัติ', 'ยังไม่อนุมัติ')
                //         }
                //     })
                //     .orderBy('ship_lot_no')
                //     .without('id', "tags")
                //     .coerceTo('array')
                //     .eqJoin("cl_id", r.db('g2g2').table("confirm_letter")).without({ right: ["id", "date_created", "date_updated", "cl_type_rice", "cl_quality", "tags"] }).zip()
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
                contract_quantity_book: row('book')
                    .filter(function (f) {
                        return f('book_status').eq(true)
                    })
                    .sum('book_quantity'),
                contract_quantity_book_balance: row('contract_quantity').sub(
                    row('book')
                        .filter(function (f) {
                            return f('book_status').eq(true)
                        })
                        .sum('book_quantity')
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
    var r = req.r;
    r.db('g2g2').table("contract")
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
                                type_rice_quantity_confirm: r.db('g2g2').table('confirm_letter')
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
    var valid = req.ajv.validate('g2g.contract', req.body);
    var r = req.r;
    var result = { result: false, message: null, id: null };
    if (valid) {
        var obj = Object.assign(req.body, { date_created: new Date().toISOString(), date_updated: new Date().toISOString(), creater: 'admin', updater: 'admin' });
        r.db('g2g2').table("contract")
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
        r.db('g2g2').table("contract")
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
        var q = r.db('g2g2').table("contract").get(req.params.id).do(function (result) {
            return r.branch(
                result('contract_status').eq(false)
                , r.db('g2g2').table("contract").get(req.params.id).delete()
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