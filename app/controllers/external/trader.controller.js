exports.trader = function (req, res) {
    var r = req.r;
    var q = {};
    for (key in req.query) {

        if (req.query[key] == "true") {
            req.query[key] = true;
        } else if (req.query[key] == "false") {
            req.query[key] = false;
        } else if (req.query[key] == "null") {
            req.query[key] = null;
        }
        q[key] = req.query[key];
        console.log(q);
    }
    r.db('external_f3').table("trader")
        .merge(function (row) {
            return {
                trader_id: row('id'),
                date_updated: row('date_updated').split('T')(0),
                trader_date_approve: row('trader_date_approve').split('T')(0),
                trader_date_expire: row('trader_date_approve').split('T')(0).split('-')(0).add("-12-31"),
                trader_active: r.now().toISO8601().lt(row('trader_date_approve').split('T')(0).split('-')(0).add("-12-31T00:00:00.000Z"))
            }
        })
        .without('id')
        .eqJoin("seller_id", r.db('external_f3').table("seller")).without({ right: ["id", "date_created", "date_updated"] }).zip()
        .eqJoin("type_lic_id", r.db('external_f3').table("type_license")).without({ right: ["id", "date_created", "date_updated"] }).zip()
        // .eqJoin("country_id", r.db('common').table("country")).without({ right: ["id", "date_created", "date_updated"] }).zip()
        // .eqJoin("province_id", r.db('common').table("province")).without({ right: ["id", "date_created", "date_updated"] }).zip()
        .orderBy('trader_no')
        .filter(q)
        .run()
        .then(function (result) {
            res.json(result);
        })
        .error(function (err) {
            res.json(err);
        })
}
exports.traderId = function (req, res) {
    var r = req.r;
    r.db('external_f3').table("trader")
        .get(req.params.trader_id)
        .merge({
            trader_id: r.row('id'),
            trader_date_approve: r.row('trader_date_approve').split('T')(0),
            trader_date_expire: r.row('trader_date_approve').split('T')(0).split('-')(0).add("-12-31"),
            trader_active: r.now().toISO8601().lt(r.row('trader_date_approve').split('T')(0).split('-')(0).add("-12-31T00:00:00.000Z"))
        },
        r.db('external_f3').table("seller").get(r.row("seller_id")),
        r.db('external_f3').table("type_license").get(r.row("type_lic_id")),
        r.db('common').table("country").get(r.row("country_id")),
        r.db('common').table("province").get(r.row("province_id"))
        )
        //  .merge(r.db('common').table("country").get(r.row("country_id")))
        .without('id')
        .run()
        .then(function (result) {
            res.json(result);
        })
        .error(function (err) {
            res.json(err);
        })
}
exports.seller = function (req, res) {
    var r = req.r;
    r.db('external_f3').table("trader")
        .eqJoin("seller_id", r.db('external_f3').table("seller")).without({ right: ["id", "date_created", "date_updated"] }).zip()
        //.eqJoin("exporter_id", r.db('external_f3').table("exporter")).not()
        // ,function(t,e){
        //     return t("exporter_id").eq(e("id"));
        // })
        // .filter(
        //     r.row('seller_name_th').match(req.params.seller_name)
        // )
        // .pluck(
        //     "seller_id","seller_name_th","seller_name_en","seller_address_th",
        //     "trader_id","trader_no","trader_name"
        // )
        .run()
        .then(function (result) {
            res.json(result);
        })
        .error(function (err) {
            res.json(err);
        })
}
exports.insert = function (req, res, next) {
    var r = req.r;
    var valid = req.ajv.validate('exporter.trader', req.body);
    var result = { result: false, message: null, id: null };
    if (valid) {
        //console.log(req.body);
        if (req.body.id == null) {
            req.body = Object.assign(req.body, {
                creater: 'admin',
                updater: 'admin',
                date_created: new Date().toISOString(),
                date_updated: new Date().toISOString()
            });
            r.db('external_f3').table('trader')
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
    var valid = req.ajv.validate('exporter.trader', req.body);
    var result = { result: false, message: null, id: null };
    if (valid) {
        if (req.body.id != '' && req.body.id != null && typeof req.body.id != 'undefined') {
            result.id = req.body.id;
            req.body = Object.assign(req.body, { date_updated: this.date_updated, updater: 'admin' });
            r.db('external_f3').table('trader')
                .get(req.body.id)
                .update(req.body, { returnChanges: true })
                .run()
                .then(function (response) {
                    result.message = response;
                    if (response.errors == 0) {
                        result.result = true;
                        var history = {
                            tb_name: 'trader',
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

                        r.db('external_f3').table('history').insert(history).run().then()
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
    } else {
        result.message = req.ajv.errorsText()
        res.json(result);
    }
}
exports.delete = function (req, res, next) {
    var r = req.r;
    var result = { result: false, message: null, id: null };
    if (req.params.id != '' || req.params.id != null) {
        // result.id = req.params.id;
        r.db('external_f3').table('trader')
            .get(req.params.id)
            .delete()
            .run()
            .then(function (response) {
                result.message = response;
                if (response.errors == 0) {
                    result.result = true;
                    var history = {
                        tb_name: 'trader',
                        action: "delete",
                        id_value: req.params.id,
                        old_value: response.changes[0].old_val,
                        new_value: null,
                        date_created: new Date(),
                        actor: 'admin'
                    }
                    r.db('external_f3').table('history').insert(history).run().then()
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



