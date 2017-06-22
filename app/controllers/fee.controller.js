exports.getByContractId = function (req, res) {
    var r = req.r;
    r.table('fee')
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}

