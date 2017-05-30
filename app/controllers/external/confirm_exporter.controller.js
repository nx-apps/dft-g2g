exports.confirm = function (req, res) {
    var r = req.r;
    r.db('external').table('confirm_exporter')
        .merge(function (m) {
            return {
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no'),
                    r.branch(
                        m('exporter_no').lt(10)
                        , r.expr('ข.000')
                        , r.branch(
                            m('exporter_no').lt(100)
                            , r.expr('ข.00')
                            , r.branch(
                                m('exporter_no').lt(1000)
                                , r.expr('ข.0')
                                , r.expr('ข.')
                            )
                        )
                    ).add(m('exporter_no').coerceTo('string'))
                    , null
                ),
                approve_status_name: r.branch(m('approve_status').eq('request'), 'ตรวจสอบเอกสาร', m('approve_status').eq('process'), 'รออนุมัติ', m('approve_status').eq('approve'), 'อนุมัติ', 'รอส่งเอกสารใหม่')
            }
        })
        .eqJoin('type_lic_id', r.db('external').table('type_license')).pluck({ right: 'type_lic_name' }, 'left').zip()
        .eqJoin("seller_id", r.db('external').table("seller")).without({ right: 'id' }).zip()
        .merge({ date_created: r.row('date_created').split('T')(0) })
        .orderBy('exporter_no')
        .filter(function (c) {
            return c('approve_status').ne('approve').and(c('approve_status').ne('reject'))
        })
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
    var valid = req.ajv.validate('exporter.confirm_exporter', req.body);
    var result = { result: false, message: null, id: null };
    if (valid) {
        r.db('external').table('confirm_exporter').get(req.body.confirm_id).update({ approve_status: 'approve' })
            .run()
        req.body = Object.assign(req.body, {
            creater: 'admin',
            company_id: req.body.company_id,
            exporter_no: req.body.exporter_no,
            exporter_date_approve: r.now().inTimezone('+07')
        }),
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
    } else {
        result.message = req.ajv.errorsText()
        res.json(result);
    }
}
exports.update = function (req, res) {
    var r = req.r;
    // var valid = req.ajv.validate('exporter.confirm_exporter', req.body);
    var result = { result: false, message: null, id: null };
    // if (valid) {
    if (req.body.id != '' && req.body.id != null && typeof req.body.id != 'undefined') {
        result.id = req.body.id;
        req.body = Object.assign(req.body, { date_updated: r.now().inTimezone('+07'), updater: 'admin' });
        r.db('external').table('confirm_exporter')
            .get(req.body.id)
            .update(req.body, { returnChanges: true })
            .run()
            .then(function (response) {
                result.message = response;
                if (response.errors == 0) {
                    result.result = true;
                    var history = {
                        tb_name: 'confirm_exporter',
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
    // result.message = req.ajv.errorsText()
    // res.json(result);
    // }
}
exports.register = function (req, res) {
    var r = req.r
    var result = { result: false, message: null, id: null };
    r.db('external').table('confirm_exporter').max('exporter_no').getField('exporter_no').add(1)
        .run()
        .then(function (response) {
            if (response > 0) {
                req.body.exporter_no = response;
                req.body = Object.assign(req.body, {
                    date_created: r.now().inTimezone('+07'),//new Date().toISOString()
                    creater: 'admin'
                })
                console.log(req.body);
                r.db('external').table('confirm_exporter').insert(req.body)
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

}
exports.reject = function (req, res) {
    var r = req.r;
    var result = { result: false, message: null, id: null };
    if (req.body.id != '' && req.body.id != null && typeof req.body.id != 'undefined') {
        result.id = req.body.id;
        req.body = Object.assign(req.body, { date_updated: r.now().inTimezone('+07') });
        // console.log(req.body);
        r.db('external').table('confirm_exporter')
            .get(req.body.id)
            .update(req.body, { returnChanges: true })
            .run()
            .then(function (response) {
                result.message = response;
                if (response.errors == 0) {
                    result.result = true;
                    result.id = response.generated_keys;
                }
                res.json(result);
            })
            .catch(function (err) {
                result.message = err;
                res.json(result);
            })
    }
}
exports.list = function (req, res) {
    var r = req.r;
    r.db('external').table('confirm_exporter')
        .merge(function (m) {
            return {
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no'),
                    r.branch(
                        m('exporter_no').lt(10)
                        , r.expr('ข.000')
                        , r.branch(
                            m('exporter_no').lt(100)
                            , r.expr('ข.00')
                            , r.branch(
                                m('exporter_no').lt(1000)
                                , r.expr('ข.0')
                                , r.expr('ข.')
                            )
                        )
                    ).add(m('exporter_no').coerceTo('string'))
                    , null
                ),
                approve_status_name: r.branch(m('approve_status').eq('request'), 'ตรวจสอบเอกสาร', m('approve_status').eq('process'), 'รออนุมัติ', m('approve_status').eq('approve'), 'อนุมัติ', 'รอส่งเอกสารใหม่')
            }
        })
        .eqJoin("company_id", r.db('external').table("company")).without({ right: 'id' }).zip()
        .eqJoin("type_lic_id", r.db('external').table("type_license")).pluck('left', { right: 'type_lic_name' }).zip()
        .merge({ date_created: r.row('date_created').toISO8601().split('T')(0) })
        .orderBy('exporter_no')
        .filter(function (c) {
            return c('approve_status').ne('approve').and(c('approve_status').ne('reject'))
        })
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.listId = function (req, res) {
    var r = req.r;
    r.db('external').table('confirm_exporter').getAll(req.params.id, { index: 'company_id' })
        .merge(function (m) {
            return {
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no'),
                    r.branch(
                        m('exporter_no').lt(10)
                        , r.expr('ข.000')
                        , r.branch(
                            m('exporter_no').lt(100)
                            , r.expr('ข.00')
                            , r.branch(
                                m('exporter_no').lt(1000)
                                , r.expr('ข.0')
                                , r.expr('ข.')
                            )
                        )
                    ).add(m('exporter_no').coerceTo('string'))
                    , null
                ),
                approve_status_name: r.branch(m('approve_status').eq('request'), 'ตรวจสอบเอกสาร', m('approve_status').eq('process'), 'รออนุมัติ', m('approve_status').eq('approve'), 'อนุมัติ', 'รอส่งเอกสารใหม่'),

            }
        })
        .eqJoin("company_id", r.db('external').table("company")).without({ right: 'id' }).zip()
        // .merge({ date_created: r.row('date_created').split('T')(0) })
        .orderBy('exporter_no')
        .run()
        .then(function (result) {
            res.json(result[0])
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.getId = function (req, res) {
    var r = req.r;
    r.db('external').table('exporter').getAll(req.params.id, { index: 'confirm_id' })
        .merge(function (m) {
            return {
                exporter_id: m('id')
            }
        })
        .eqJoin('confirm_id', r.db('external').table('confirm_exporter'))
        .pluck('right', { left: ['exporter_date_approve', 'exporter_id', 'company_id'] }).zip()
        .eqJoin('company_id', r.db('external').table('company')).pluck('left', { right: 'date_exported' }).zip()
        .merge(function (m) {
            return {
                exporter_date_expire: m('exporter_date_approve').add(31449600),
                date_export_expire: m('date_exported').add(31449600)
            }
        })
        .merge(function (mm) {
            return {
                export_date_expire: r.branch(mm('date_export_expire').gt(mm('exporter_date_expire')),
                    mm('date_export_expire'),
                    mm('exporter_date_expire'))
            }
        }).without('date_export_expire', 'exporter_date_expire')
        .merge(function (mmm) {
            return {
                export_status: r.branch(mmm('export_date_expire').gt(r.now()), true, false)
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
exports.changetype = function (req, res) {
    var r = req.r;
    r.db('external').table('confirm_exporter').get(req.body.id)
        .update({
            change_status: false,
            approve_status: 'approve',
            date_updated: r.now().inTimezone('+07'),
            updater: 'admin'
        }, { returnChanges: true })
        .do(function (d) {
            return r.db('external').table('exporter').get(req.body.exporter_id)
                .update({
                    type_lic_id: req.body.type_lic_id,
                    date_updated: r.now().inTimezone('+07'),
                    updater: 'admin'
                }, { returnChanges: true })
        })
        .run()
        .then(function (result) {
            res.json(result);
        })
        .error(function (err) {
            res.json(err)
        })
}