exports.getByContractId = function (req, res) {
    var r = req.r;
    r.table('book')
        .getAll([req.query.id, true, false], { index: 'contractBookInvoiceStatus' })
        .pluck('id', 'ship_lot_no', 'bl_no', { 'deli_port': ['country_name_en', 'port_name'] }, { 'dest_port': ['country_name_en', 'port_name'] })
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
                        return map('ship_name').add(' V.', map('ship_voy_no'))
                    })
                    .reduce(function (l, r) {
                        return l.add(r)
                    }),
                detail: r.table('book_detail').getAll(req.query.id, { index: 'book_id' })
                    .coerceTo('array')
                    .pluck('package_amount', 'package', 'price_per_ton', 'gross_weight', 'tare_weight', 'net_weight', 'value_usd')
            }
        })
        .run()
        .then(function (data) {
            res.json(data);
        })
}
exports.update = function (req, res) {
    var valid = req.ajv.validate('g2g.book', req.body);
    var result = { result: false, message: null, id: null };
    if (valid) {
        var obj = {
            invoice_no: req.body.invoice_no,
            invoice_date: r.ISO8601(req.body.invoice_date + '+07:00'),
            made_out_to: req.body.made_out_to,
            invoice_status: true,
            date_updated: r.now().inTimezone('+07'),
            updater: 'admin'
        };
        r.table("book")
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
        result.message = req.ajv.errorsText()
        res.json(result);
    }
}
exports.reject = function (req, res) {
    var result = { result: false, message: null, id: null };
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
}
