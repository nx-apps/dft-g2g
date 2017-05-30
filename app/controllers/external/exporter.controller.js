var dd = new Date();
var y = dd.getFullYear();
var m = dd.getMonth();
var d = dd.getDate();
var tz = "T00:00:00.000Z";
var d1y = (y - 1) + '-' + (m < 9 ? '0' : '') + (m + 1) + '-' + (d < 10 ? '0' : '') + d + tz;

exports.exporter = function (req, res) {
    var r = req.r;
    var q = {}, d = {};
    for (key in req.query) {

        if (req.query[key] == "true") {
            req.query[key] = true;
        } else if (req.query[key] == "false") {
            req.query[key] = false;
        } else if (req.query[key] == "null") {
            req.query[key] = null;
        }

        if (key.indexOf('date') > -1) {
            d[key] = req.query[key] + tz;
        } else {
            q[key] = req.query[key];
        }
    }
    if (Object.getOwnPropertyNames(d).length !== 0) {
        d = r.row('exporter_date_approve').gt(d.date_start).and(r.row('exporter_date_approve').lt(d.date_end));
    }
    r.db('external').table('exporter')
        .merge(function (m) {
            return {
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no'), r.expr('ข.').add(m('exporter_no').coerceTo('string'))
                    , null),
                exporter_status_name: r.branch(m('exporter_status').eq('yes'), 'เป็นสมาชิก', 'ไม่เป็นสมาชิก'),
                exporter_date_expire: r.time(m('exporter_date_approve').year().add(1),
                    m('exporter_date_approve').month(),
                    m('exporter_date_approve').day(),
                    "+07:00"
                ).toISO8601(),
                date_export_expire: r.branch(m.hasFields('date_exported'), r.time(m('date_exported').year().add(1),
                    m('date_exported').month(),
                    m('date_exported').day(),
                    "+07:00"
                ).toISO8601(),
                    null),
                exporter_date_approve: m('exporter_date_approve').toISO8601().split('T')(0),
                date_exported: r.branch(m.hasFields('date_exported'),m('date_exported').toISO8601(),null)
            }
        })
        .merge(function (mm) {
            return {
                export_date_expire: r.branch(mm('date_export_expire').gt(mm('exporter_date_expire')),
                    r.branch(mm('date_export_expire').ne(null),mm('date_export_expire').split('T')(0),null),
                    mm('exporter_date_expire').split('T')(0))
            }
        }).without('date_export_expire', 'exporter_date_expire')
        .merge(function (mmm) {
            return {
                export_status: r.branch(mmm('export_date_expire').gt(r.now().toISO8601().split('T')(0)), true, false)
            }
        })
        .merge(function (m) {
            return {
                export_status_name: r.branch(m('export_status').eq(true), 'ปกติ', 'หมดอายุ')
            }
        })
        .eqJoin('company_id', r.db('external').table('company')).without({ right: ["id", "date_create", "date_update", "creater", "updater"] }).zip()
        .eqJoin('confirm_id', r.db('external').table('confirm_exporter')).pluck("left", { right: ["change_status"] }).zip()
        .eqJoin("type_lic_id", r.db('external').table("type_license")).pluck("left", { right: ["type_lic_name"] }).zip()
        .filter(q)
        .filter(d)
        .orderBy('exporter_no')
        .run()
        .then(function (result) {
            res.setHeader('Access-Control-Allow-Origin', 'https://localhost:3001')
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.exporterId = function (req, res) {
    var r = req.r;
    r.db('external').table("exporter").getAll(req.params.exporter_id, { index: 'id' })
        .merge(function (m) {
            return {
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no'), r.expr('ข.').add(m('exporter_no').coerceTo('string'))
                    , null),
                exporter_status_name: r.branch(m('exporter_status').eq('yes'), 'เป็นสมาชิก', 'ไม่เป็นสมาชิก'),
                exporter_date_expire: r.time(m('exporter_date_approve').year().add(1),
                    m('exporter_date_approve').month(),
                    m('exporter_date_approve').day(),
                    "+07:00"
                ).toISO8601(),
                date_export_expire: r.branch(m.hasFields('date_exported'), r.time(m('date_exported').year().add(1),
                    m('date_exported').month(),
                    m('date_exported').day(),
                    "+07:00"
                ).toISO8601(),
                    null),
                exporter_date_approve: m('exporter_date_approve').toISO8601().split('T')(0),
                date_exported: r.branch(m.hasFields('date_exported'),m('date_exported').toISO8601(),null)
            }
        })
        .merge(function (mm) {
            return {
                export_date_expire: r.branch(mm('date_export_expire').gt(mm('exporter_date_expire')),
                    r.branch(mm('date_export_expire').ne(null),mm('date_export_expire').split('T')(0),null),
                    mm('exporter_date_expire').split('T')(0))
            }
        }).without('date_export_expire', 'exporter_date_expire')
        .merge(function (mmm) {
            return {
                export_status: r.branch(mmm('export_date_expire').gt(r.now()), true, false)
            }
        }).merge(function (m) {
            return {
                export_status_name: r.branch(m('export_status').eq(true), 'ปกติ', 'หมดอายุ')
            }
        })
        .eqJoin('company_id', r.db('external').table('company')).without({ right: ["id", "date_create", "date_update", "creater", "updater"] }).zip()
        .eqJoin('confirm_id', r.db('external').table('confirm_exporter')).pluck("left", { right: ["change_status"] }).zip()
        .eqJoin("type_lic_id", r.db('external').table("type_license")).pluck("left", { right: ["type_lic_name"] }).zip()
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.insert = function (req, res) {
    var r = req.r;
    var valid = req.ajv.validate('exporter.exporter', req.body);
    var result = { result: false, message: null, id: null };
    if (valid) {
        if (req.body.id == null) {
            r.db('external').table('exporter').max('exporter_no').getField('exporter_no').add(1)
                .run()
                .then(function (response) {
                    if (response > 0) {
                        req.body.exporter_no = response;
                        req.body.exporter_date_approve = req.body.exporter_date_approve;
                        req.body = Object.assign(req.body, {
                            creater: 'admin',
                            date_created: new Date().inTimezone('+07')
                            // updater: 'admin',
                            // date_updated: new Date().toISOString()
                        });
                        r.db('external').table('exporter')
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
                    }
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
exports.update = function (req, res) {
    var r = req.r;
    // var valid = req.ajv.validate('exporter.exporter', req.body);
    var result = { result: false, message: null, id: null };
    // if (valid) {
    if (req.body.id != '' && req.body.id != null && typeof req.body.id != 'undefined') {
        result.id = req.body.id;
        req.body = Object.assign(req.body, { date_updated: r.now().inTimezone('+07'), updater: 'admin' });
        r.db('external').table('exporter').get(req.body.id)
            .update(req.body, { returnChanges: true })
            .run()
            .then(function (response) {
                result.message = response;
                if (response.errors == 0) {
                    result.result = true;
                    var history = {
                        tb_name: 'exporter',
                        action: "update",
                        id_value: req.body.id,
                        old_value: null,
                        new_value: req.body,
                        date_created: r.now().inTimezone('+07'),
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
    // } else {
    //     result.message = req.ajv.errorsText()
    //     res.json(result);
    // }
}
exports.delete = function (req, res) {
    var r = req.r;
    var result = { result: false, message: null, id: null };
    if (req.params.id != '' || req.params.id != null) {
        // result.id = req.params.id;
        r.db('external').table('exporter')
            .get(req.params.id)
            .delete()
            .run()
            .then(function (response) {
                result.message = response;
                if (response.errors == 0) {
                    result.result = true;
                    var history = {
                        tb_name: 'exporter',
                        action: "delete",
                        id_value: req.params.id,
                        old_value: response.changes[0].old_val,
                        new_value: null,
                        date_created: r.now().inTimezone('+07'),
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
exports.updateDate = function (req, res) {
    var r = req.r;
    // var valid = req.ajv.validate('exporter.exporter', req.body);
    var result = { result: false, message: null, id: null };
    // if (valid) {
    if (req.body.id != '' && req.body.id != null && typeof req.body.id != 'undefined') {
        result.id = req.body.id;
        req.body = Object.assign(req.body,
            {
                exporter_date_approve: r.now().inTimezone('+07'),
                date_updated: r.now().inTimezone('+07'),
                updater: 'admin',
                expire_status: true
            });
        r.db('external').table('exporter').get(req.body.id)
            .update(req.body, { returnChanges: true })
            .do(function () {
                return r.db('external').table('confirm_exporter').get(req.body.confirm_id)
                    .update({
                        approve_status: 'approve',
                        date_updated: r.now().inTimezone('+07'),
                        updater: 'admin'
                    }, { returnChanges: true })
            })
            .run()
            .then(function (response) {
                result.message = response;
                if (response.errors == 0) {
                    result.result = true;
                    var history = {
                        tb_name: 'exporter',
                        action: "update",
                        id_value: req.body.id,
                        old_value: null,
                        new_value: req.body,
                        date_created: r.now().inTimezone('+07'),
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
    // } else {
    //     result.message = req.ajv.errorsText()
    //     res.json(result);
    // }
}
