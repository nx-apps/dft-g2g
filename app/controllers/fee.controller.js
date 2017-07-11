var async = require('async');
exports.calc = function (req, res) {
    req.r.table('book').getAll(r.args(r.expr(req.query.book_id.split('_'))), { index: 'id' })
        .map(function (m) {
            var ship = m.getField('ship');
            var detail = r.table('book_detail').getAll(m('id'), { index: 'book_id' })
                .coerceTo('array')
                .map(function (m2) {
                    return m2.pluck('company', 'net_weight', 'price_d', 'value_d')
                        .merge({
                            detail_id: m2('id'),
                            value_b: 0,
                            value_fee_b: 0,
                            value_bal_b: 0,
                            value_tax_b: 0,
                            value_final_b: 0
                        })
                });
            return m.pluck('invoice_type', 'invoice_no', 'invoice_year', 'invoice_date', 'cl_id', 'cl_no', 'contract_id', 'contract_no', 'ship', 'ship_lot')
                .merge({
                    book_id: m('id'),
                    ship: ship.map(function (sm) {
                        return sm('ship_name').add(' V.', sm('ship_voy'))
                    }),
                    value_b: 0,
                    value_fee_b: 0,
                    value_bal_b: 0,
                    value_tax_b: 0,
                    value_final_b: 0,
                    fee_ex_d: 0,
                    fee_in_b: 0,
                    detail: detail,
                    net_weight: detail.sum('net_weight'),
                    value_d: detail.sum('value_d')
                })
        })
        .orderBy('invoice_date')
        .run()
        .then(function (data) {
            res.json(data);
        })
}
exports.insert = function (req, res) {
    var book = req.body.book;
    // var detail = req.body.detail;
    var rate_bank = parseFloat(req.body.rate_bank_b);
    var rate_tt = parseFloat(req.body.rate_tt_b);
    var fee_date = r.ISO8601(req.body.fee_date).inTimezone('+07');
    var obj = r.expr(book)
        .eqJoin('book_id', r.table('book')).pluck('left', {
            right: [
                'cl_id', 'cl_no', 'contract_id', 'invoice_date', 'invoice_type', 'invoice_no', 'invoice_year'
                //,'cut_date', 'eta_date', 'etd_date', 'packing_date', 'product_date'
            ]
        }).zip()
        .group(function (g) {
            return g.pluck('cl_id', 'cl_no', 'contract_id')
        })
        .ungroup()
        .map(function (m) {
            var fee = r.table('fee').getAll(m('group')('cl_id'), { index: 'cl_id' }).coerceTo('array');
            var fee_round = fee.filter(function (f) { return f('fee_date').eq(fee_date) });
            var book = m('reduction').merge(function (m2) {
                return {
                    net_weight: m2('detail').sum('net_weight'),
                    value_d: m2('detail').sum('value_d'),
                    value_b: m2('detail').sum('value_b'),
                    value_fee_b: m2('detail').sum('value_fee_b'),
                    value_bal_b: m2('detail').sum('value_bal_b'),
                    value_tax_b: m2('detail').sum('value_tax_b'),
                    value_final_b: m2('detail').sum('value_final_b')
                }
            });
            return m('group').merge({
                fee_date: fee_date,
                book: book,
                fee_ex_d: book.sum('fee_ex_d'),
                fee_in_b: book.sum('fee_in_b'),
                net_weight: book.sum('net_weight'),
                value_d: book.sum('value_d'),
                value_b: book.sum('value_b'),
                value_fee_b: book.sum('value_fee_b'),
                value_bal_b: book.sum('value_bal_b'),
                value_tax_b: book.sum('value_tax_b'),
                value_final_b: book.sum('value_final_b'),
                rate_bank_b: rate_bank,
                rate_tt_b: rate_tt,
                fee_no: r.branch(fee.eq([]), 1, fee_round.eq([]), fee.getField('fee_no').max().add(1), fee_round.getField('fee_no')(0)),
                fee_round: r.branch(fee_round.eq([]), 0, fee_round.getField('fee_round').max().add(1)),
                date_created: r.now().inTimezone('+07'),
                date_updated: r.now().inTimezone('+07'),
                fin_status: false,
                rice_status: false,
                fee_status: false,
                creater: 'admin',
                updater: 'admin'
            })
        });
    updateFee("insert", obj, res);
}
exports.getByContractId = function (req, res) {
    var get = r.table('fee').getAll([req.query.id, false, true, true], [req.query.id, false, false, false], { index: 'contractFeeFinRiceStatus' });
    if (typeof req.query.view !== "undefined" && req.query.view == "rice") {
        get = r.table('fee').getAll([req.query.id, false, true, false], { index: 'contractFeeFinRiceStatus' });
    }
    // req.r.table('fee').getAll([req.query.id, false,], { index: 'contractFeeFinRiceStatus' })
    get.merge(function (m) {
        return {
            invoice_count: m('book').count(),
            invoice_no: m('book').orderBy('invoice_no').getField('invoice_no').reduce(function (lf, rt) { return lf.coerceTo('string').add(',', rt.coerceTo('string')) })
        }
    })
        .pluck('id', 'cl_id', 'cl_no', 'fee_no', 'fee_round', 'fee_date', 'net_weight',
        'value_d', 'rate_bank_b', 'value_b', 'value_fee_b', 'value_tax_b', 'value_final_b',
        'fin_status', 'rice_status', 'invoice_count', 'invoice_type', 'invoice_no', 'invoice_year')
        .orderBy('cl_no', 'fee_no', 'fee_round')
        .run()
        .then(function (data) {
            res.json(data)
        })
}
exports.getById = function (req, res) {
    req.r.table('fee').get(req.query.id)
        .merge(function (m) {
            return {
                fee_date: m('fee_date').inTimezone('+07').toISO8601()
            }
        })
        .run()
        .then(function (data) {
            res.json(data)
        })
}
exports.update = function (req, res) {
    var valid = req.ajv.validate('g2g.fee', req.body);
    if (req.body.id != '' && req.body.id != null && typeof req.body.id !== 'undefined') {
        if (valid) {
            var obj = Object.assign(req.body, {
                fee_date: r.ISO8601(req.body.fee_date).inTimezone('+07'),
                date_updated: r.now().inTimezone('+07'),
                updater: 'admin'
            });
            updateFee("update", r.expr([obj]), res);

        } else {
            res.json(req.ajv.errorsText());
        }
    } else {
        res.json('require field id');
    }
}
exports.delete = function (req, res) {
    if (req.params.id != '') {
        updateFee("delete", r.table('fee').getAll(req.params.id), res);
    } else {
        res.json('require field id');
    }
}
function updateFee(act, obj, res) {
    var status = true;
    var book = obj.getField('book')
        .reduce(function (left, right) {
            return left.add(right)
        });
    var detail = book.getField('detail')
        .reduce(function (left, right) {
            return left.add(right)
        });
    var fee;
    if (act == "insert") {
        fee = r.table("fee").insert(obj);
    } else if (act == "update") {
        fee = r.expr(obj(0))
            .merge(function (m) {
                return {
                    book: m('book').merge(function (m2) {
                        return {
                            invoice_date: r.ISO8601(m2('invoice_date')).inTimezone('+07')
                            // cut_date: r.ISO8601(m2('cut_date')).inTimezone('+07'),
                            // eta_date: r.ISO8601(m2('eta_date')).inTimezone('+07'),
                            // etd_date: r.ISO8601(m2('etd_date')).inTimezone('+07'),
                            // packing_date: r.ISO8601(m2('packing_date')).inTimezone('+07'),
                            // product_date: r.ISO8601(m2('product_date')).inTimezone('+07')
                        }
                    })
                }
            })
            .do(function (d) {
                return r.table('fee').get(d('id')).update(d)
            });
    } else if ('delete') {
        status = false;
        book = clearValue(book);
        detail = clearValue(detail);
        fee = obj(0).delete();
        function clearValue(val) {
            return val.merge(function (m) {
                return {
                    fee_ex_d: 0,
                    fee_in_b: 0,
                    value_b: 0,
                    value_bal_b: 0,
                    value_fee_b: 0,
                    value_final_b: 0,
                    value_tax_b: 0
                }
            });
        }
    }
    var updateBook = book.forEach(function (fe) {
        return r.table('book').get(fe('book_id')).update(
            fe.pluck('fee_ex_d', 'fee_in_b', 'value_b', 'value_bal_b', 'value_d', 'value_fee_b', 'value_final_b', 'value_tax_b')
                .merge({ fee_status: status })
        )
    });
    var updateDetail = detail.forEach(function (fe) {
        return r.table('book_detail').get(fe('detail_id')).update(fe.without('company', 'detail_id'))
    });
    async.parallel({
        book: function (callback) {
            updateBook.run().then(function (res2) {
                callback(null, res2)
            })
        },
        detail: function (callback) {
            updateDetail.run().then(function (res3) {
                callback(null, res3)
            })
        }
        // fee: function (callback) {
        //     fee.run().then(function (res1) {
        //         callback(null, res1)
        //     })
        // }
    }, function (err, results) {
        fee.run().then(function (data) {
            results.fee = data;
            res.json(results);
        });
    });
}
exports.approve = function (req, res) {
    var updata = {};
    if (typeof req.body.rice_status !== 'undefined') {
        updata.rice_status = req.body.rice_status;
    }
    if (typeof req.body.fin_status !== 'undefined') {
        updata.fin_status = req.body.fin_status;
    }
    if (typeof req.body.fee_status !== 'undefined') {
        updata.fee_status = req.body.fee_status;
    }
    if (req.body.id != '' && req.body.id != null && typeof req.body.id !== 'undefined') {
        var query = r.table('fee').get(req.body.id);
        if (updata.fee_status == true) {
            query.merge(updata)
                .merge(function (m) {
                    return {
                        book: m('book').merge(function (m2) {
                            return {
                                detail: m2('detail').merge(function (m3) {
                                    return {
                                        cheque_status: false,
                                        invoice_company_no: '',
                                        invoice_company_date: ''
                                    }
                                })
                            }
                        })
                    }
                })
                .do(function (d) {
                    return query.update(d)
                })
                .run()
                .then(function (data) {
                    res.json(data);
                })
        } else {
            query.update(updata)
                .run()
                .then(function (data) {
                    res.json(data);
                })
        }
    } else {
        res.json('require field "id"');
    }
}