var common = require('../global/common');
exports.getByContractId = function (req, res) {
    r.table('payment').getAll([req.query.id, false], { index: 'contractCheque' })
        .group(function (g) {
            return g.pluck('contract_id', 'cl_no', 'fee_no')
        })
        .ungroup()
        .map(function (m) {
            return m('group').merge({
                fee_id: m('reduction').getField('fee_id').distinct(),
                cheque_count: m('reduction').count(),
                fee_date: m('reduction')(0)('fee_date').inTimezone('+07')
            })
        })
        .run()
        .then(function (data) {
            res.json(data);
        })
}
exports.getByFeeId = function (req, res) {
    var fee_id = common.getArrVal(req, 'id', '_');
    r.table('payment').getAll(r.args(fee_id), { index: 'fee_id' })
        .pluck('id', 'cl_no', 'fee_no', 'fee_round', { 'company': 'company_name_th' }, 'value_final_b',
        'invoice_company_no', 'invoice_company_date', 'cheque_no', 'cheque_status','pay_no')
        .run()
        .then(function (data) {
            res.json(data)
        })
}
exports.update = function (req, res) {
    var valid = req.ajv.validate('g2g.payment', req.body);
    if (req.body.id != '' && req.body.id != null && typeof req.body.id !== 'undefined') {
        if (valid) {
            var obj = Object.assign(req.body, {
                invoice_company_date: r.ISO8601(req.body.invoice_company_date).inTimezone('+07'),
                date_updated: r.now().inTimezone('+07'),
                updater: 'admin'
            });
            r.table('payment').get(req.body.id)
                .update(obj)
                .run()
                .then(function (data) {
                    res.json(data)
                })
        } else {
            res.json(req.ajv.errorsText());
        }
    } else {
        res.json('require field id');
    }
}
