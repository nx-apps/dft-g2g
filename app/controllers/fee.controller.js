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
        .pluck('id', 'invoice_no', 'cl_id', 'contract_id')
        .orderBy('invoice_no')
        .merge(function (m) {
            return {
                detail: r.table('book_detail').getAll(m('id'), { index: 'book_id' })
                    .coerceTo('array')
                    .pluck({ 'company': 'company_name_th' },
                    'id', 'net_weight', 'price_d', 'value_d')
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
            return m('group').merge({
                fee_date: fee_date,
                book: m('reduction'),
                fee_ex_d: m('reduction').sum('fee_ex_d'),
                fee_in_b: m('reduction').sum('fee_in_b'),
                rate_bank_b: rate_bank,
                rate_tt_b: rate_tt,
                fee_no: r.branch(fee.eq([]), 1, fee_round.eq([]), fee.getField('fee_no').max().add(1), fee_round.getField('fee_no')(0)),
                fee_round: r.branch(fee_round.eq([]), 1, fee_round.getField('fee_round').max().add(1)),
                date_created: r.now().inTimezone('+07'),
                date_updated: r.now().inTimezone('+07'),
                creater: 'admin',
                updater: 'admin'
            })
        });
    req.r.table('fee').insert(fees)
        // .do(function (d) {
        //     return r.expr(detail).forEach(function (fe) {
        //         return r.table('book_detail').get(fe('id')).update(fe)
        //     });
        // })
        // .do(function (d) {
        //     return r.expr(book).forEach(function (fe) {
        //         return r.table('book').get(fe('book_id')).update({ fee_status: true })
        //     });
        // })
        // fees
        .run()
        .then(function (data) {
            res.json(data)
        })
}
exports.getById = function (req, res) {
    req.r.table('fee').get(req.query.id)
        .merge(function (m) {
            return {
                book: m('book').merge(function (m2) {
                    return {
                        detail: r.table('book_detail').getAll(m2('book_id'), { index: 'book_id' })
                            .coerceTo('array')
                            .pluck({ 'company': 'company_name_th' },
                            'id', 'net_weight', 'price_d', 'value_d', 'value_b',
                            'value_fee_b', 'value_bal_b', 'value_tax_b', 'value_final_b')
                    }
                })
            }
        })
        .run()
        .then(function (data) {
            res.json(data)
        })
}