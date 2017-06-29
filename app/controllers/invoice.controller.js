exports.getByContractId = function (req, res) {
    var r = req.r;
    r.table('book')
        .getAll([req.query.id, false], { index: 'contractFeeStatus' })
        .pluck('confirm_lot', 'invoice_no', 'id', 'ship_lot', 'cl_no', 'invoice_date', 'net_weight', 'invoice_status', 'value_d')
        .orderBy('invoice_date')
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.getByBookId = function (req, res) {
    req.r.table('book').get(req.query.id)
        .pluck('id', 'cl_id', 'ship', 'load_port', 'dest_port', 'deli_port', 'bl_no', 'contract_id', 'invoice_no', 'invoice_date', 'made_out_to', 'invoice_status')
        .merge(function (m) {
            var detail = r.table('book_detail').getAll(req.query.id, { index: 'book_id' })
                .coerceTo('array')
                .pluck('package_amount', 'package', 'price_d', 'gross_weight', 'tare_weight', 'net_weight', 'value_d',
                'hamonize', 'hamonize_id', 'project_en');
            return r.table('contract').get(m('contract_id')).pluck('buyer', 'contract_name')
                .merge({
                    invoice_of: detail.group('hamonize_id').ungroup()
                        .map(function (m2) {
                            return {
                                package_amount: m2('reduction').sum('package_amount'),
                                hamonize_en: m2('reduction')(0)('hamonize')('hamonize_en'),
                                project_en: m2('reduction')(0)('project_en')
                            }
                        }),
                    ship: r.branch(m('ship').count().gt(1),
                        m('ship').reduce(function (lf, rt) {
                            return r.branch(lf.hasFields('data'),
                                { data: lf('data').add(', ', rt('shipname'), ' V.', rt('ship_voy')) },
                                { data: lf('shipname').add(' V.', lf('ship_voy'), ', ', rt('shipname'), ' V.', rt('ship_voy')) }
                            )
                        })('data'),
                        m('ship')(0)('ship_name').add(' V.', m('ship')(0)('ship_voy'))
                    ),
                    detail: detail,
                    incoterms: r.table('confirm_letter').get(m('cl_id')).getField('incoterms'),
                    package_amount: detail.sum('package_amount'),
                    gross_weight: detail.sum('gross_weight'),
                    tare_weight: detail.sum('tare_weight'),
                    net_weight: detail.sum('net_weight'),
                    value_d: detail.sum('value_d')
                })
        })
        .run()
        .then(function (data) {
            res.json(data);
        })
}
exports.update = function (req, res) {
    var valid = req.ajv.validate('g2g.book', req.body);
    if (valid) {
        var obj = {
            invoice_no: req.body.invoice_no,
            invoice_date: r.ISO8601(req.body.invoice_date).inTimezone('+07'),
            made_out_to: req.body.made_out_to,
            // package_amount: parseFloat(req.body.package_amount),
            // gross_weight: parseFloat(req.body.gross_weight),
            // tare_weight: parseFloat(req.body.tare_weight),
            // net_weight: parseFloat(req.body.net_weight),
            // value_d: parseFloat(req.body.value_d),
            invoice_status: true,
            fee_status: false,
            date_updated: r.now().inTimezone('+07'),
            updater: 'admin'
        };
        r.table("book")
            .get(req.body.id)
            .update(obj)
            .run()
            .then(function (response) {
                res.json(response);
            })
            .error(function (err) {
                res.json(err);
            })
    } else {
        res.json(req.ajv.errorsText());
    }
}
exports.reject = function (req, res) {
    var obj = {
        invoice_no: r.literal(),
        invoice_date: r.literal(),
        made_out_to: r.literal(),
        invoice_status: false,
        date_updated: r.now().inTimezone('+07'),
        updater: 'admin'
    };
    r.table("book")
        .get(req.params.id)
        .update(obj)
        .run()
        .then(function (response) {
            res.json(response);
        })
        .error(function (err) {
            res.json(err);
        })
}
