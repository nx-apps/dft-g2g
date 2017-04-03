exports.getByContractId = function (req, res) {
    var r = req.r;
    r.db('g2g2').table('payment_detail')
        .getAll(req.params.contract_id, { index: 'tags' })
        // .filter({ pay_det_status: false })
        .filter(function (pay_det_filter) {
            return pay_det_filter('invoice_exporter_date').ne('').and(pay_det_filter('pay_det_status').eq(false))
        })
        .merge({ pay_det_id: r.row('id') })
        .without('id', 'tags')
        .group("invoice_id")
        .ungroup()
        .map(det_map => {
            return {
                invoice_id: det_map('group'),
                payment_detail: det_map('reduction')
                    .eqJoin('shm_det_id', r.db('g2g2').table('shipment_detail'))
                    .pluck("left", { right: ['book_id', 'type_rice_id', 'package_id', 'price_per_ton', 'shm_det_quantity'] }).zip()
                    .eqJoin('book_id', r.db('g2g2').table('book'))
                    .pluck("left", { right: ['ship', 'ship_lot_no', 'cl_id'] }).zip()
                    .eqJoin('cl_id', r.db('g2g2').table('confirm_letter'))
                    .pluck("left", { right: ['contract_id'] }).zip()
                    .eqJoin('type_rice_id', r.db('common').table('type_rice'))
                    .pluck("left", { right: 'type_rice_name_th' }).zip()
                    .eqJoin('package_id', r.db('common').table('package'))
                    .pluck("left", { right: 'package_kg_per_bag' }).zip()
                    .eqJoin('fee_det_id', r.db('g2g2').table('fee_detail'))
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
                            exporter_name: r.db('external').table('exporter').get(fee_det_merge('exporter_id'))
                                .getField('company_id').do(function (company_do) {
                                    // return r.db('external').table('trader').get(trader_do).getField('seller_id').do(function (seller_do) {
                                    return r.db('external').table('company').get(company_do).getField('company_name_th')
                                    // })
                                }),
                            pay_det_status_name: r.branch(fee_det_merge('pay_det_status').eq(true), 'จ่ายแล้ว', 'ยังไม่ได้จ่าย')
                        }
                    })
            }
        })
        .eqJoin('invoice_id', r.db('g2g2').table('invoice'))
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
    var r = req.r;
    r.db('g2g2').table('payment_detail').getAll(req.params.fee_id, { index: 'tags' }).without('tags')
        .merge({ pay_det_id: r.row('id') })
        .without('id')
        .group("invoice_id")
        .ungroup()
        .map(det_map => {
            return {
                invoice_id: det_map('group'),
                payment_detail: det_map('reduction')
                    .eqJoin('shm_det_id', r.db('g2g2').table('shipment_detail'))
                    .pluck("left", { right: ['book_id', 'type_rice_id', 'package_id', 'price_per_ton', 'shm_det_quantity'] }).zip()
                    .eqJoin('book_id', r.db('g2g2').table('book'))
                    .pluck("left", { right: ['ship', 'ship_lot_no', 'cl_id'] }).zip()
                    .eqJoin('cl_id', r.db('g2g2').table('confirm_letter'))
                    .pluck("left", { right: ['contract_id'] }).zip()
                    .eqJoin('type_rice_id', r.db('common').table('type_rice'))
                    .pluck("left", { right: 'type_rice_name_th' }).zip()
                    .eqJoin('package_id', r.db('common').table('package'))
                    .pluck("left", { right: 'package_kg_per_bag' }).zip()
                    .eqJoin('fee_det_id', r.db('g2g2').table('fee_detail'))
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
                            exporter_name: r.db('external').table('exporter').get(fee_det_merge('exporter_id'))
                                .getField('company_id').do(function (company_do) {
                                    // return r.db('external').table('trader').get(trader_do).getField('seller_id').do(function (seller_do) {
                                    return r.db('external').table('company').get(company_do).getField('company_name_th')
                                    // })
                                }),
                            pay_det_status_name: r.branch(fee_det_merge('pay_det_status').eq(true), 'จ่ายแล้ว', 'ยังไม่ได้จ่าย')
                        }
                    })
            }
        })
        .eqJoin('invoice_id', r.db('g2g2').table('invoice'))
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
exports.getSilo = function (req, res) {
    req.jdbc.query("mssql",
        "SELECT bk.Keyword as keyword,bk.Status as statusName,sum(p.tWeight) as weightAll "
        + " FROM ( "
        + " SELECT s.Keyword ,s.Status ,b.book_id "
        + " FROM  dft_lk_status s "
        + " INNER JOIN dft_booking b on b.status_id = s.Id "
        + " WHERE s.Keyword like ? AND s.Active like ? "
        + " GROUP BY  s.Keyword,s.Status,b.book_id "
        + " ) bk "
        + " INNER JOIN dft_product p on p.status = bk.book_id "
        + " GROUP BY  bk.Keyword,bk.Status "
        ,
        ["GG%", "W%"],
        function (err, data) {
            res.send(data);
        });
}
exports.insert = function (req, res) {
    var valid = req.ajv.validate('g2g.payment', req.body);
    var r = req.r;
    var result = { result: false, message: null, id: null };
    if (valid) {
        var obj = Object.assign(req.body, { date_created: new Date().toISOString(), date_updated: new Date().toISOString(), creater: 'admin', updater: 'admin' });
        r.db('g2g2').table('payment')
            .insert(obj)
            .do(after_insert_do => {
                return r.db('g2g2').table('payment').get(after_insert_do('generated_keys')(0))
                    .do(after_get_do => {
                        return after_get_do('payment_detail').forEach(pay_det_each => {
                            return r.db('g2g2').table('payment_detail').get(pay_det_each('pay_det_id')).update({ pay_det_status: true })
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
        result.message = req.ajv.errorsText()
        res.json(result);
    }
}
exports.update = function (req, res) {
    var r = req.r;
    var result = { result: false, message: null, id: null };
    if (req.body.id != '' && req.body.id != null && typeof req.body.id != 'undefined') {
        result.id = req.body.id;
        var obj = Object.assign(req.body, { date_updated: new Date().toISOString(), updater: 'admin' });
        r.db('g2g2').table("payment")
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
        result.message = 'require field id';
        res.json(result);
    }
}
