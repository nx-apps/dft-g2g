exports.document_type = function (req, res) {
    var r = req.r;
    r.db('external').table('document_type')
        .merge(function (row) {
            return { doc_type_id: row('id') }
        })
        .without('id')
        .run()
        .then(function (result) {
            res.json(result);
        })
        .error(function (err) {
            res.json(err);
        })
}
exports.document_typeId = function (req, res) {
    var r = req.r;
    r.db('external').table('document_type')
        .get(req.params.doc_type_id)
        .merge(function (row) {
            return { doc_type_id: row('id') }
        })
        .without('id')
        .run()
        .then(function (result) {
            res.json(result);
        })
        .error(function (err) {
            res.json(err);
        })
}