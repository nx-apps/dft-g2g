exports.getByContractId = function (req, res) {
    var r = req.r;
    r.table('book')
        .getAll([req.query.id, true, false], { index: 'contractBookInvoiceStatus' })
        .merge(function (m) {
            var detail = r.table('book_detail').getAll(m('id'), { index: 'book_id' });
            return {
                net_weight: detail.sum('net_weight'),
                value_d: detail.sum('value_d')
            }
        })
        .pluck('id', 'value_d', 'net_weight', 'invoice_status', 'ship_lot', 'cl_no', 'bl_no')
        .orderBy('cl_no', 'ship_lot')
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}