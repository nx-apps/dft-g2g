exports.seller = function (req, res) {
    var r = req.r;
    r.db('external').table("seller")
        .merge(function (row) {
            return {
                seller_id: row('id'),
                date_created: row('date_created').split('T')(0)
            }
        })
        // .without('id')
        // .eqJoin("country_id", r.db('common').table("country")).without({ right: ["id", "date_created", "date_updated"] }).zip()
        .run()
        .then(function (result) {
            res.json(result);
        })
        .error(function (err) {
            res.json(err);
        })
}
exports.sellerId = function (req, res, next) {
    var r = req.r;
    r.db('external').table("seller")
        .get(req.params.seller_id)
        .merge(
        { seller_id: r.row('id') },
        r.db('common').table("country").get(r.row("country_id"))
        )
        .without('id')
        .run()
        .then(function (result) {
            res.json(result);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.insert = function (req, res, next) {
    var r = req.r;
    //console.log(req.body);
    var valid = req.ajv.validate('exporter.seller', req.body);
    var result = { result: false, message: null, id: null };
    if (valid) {
        if (req.body.id == null) {
            req.body = Object.assign(req.body, {
                creater: 'admin',
                updater: 'admin',
                date_created: new Date().toISOString(),
                date_updated: new Date().toISOString()
            });
            r.db('external').table('seller')
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
            result.message = 'field "id" must do not have data';
            res.json(result);
        }
    } else {
        result.message = req.ajv.errorsText()
        res.json(result);
    }
}
exports.update = function (req, res, next) {
    var r = req.r;
    var result = { result: false, message: null, id: null };
    if (req.body.id != '' && req.body.id != null && typeof req.body.id != 'undefined') {
        result.id = req.body.id;
        req.body = Object.assign(req.body, { date_updated: this.date_updated, updater: 'admin' });
        r.db('external').table('seller')
            .get(req.body.id)
            .update(req.body, { returnChanges: true })
            .run()
            .then(function (response) {
                result.message = response;
                if (response.errors == 0) {
                    result.result = true;
                    var history = {
                        tb_name: 'seller',
                        action: "update",
                        id_value: req.body.id,
                        old_value: null,
                        new_value: req.body,
                        date_created: new Date(),
                        actor: 'admin'
                    };
                    if (response.changes != [] && response.unchanged != 1 || response.replaced == 1) {
                        // console.log(history.old_value);
                        history.old_value = response.changes[0].old_val;
                        //console.log(history.old_value);
                    }

                    r.db('external').table('history').insert(history).run().then()
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
exports.delete = function (req, res, next) {
    var r = req.r;
    var result = { result: false, message: null, id: null };
    if (req.params.id != '' || req.params.id != null) {
        // result.id = req.params.id;
        r.db('external').table('seller')
            .get(req.params.id)
            .delete()
            .run()
            .then(function (response) {
                result.message = response;
                if (response.errors == 0) {
                    result.result = true;
                    var history = {
                        tb_name: 'seller',
                        action: "delete",
                        id_value: req.params.id,
                        old_value: response.changes[0].old_val,
                        new_value: null,
                        date_created: new Date(),
                        actor: 'admin'
                    }
                    r.db('external').table('history').insert(history).run().then()
                }
                res.json(response);
            })
            .error(function (err) {
                // result.message = err;
                res.json(err);
            })
    } else {
        result.message = 'require field id';
        res.json(result);
    }
}
