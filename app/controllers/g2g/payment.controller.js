exports.getByContractId = function (req, res) {
    var r = req._r;
    r.db('g2g').table('payment_detail')
        .getAll(req.params.contract_id, { index: 'tags' })
        .filter({ pay_det_status: false })
        .merge({ pay_det_id: r.row('id') })
        .without('id', 'tags')
        .group("invoice_id")
        .ungroup()
        .map(det_map => {
            return {
                invoice_id: det_map('group'),
                payment_detail: det_map('reduction')
                    .eqJoin('shm_det_id', r.db('g2g').table('shipment_detail'))
                    .pluck("left", { right: ['shm_id', 'book_id', 'type_rice_id', 'package_id', 'price_per_ton', 'shm_det_quantity'] }).zip()
                    .eqJoin('shm_id', r.db('g2g').table('shipment'))
                    .pluck("left", { right: ['cl_id', 'contract_id'] }).zip()
                    .eqJoin('book_id', r.db('g2g').table('book'))
                    .pluck("left", { right: ['ship', 'ship_lot_no'] }).zip()
                    .eqJoin('type_rice_id', r.db('common').table('type_rice'))
                    .pluck("left", { right: 'type_rice_name_th' }).zip()
                    .eqJoin('package_id', r.db('common').table('package'))
                    .pluck("left", { right: 'package_kg_per_bag' }).zip()
                    .eqJoin('fee_det_id', r.db('g2g').table('fee_detail'))
                    .pluck("left", { right: ['rate_tt', 'rate_bank', 'fee_date_receipt', 'fee_id'] }).zip()
                    .merge(fee_det_merge => {
                        return {
                            amount_usd: fee_det_merge('shm_det_quantity').mul(fee_det_merge('price_per_ton')),
                            amount_bath: fee_det_merge('shm_det_quantity').mul(fee_det_merge('price_per_ton')).mul(fee_det_merge('rate_bank')),
                            amount_bath_fee: fee_det_merge('pay_amount').mul(100).div(99),
                            fee_date_receipt: fee_det_merge('fee_date_receipt').split('T')(0),
                            ship: fee_det_merge('ship').map(ship_map => {
                                return r.db('common').table('ship').get(ship_map('ship_id')).getField('ship_name')
                                    .add(' V.', ship_map('ship_voy_no'))

                            }).reduce((left, right) => {
                                return left.add(' / ', right)
                            }),
                            exporter_name: r.db('external_f3').table('exporter').get(fee_det_merge('exporter_id'))
                                .getField('trader_id').do(function (trader_do) {
                                    return r.db('external_f3').table('trader').get(trader_do).getField('seller_id').do(function (seller_do) {
                                        return r.db('external_f3').table('seller').get(seller_do).getField('seller_name_th')
                                    })
                                }),
                            pay_det_status_name: r.branch(fee_det_merge('pay_det_status').eq(true), 'จ่ายแล้ว', 'ยังไม่ได้จ่าย')
                        }
                    })
            }
        })
        .eqJoin('invoice_id', r.db('g2g').table('invoice'))
        .pluck("left", { right: ['invoice_no', 'invoice_date'] }).zip()
        .merge(inv_merge => {
            return {
                invoice_date: inv_merge('invoice_date').split('T')(0)
            }
        })
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.getByFeeId = function (req, res) {
    var r = req._r;
    r.db('g2g').table('payment_detail').getAll(req.params.fee_id, { index: 'tags' }).without('tags')
        .merge({ pay_det_id: r.row('id') })
        .without('id')
        .group("invoice_id")
        .ungroup()
        .map(det_map => {
            return {
                invoice_id: det_map('group'),
                payment_detail: det_map('reduction')
                    .eqJoin('shm_det_id', r.db('g2g').table('shipment_detail'))
                    .pluck("left", { right: ['book_id', 'type_rice_id', 'package_id', 'price_per_ton', 'shm_det_quantity'] }).zip()
                    .eqJoin('book_id', r.db('g2g').table('book'))
                    .pluck("left", { right: ['ship', 'ship_lot_no'] }).zip()
                    .eqJoin('type_rice_id', r.db('common').table('type_rice'))
                    .pluck("left", { right: 'type_rice_name_th' }).zip()
                    .eqJoin('package_id', r.db('common').table('package'))
                    .pluck("left", { right: 'package_kg_per_bag' }).zip()
                    .eqJoin('fee_det_id', r.db('g2g').table('fee_detail'))
                    .pluck("left", { right: ['rate_tt', 'rate_bank', 'fee_date_receipt'] }).zip()
                    .merge(fee_det_merge => {
                        return {
                            amount_usd: fee_det_merge('shm_det_quantity').mul(fee_det_merge('price_per_ton')),
                            amount_bath: fee_det_merge('shm_det_quantity').mul(fee_det_merge('price_per_ton')).mul(fee_det_merge('rate_bank')),
                            amount_bath_fee: fee_det_merge('pay_amount').mul(100).div(99),
                            fee_date_receipt: fee_det_merge('fee_date_receipt').split('T')(0),
                            invoice_exporter_date: fee_det_merge('invoice_exporter_date').split('T')(0),
                            ship: fee_det_merge('ship').map(ship_map => {
                                return r.db('common').table('ship').get(ship_map('ship_id')).getField('ship_name')
                                    .add(' V.', ship_map('ship_voy_no'))

                            }).reduce((left, right) => {
                                return left.add(' / ', right)
                            }),
                            exporter_name: r.db('external_f3').table('exporter').get(fee_det_merge('exporter_id'))
                                .getField('trader_id').do(function (trader_do) {
                                    return r.db('external_f3').table('trader').get(trader_do).getField('seller_id').do(function (seller_do) {
                                        return r.db('external_f3').table('seller').get(seller_do).getField('seller_name_th')
                                    })
                                }),
                            pay_det_status_name: r.branch(fee_det_merge('pay_det_status').eq(true), 'จ่ายแล้ว', 'ยังไม่ได้จ่าย')
                        }
                    })
            }
        })
        .eqJoin('invoice_id', r.db('g2g').table('invoice'))
        .pluck("left", { right: ['invoice_no', 'invoice_date'] }).zip()
        .merge(inv_merge => {
            return {
                invoice_date: inv_merge('invoice_date').split('T')(0)
            }
        })
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}

exports.insert = function (req, res) {
    var valid = req._validator.validate('g2g.payment', req.body);
    var r = req._r;
    var result = { result: false, message: null, id: null };
    if (valid) {
        r.db('g2g').table('payment')
            .insert(req.body)
            .do(after_insert_do => {
                return r.db('g2g').table('payment').get(after_insert_do('generated_keys')(0))
                    .do(after_get_do => {
                        return after_get_do('payment_detail').forEach(pay_det_each => {
                            return r.db('g2g').table('payment_detail').get(pay_det_each('pay_det_id')).update({ pay_det_status: true })
                        })
                    })
                    .do(return_id => {
                        return after_insert_do
                    })
            })
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
        result.message = req._validator.errorsText()
        res.json(result);
    }
}
exports.update = function (req, res) {
    var r = req._r;
    var result = { result: false, message: null, id: null };
    if (req.body.id != '' && req.body.id != null && typeof req.body.id != 'undefined') {
        result.id = req.body.id;
        r.db("g2g").table("payment")
            .get(req.body.id)
            .update(req.body)
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
