exports.duplicate = function (req, res) {
    var r = req.r;
    var q = {};
    var tb = req.query['table'];
    if (req.query['field'].indexOf('_no')>-1) {
        req.query['value'] = parseInt(req.query['value']);
    }
    q[req.query['field']] = req.query['value'];

    r.db('external').table(tb)
        .filter(q)
        .count()
        .run()
        .then(function (result) {
            res.json(result);
        })
        .error(function (err) {
            res.json(err);
        })
}

exports.myowner = function (req, res) {
    var r = req.r;
    var q = {};
    var tb = req.query['table'];
    q['id'] = req.query['id'];
    if (req.query['field'].indexOf('_no')>-1) {
        req.query['value'] = parseInt(req.query['value']);
    }
    q[req.query['field']] = req.query['value'];
    r.db('external').table(tb)
        .filter(q)
        .count()
        .run()
        .then(function (result) {
            res.json(result);
        })
        .error(function (err) {
            res.json(err);
        })
}
