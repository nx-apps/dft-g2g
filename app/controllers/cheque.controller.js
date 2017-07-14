var common = require('../global/common');
exports.getByContractId = function (req, res) {
    // var tb = r.table('payment').getAll([req.query.id, false, false], { index: 'contractChequePay' })
    var tb = r.table('payment').getAll(req.query.id, { index: 'contract_id' })
        .group(function (g) {
            return g.pluck('contract_id', 'cl_no', 'fee_no')
        })
        .ungroup()
        .map(function (m) {
            return m('group').merge({
                fee_id: m('reduction').getField('fee_id').distinct(),
                cheque_count: m('reduction').filter({ cheque_status: false }).count(),
                fee_date: m('reduction')(0)('fee_date').inTimezone('+07')
            })
        }).orderBy('cl_no', 'fee_no');
    if (req.query.status == "true") {
        tb = r.table('payment').getAll([req.query.id, true, false], { index: 'contractChequePay' })
            .filter(function (f) {
                return f.hasFields('pay_date').eq(false)
            })
            .group('deliver_date').ungroup()
            .map(function (m) {
                var pay = m('reduction').orderBy('pay_no').getField('pay_no');
                return {
                    deliver_date: m('group'),
                    pay_no: r.branch(pay.count().eq(1), pay(0).coerceTo('string'), pay(0).coerceTo('string').add(' - ', pay.nth(-1).coerceTo('string')))
                }
            }).orderBy('deliver_date')
    }
    tb.run()
        .then(function (data) {
            res.json(data);
        })
}
exports.getByFeeId = function (req, res) {
    var fee_id = common.getArrVal(req, 'id', '_');
    r.table('payment').getAll(r.args(fee_id), { index: 'fee_id' })
        .pluck('id', 'cl_no', 'fee_no', 'fee_round', { 'company': 'company_name_th' }, 'value_final_b',
        'invoice_company_no', 'invoice_company_date', 'cheque_no', 'cheque_status', 'pay_no')
        .run()
        .then(function (data) {
            res.json(data)
        })
}
exports.getChequeNo = function (req, res) {
    var cheque = r.table('payment').getAll(r.now().year(), { index: 'yearDeliverDate' }).coerceTo('array');
    r.expr({
        pay_no: r.branch(cheque.count().eq(0), 1, cheque.max('pay_no')('pay_no').add(1))
    })
        .run().then(function (data) {
            res.json(data);
        })
}
exports.update = function (req, res) {
    // req.ajv._opts.coerceTypes = true;
    var valid = req.ajv.validate('g2g.payment_array', req.body);
    if (valid) {
        r.expr(req.body)
            .merge(function (m) {
                var updata = {
                    date_updated: r.now().inTimezone('+07'),
                    updater: 'admin'
                };
                return r.expr(updata).merge(
                    r.branch(m.hasFields('invoice_company_date'), { invoice_company_date: r.ISO8601(m('invoice_company_date')).inTimezone('+07') }, {}),
                    r.branch(m.hasFields('deliver_date'), { deliver_date: r.ISO8601(m('deliver_date')).inTimezone('+07'), cheque_status: true }, {})
                )
            })
            .filter(function (f) {
                return f.hasFields('id')
            })
            .do(function (d) {
                var no = [];
                return r.branch(d.eq([]), "Data doesn't have 'id' field / No data.", d.forEach(function (fe) {
                    var payno = r.table('payment').getAll([fe('pay_no'), fe('deliver_date').year()], { index: 'checkPayNo' }).count();
                    return r.branch(payno.eq(0),
                        r.table('payment').get(fe('id')).update(fe),
                        r.expr(no).append(fe('pay_no')).do(function (d) {
                            return { pay_no: d.distinct(), msg: 'pay_no is already exist.' }
                        })

                    )
                }))
                    .merge(function (m) {
                        return r.branch(m.hasFields('pay_no'), { pay_no: m('pay_no').distinct() }, {})
                    })
            })
            .run()
            .then(function (data) {
                res.json(data)
            })
    } else {
        res.json(req.ajv.errorsText());
    }
}
exports.approve = function (req, res) {
    var valid = req.ajv.validate('g2g.payment_array', req.body);
    if (valid) {
        r.expr(req.body)
            .forEach(function (fe) {
                var tb = r.table('payment')
                    .getAll(r.ISO8601(fe('deliver_date')), { index: 'deliver_date' })
                    .filter({ pay_status: false })
                //var updata = 
                return r.branch(fe.hasFields('pay_date'),
                    tb.update({ pay_date: r.ISO8601(fe('pay_date')).inTimezone('+07') }),
                    tb.update({ cheque_status: false, pay_no: r.literal(), deliver_date: r.literal() })
                )

            })
            .run().then(function (data) {
                res.json(data)
            })
    } else {
        res.json(req.ajv.errorsText());
    }
}
