exports.getByContractId = function (req, res) {
    r.db('g2g2').table('payment_detail')
        .getAll(req.params.contract_id, { index: 'tags' })
        // .filter({ pay_det_status: false })
        .filter(function (pay_det_filter) {
            return pay_det_filter('invoice_exporter_date').ne('').and(pay_det_filter('pay_det_status').eq(true))
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
                invoice_date: inv_merge('invoice_date').split('T')(0),
                // pay_amounts: inv_merge('payment_detail').sum('pay_amount')

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