exports.getByContractId = function (req, res) {
    var r = req.r;
    r.table('book')
        .getAll([req.query.id, false], { index: 'contractFeeStatus' })
        .pluck('confirm_lot', 'invoice_type', 'invoice_no', 'invoice_year', 'id', 'ship_lot', 'cl_no', 'invoice_date', 'net_weight', 'invoice_status', 'value_d')
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
        .pluck('id', 'cl_id', 'ship', 'load_port', 'dest_port', 'deli_port', 'bl_no', 'contract_id', 'invoice_type', 'invoice_no', 'invoice_year', 'invoice_date', 'made_out_to', 'invoice_status')
        .merge(function (m) {
            var detail = r.table('book_detail').getAll(req.query.id, { index: 'book_id' })
                .coerceTo('array')
                .pluck('package_amount', 'package', 'package_id', 'price_d', 'gross_weight', 'tare_weight', 'net_weight', 'value_d',
                'hamonize', 'hamonize_id', 'project_en');
            var inct = r.table('confirm_letter').get(m('cl_id')).getField('incoterms');
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
                                { data: lf('data').add(', ', rt('ship_name'), ' V.', rt('ship_voy')) },
                                { data: lf('ship_name').add(' V.', lf('ship_voy'), ', ', rt('ship_name'), ' V.', rt('ship_voy')) }
                            )
                        })('data'),
                        m('ship')(0)('ship_name').add(' V.', m('ship')(0)('ship_voy'))
                    ),
                    detail: detail.group(function (g) {
                        return g.pluck('hamonize_id', 'package_id')
                    }).ungroup().map(function (m2) {
                        var data = m2('reduction');
                        return data(0).pluck('hamonize', 'package', 'project_en', 'price_d')
                            .merge({
                                gross_weight: data.sum('gross_weight'),
                                net_weight: data.sum('net_weight'),
                                tare_weight: data.sum('tare_weight'),
                                value_d: data.sum('value_d'),
                                package_amount: data.sum('package_amount'),
                                incoterms: inct.concatMap(function (m3) {
                                    return [m3('inct_name')]
                                }).reduce(function (left, right) {
                                    return left.add(', ', right)
                                })
                            })
                    }),
                    incoterms: inct,
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
            invoice_type: req.body.invoice_type,
            invoice_no: req.body.invoice_no,
            invoice_year: req.body.invoice_year,
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
        invoice_type: r.literal(),
        invoice_no: r.literal(),
        invoice_year: r.literal(),
        invoice_date: r.literal(),
        made_out_to: r.literal(),
        fee_status: r.literal(),
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
