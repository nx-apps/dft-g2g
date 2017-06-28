var async = require('async');
exports.getByContractId = function (req, res) {
    var r = req.r;
    r.table('book')
        .getAll([req.query.id, false], { index: 'contractFeeStatus' })
        .pluck('confirm_lot', 'invoice_no', 'id', 'ship_lot')
        .orderBy('invoice_no')
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.calc = function (req, res) {
    req.r.table('book').getAll(r.args(r.expr(req.query.id.split('_'))), { index: 'id' })
        .merge({ book_id: r.row('id') })
        .pluck('book_id', 'invoice_no', 'cl_id', 'contract_id')
        .orderBy('invoice_no')
        .merge(function (m) {
            return {
                detail: r.table('book_detail').getAll(m('book_id'), { index: 'book_id' })
                    .coerceTo('array')
                    .merge(function (m2) {
                        return { detail_id: m2('id') }
                    })
                    .pluck({ 'company': 'company_name_th' },
                    'detail_id', 'net_weight', 'price_d', 'value_d')
            }
        })
        .run()
        .then(function (data) {
            res.json(data);
        })
}
exports.insert = function (req, res) {
    var book = req.body.book;
    var detail = req.body.detail;
    var rate_bank = parseFloat(req.body.rate_bank_b);
    var rate_tt = parseFloat(req.body.rate_tt_b);
    var fee_date = r.ISO8601(req.body.fee_date + '+07:00');
    var fees = r.expr(book)
        .eqJoin('book_id', r.table('book')).pluck('left', { right: ['cl_id', 'cl_no', 'contract_id', 'invoice_date', 'invoice_no'] }).zip()
        .group(function (g) {
            return g.pluck('cl_id', 'cl_no', 'contract_id')
        })
        .ungroup()
        .map(function (m) {
            var fee = r.table('fee').getAll(m('group')('cl_id'), { index: 'cl_id' }).coerceTo('array');
            var fee_round = fee.filter(function (f) { return f('fee_date').date().eq(fee_date.date()) });
            var book = m('reduction').merge(function (m2) {
                return {
                    net_weight: m2('detail').sum('net_weight'),
                    value_d: m2('detail').sum('value_d'),
                    value_b: m2('detail').sum('value_b'),
                    value_fee_b: m2('detail').sum('value_fee_b'),
                    value_bal_b: m2('detail').sum('value_bal_b'),
                    value_tax_b: m2('detail').sum('value_tax_b'),
                    value_final_b: m2('detail').sum('value_final_b'),
                    cheque_status: false
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
                fee_round: r.branch(fee_round.eq([]), 1, fee_round.getField('fee_round').max().add(1)),
                date_created: r.now().inTimezone('+07'),
                date_updated: r.now().inTimezone('+07'),
                fin_status: false,
                rice_status: false,
                creater: 'admin',
                updater: 'admin'
            })
        });
    var book = fees.getField('book')
        .reduce(function (left, right) {
            return left.add(right)
        });
    var detail = book.getField('detail')
        .reduce(function (left, right) {
            return left.add(right)
        });

    var insertFee = r.table('fee').insert(fees);
    var updateBook = book.forEach(function (fe) {
        return r.table('book').get(fe('book_id')).update(
            fe.pluck('fee_ex_d', 'fee_in_b', 'value_b', 'value_bal_b', 'value_d', 'value_fee_b', 'value_final_b', 'value_tax_b')
                .merge({ fee_status: true })
        )
    });
    var updateDetail = detail.forEach(function (fe) {
        return r.table('book_detail').get(fe('detail_id')).update(fe.without('company', 'detail_id'))
    });
    async.parallel({
        fee: function (callback) {
            insertFee.run().then(function (res1) {
                callback(null, res1)
            })
        },
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
    }, function (err, results) {
        // results is now equals to: {one: 1, two: 2}
        // console.log(results);
        res.json(results.fee);
    });
}
exports.getById = function (req, res) {
    req.r.table('fee').get(req.query.id)
        .run()
        .then(function (data) {
            res.json(data)
        })
}