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
exports.getByBookId = function (req, res) {
    req.r.table('book').get(req.query.id)
        .pluck('id', 'ship', 'load_port', 'dest_port', 'deli_port', 'bl_no', 'contract_id')
        .merge(function (m) {
            return {
                buyer: r.table('contract').get(m('contract_id')).getField('buyer'),
                ship: m('ship')
                    .map(function (map) {
                        return map('ship_name').add(' V.', map('ship_voy'))
                    })
                    .reduce(function (l, r) {
                        return l.add(r)
                    }),
                detail: r.table('book_detail').getAll(req.query.id, { index: 'book_id' })
                    .coerceTo('array')
                    .pluck('package_amount', 'package', 'price_d', 'gross_weight', 'tare_weight', 'net_weight', 'value_d')
            }
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
            invoice_date: r.ISO8601(req.body.invoice_date + '+07:00'),
            made_out_to: req.body.made_out_to,
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
