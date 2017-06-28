exports.getByContractId = function (req, res) {
    var r = req.r;
    r.table('book')
        .getAll([req.query.id, true, false], { index: 'contractBookInvoiceStatus' })
        .pluck('id', 'ship_lot', 'bl_no', { 'deli_port': ['country_name_en', 'port_name'] }, { 'dest_port': ['country_name_en', 'port_name'] })
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}