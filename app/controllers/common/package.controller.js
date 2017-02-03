exports.list = function (req, res) {
    var r = req._r;
    var orderby = req.query.orderby;
    r.db('common').table("package")
        .merge(function (row) {
            return {
                package_id: row('id'),
                date_created: row('date_created').split('T')(0),
                date_updated: row('date_updated').split('T')(0)
            }
        })
        .without('id')
        .orderBy('package_id')
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.getById = function (req, res) {
    var r = req._r;
    r.db('common').table("package")
        .get(req.params.id)
        .merge({
            package_id: r.row('id'),
            date_created: r.row('date_created').split('T')(0),
            date_updated: r.row('date_updated').split('T')(0)
        })
        .without('id')
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.insert = function (req, res) {
    var valid = req._validator.validate('common.package', req.body);
    var r = req._r;
    var result = { result: false, message: null, id: null };
    if (valid) {
        r.db("common").table("package")
            .insert(req.body)
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
        r.db("common").table("package")
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
exports.delete = function (req, res) {
    var r = req._r;
    var result = { result: false, message: null, id: null };
    if (req.params.id != '' || req.params.id != null) {
        result.id = req.params.id;
        r.db('common').table('package')
            .get(req.params.id)
            .delete()
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