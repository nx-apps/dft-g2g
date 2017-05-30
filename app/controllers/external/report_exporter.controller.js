var dd = new Date();
var y = dd.getFullYear();
var m = dd.getMonth();
var d = dd.getDate();
var tz = "T00:00:00.000+07:00";
var d1y = (y - 1) + '-' + (m < 9 ? '0' : '') + (m + 1) + '-' + (d < 10 ? '0' : '') + d + tz;
exports.report1 = function (req, res) {
    var r = req.r;
    // res.json(__dirname.replace('controller','report'));
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10),
        date_start: y + "-01-01" + tz,
        date_end: y + "-12-31" + tz
    };
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
    // console.log(parameters, d);
    if (Object.getOwnPropertyNames(d).length !== 0) {
        parameters['date_start'] = d['date_start'];
        parameters['date_end'] = d['date_end'];
        d = r.row('exporter_date_approve').gt(d.date_start).and(r.row('exporter_date_approve').lt(d.date_end));
    } else {
        d = r.row('exporter_date_approve').gt(parameters['date_start']).and(r.row('exporter_date_approve').lt(parameters['date_end']));
        parameters['date_start'] = parameters['date_start'];
        parameters['date_end'] = parameters['date_end'];
    }
    var date_start = parameters['date_start']
    var date_end = parameters['date_end']
    // console.log(parameters);
    r.db('external').table('exporter')
        .filter(function (f) {
            return f('exporter_date_approve').date().during(r.ISO8601(date_start).inTimezone('+07').date(), 
            r.ISO8601(date_end).inTimezone('+07').date(), { rightBound: 'closed' })
        })
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
        // .filter(d)
        .orderBy('exporter_no')
        .run()
        .then(function (result) {
            // res.json(result);
            res.ireport("exporter/report1.jasper", req.query.export || "pdf", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.report2 = function (req, res, next) {
    var r = req.r;
    //res.json(__dirname.replace('controller','report'));
    var parameters = {
        // CURRENT_DATE: new Date().toISOString().slice(0, 10),
        date_start: y + "-01-01" + tz,
        date_end: y + "-12-31" + tz
    };
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
    // console.log(parameters, d);
    if (Object.getOwnPropertyNames(d).length !== 0) {
        parameters['date_start'] = d['date_start'];
        parameters['date_end'] = d['date_end'];
        d = r.row('exporter_date_approve').gt(d.date_start).and(r.row('exporter_date_approve').lt(d.date_end));
    } else {
        d = r.row('exporter_date_approve').gt(parameters['date_start']).and(r.row('exporter_date_approve').lt(parameters['date_end']));
        parameters['date_start'] = parameters['date_start'];
        parameters['date_end'] = parameters['date_end'];
    }
    var date_start = parameters['date_start']
    var date_end = parameters['date_end']
    // console.log(parameters);

    r.db('external').table('exporter')
        .filter(function (f) {
            return f('exporter_date_approve').date().during(r.ISO8601(date_start).inTimezone('+07').date(), 
            r.ISO8601(date_end).inTimezone('+07').date(), { rightBound: 'closed' })
        })
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
        .eqJoin('type_lic_id', r.db('external').table('type_license')).pluck({ right: 'type_lic_name' }, 'left').zip()
        .filter(q)
        // .filter(d)
        .orderBy('exporter_no')
        .run()
        .then(function (result) {
            // res.json(result);
            res.ireport("exporter/report2.jasper", "pdf", result, parameters);
        });
}
exports.report3 = function (req, res, next) {
    var r = req.r;
    //res.json(__dirname.replace('controller','report'));
    var parameters = {
        // CURRENT_DATE: new Date().toISOString().slice(0, 10),
        date_start: y + "-01-01" + tz,
        date_end: y + "-12-31" + tz
    };
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
    // console.log(parameters, d);
    if (Object.getOwnPropertyNames(d).length !== 0) {
        parameters['date_start'] = d['date_start'];
        parameters['date_end'] = d['date_end'];
        d = r.row('exporter_date_approve').gt(d.date_start).and(r.row('exporter_date_approve').lt(d.date_end));
    } else {
        d = r.row('exporter_date_approve').gt(parameters['date_start']).and(r.row('exporter_date_approve').lt(parameters['date_end']));
        parameters['date_start'] = parameters['date_start'];
        parameters['date_end'] = parameters['date_end'];
    }
    var date_start = parameters['date_start']
    var date_end = parameters['date_end']
    //console.log(parameters);

    r.db('external').table('exporter')
        .filter(function (f) {
            return f('exporter_date_approve').date().during(r.ISO8601(date_start).inTimezone('+07').date(), 
            r.ISO8601(date_end).inTimezone('+07').date(), { rightBound: 'closed' })
        })
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
        .filter(q)
        // .filter(d)
        .orderBy('exporter_no')
        .run()
        .then(function (result) {
            // res.json(result);
            res.ireport("exporter/report3.jasper", "pdf", result, parameters);
        });
}
exports.report4 = function (req, res) {
    var r = req.r;
    r.db('external').table('company')
        .outerJoin(r.db('external').table('exporter')
            .merge(function (m) {
                return {
                    exporter_id: m('id'),
                    book: r.db('g2g').table('shipment_detail')
                        .filter({ exporter_id: m('id') })
                        .pluck('book_id')
                        .distinct()
                        .coerceTo('array')
                        .eqJoin('book_id', r.db('g2g').table('book')).pluck({ right: 'etd_date' }, "left").zip()
                        .orderBy(r.desc('etd_date'))
                        .limit(1)
                        .getField('etd_date')
                }
            }).without('id')
            .merge(function (m) {
                return {
                    export_date: r.branch(
                        m('book').eq([]),
                        null,
                        m('book')(0).split('T')(0)
                    ),
                    export_date_expire: r.branch(
                        m('book').eq([]),
                        null,
                        r.ISO8601(m('book')(0)).add(31449600)
                        // r.ISO8601(m('book')(0)).year().add(1)
                        //  r.ISO8601(m('book')(0)).month()
                        //r.ISO8601(m('book')(0)).day().sub(1)
                        //.add(31536000)
                    ),
                    exporter_date_expire: r.ISO8601(m('exporter_date_approve')).add(31449600)
                    // export_status: r.branch(
                    //     m('book').eq([]),
                    //     false,
                    //     r.ISO8601(m('book')(0)).add(31449600).gt(r.now())
                    // )
                    // export_date: r.branch(m('book').eq([]), null, m('book')(0).split('T')(0)),
                    // exporter_date_approve: m('exporter_date_approve').split('T')(0)
                }
            })
            .merge(function (mm) {
                return {
                    export_date_expire: r.branch(mm('export_date_expire').gt(mm('exporter_date_expire')),
                        mm('export_date_expire'),
                        mm('exporter_date_expire'))
                }
            })
            .merge(function (mmm) {
                return {
                    export_status: r.branch(mmm('export_date_expire').gt(r.now()), true, false),
                    export_date_expire: mmm('export_date_expire').toISO8601(),
                    exporter_date_expire: mmm('exporter_date_expire').toISO8601()
                }
            })
            .without('book'),
        function (company, exporter) {
            return company('id').eq(exporter('company_id'))
        }).zip()
        // .eqJoin('type_lic_id', r.db('external').table('type_license')).pluck({ right: 'type_lic_name' }, 'left').zip()
        // .eqJoin('seller_id', r.db('external').table('seller'))
        // .pluck({ right: ['seller_name_th', 'seller_name_en', 'seller_address_th', 'seller_address_en'] }, 'left').zip()
        .merge(function (m) {
            return {
                exporter_status_name: r.branch(m.hasFields('exporter_no'), 'เป็นสมาชิก', 'ไม่เป็นสมาชิก'),
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no'), r.expr('ข.').add(m('exporter_no').coerceTo('string'))
                    , null)
            }
        })
        .filter({ export_status: false })
        .orderBy('exporter_no')
        .run()
        .then(function (result) {
            // res.json(result);
            parameters = {}
            res.ireport("exporter/report4.jasper", req.query.export || "pdf", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.report5 = function (req, res) {
    var r = req.r;
    var date_start, date_end;
    var _nextDay = new Date();
    _nextDay.setDate(_nextDay.getDate() + 1);
    var nextDays = _nextDay.toISOString().slice(0, 10);
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10),
        date_start: new Date().toISOString().slice(0, 10),
        date_end: nextDays
    };
    var d = {};
    // console.log('ddd',req.query['date_start']);
    // parameters['date_end'].setDate(parameters['date_end'].getDate() + 1)
    // console.log('dddxxxx',parameters['date_end']);
    //ถ้าไม่ส่งอะไรมาเลย
    // if(Object.getOwnPropertyNames(req.query).length == 0){
    d['date_start'] = parameters['date_start']
    d['date_end'] = parameters['date_end'];
    // }else {
    // d['date_start'] = req.query['date_start']
    // d['date_end'] = parameters['date_end'];
    // d['date_end'] = req.query['date_end']
    // }
    //  console.log('ddd',d);   
    // if (Object.getOwnPropertyNames(d).length !== 0) {
    //     parameters['date_start'] = d['date_start'].split('T')[0];
    //     parameters['date_end'] = d['date_end'].split('T')[0];
    // } else {
    parameters['date_start'] = parameters['date_start'];
    parameters['date_end'] = parameters['date_end'];
    // }
    // console.log('parameters=>',parameters)
    // date_start = "2016-12-01T00:00:00.000Z";
    // date_end = "2016-12-31T00:00:00.000Z";
    date_start = parameters.date_start;
    date_end = parameters.date_end;
    r.db('external').table("exporter").between(date_start, date_end, { index: 'exporter_date_approve' })
        .merge(shm_det_merge => {
            return {
                quantity: r.db('g2g').table('shipment_detail')
                    .getAll(shm_det_merge('id'), { index: 'exporter_id' }).pluck("shm_det_quantity", "book_id").coerceTo('array')
                    .eqJoin('book_id', r.db('g2g').table('book')).pluck("left", { right: "etd_date" }).zip()
                    .filter(date_filter => {
                        return date_filter('etd_date').ge(date_start).and(date_filter('etd_date').le(date_end))
                    })
                    .sum('shm_det_quantity')
            }
        })
        .eqJoin('seller_id', r.db('external').table("seller")).pluck("left", { right: ["seller_address_th"] }).zip()
        .merge(function (m) {
            return {
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no'), r.expr('ข.').add(m('exporter_no').coerceTo('string'))
                    , null),
                exporter_date_approve: m('exporter_date_approve').split('T')(0),
                count_exporter: r.db('external').table("exporter").between(date_start, date_end
                    , { index: 'exporter_date_approve' }).count(),
                sum: r.db('external').table("exporter").between(date_start, date_end, { index: 'exporter_date_approve' })
                    .merge(shm_det_merge => {
                        return {
                            quantity: r.db('g2g').table('shipment_detail')
                                .getAll(shm_det_merge('id'), { index: 'exporter_id' }).pluck("shm_det_quantity", "book_id").coerceTo('array')
                                .eqJoin('book_id', r.db('g2g').table('book')).pluck("left", { right: "etd_date" }).zip()
                                .filter(date_filter => {
                                    return date_filter('etd_date').ge(date_start).and(date_filter('etd_date').le(date_end))
                                })
                                .sum('shm_det_quantity')
                        }
                    }).sum('quantity')
            }
        })
        .orderBy('exporter_date_approve')
        .run()
        .then(function (result) {
            // res.json(result);
            //  parameters = {}
            res.ireport("exporter/report5.jasper", req.query.export || "pdf", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.report5_1 = function (req, res) {
    var r = req.r;
    var date_start, date_end;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10),
        date_start: y + "-01-01" + tz,
        date_end: y + "-12-31" + tz
    };
    var d = {};
    //ถ้าไม่ส่งอะไรมาเลย
    if (Object.getOwnPropertyNames(req.query).length == 0) {
        d['date_start'] = "2000-01-01T00:00:00.000Z";
        d['date_end'] = parameters['CURRENT_DATE'];
    } else if (Object.getOwnPropertyNames(req.query).length == 1) {
        if (req.query['date_start'] !== undefined) {
            d['date_start'] = req.query['date_start']
            d['date_end'] = parameters['CURRENT_DATE'];
        } else {
            d['date_start'] = "2000-01-01T00:00:00.000Z";
            d['date_end'] = req.query['date_end']
        }
    } else {
        d['date_start'] = req.query['date_start']
        d['date_end'] = req.query['date_end']
    }

    if (Object.getOwnPropertyNames(d).length !== 0) {
        parameters['date_start'] = d['date_start'].split('T')[0];
        parameters['date_end'] = d['date_end'].split('T')[0];
    } else {
        parameters['date_start'] = parameters['date_start'].split('T')[0];
        parameters['date_end'] = parameters['date_end'].split('T')[0];
    }

    // console.log('parameters=>',parameters)
    // date_start = "2016-12-01T00:00:00.000Z";
    // date_end = "2016-12-31T00:00:00.000Z";
    date_start = parameters.date_start;
    date_end = parameters.date_end;
    r.db('external').table("exporter").between(date_start, date_end, { index: 'exporter_date_approve' })
        .merge(shm_det_merge => {
            return {
                quantity: r.db('g2g').table('shipment_detail')
                    .getAll(shm_det_merge('id'), { index: 'exporter_id' }).pluck("shm_det_quantity", "book_id").coerceTo('array')
                    .eqJoin('book_id', r.db('g2g').table('book')).pluck("left", { right: "etd_date" }).zip()
                    .filter(date_filter => {
                        return date_filter('etd_date').ge(date_start).and(date_filter('etd_date').le(date_end))
                    })
                    .sum('shm_det_quantity')
            }
        })
        .eqJoin('seller_id', r.db('external').table("seller")).pluck("left", { right: ["seller_name_th"] }).zip()
        .merge(function (m) {
            return {
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no'), r.expr('ข.').add(m('exporter_no').coerceTo('string'))
                    , null),
                exporter_date_approve: m('exporter_date_approve').split('T')(0),
                count_exporter: r.db('external').table("exporter").between(date_start, date_end
                    , { index: 'exporter_date_approve' }).count(),
                sum: r.db('external').table("exporter").between(date_start, date_end, { index: 'exporter_date_approve' })
                    .merge(shm_det_merge => {
                        return {
                            quantity: r.db('g2g').table('shipment_detail')
                                .getAll(shm_det_merge('id'), { index: 'exporter_id' }).pluck("shm_det_quantity", "book_id").coerceTo('array')
                                .eqJoin('book_id', r.db('g2g').table('book')).pluck("left", { right: "etd_date" }).zip()
                                .filter(date_filter => {
                                    return date_filter('etd_date').ge(date_start).and(date_filter('etd_date').le(date_end))
                                })
                                .sum('shm_det_quantity')
                        }
                    }).sum('quantity')
            }
        })
        .orderBy('exporter_date_approve')
        .run()
        .then(function (result) {
            //   res.json(result);
            //  parameters = {}
            res.ireport("exporter/report5_1.jasper", req.query.export || "pdf", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.report5_2 = function (req, res) {
    var r = req.r;
    var date_start, date_end;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10),
        date_start: y + "-01-01" + tz,
        date_end: y + "-12-31" + tz
    };
    var d = {};
    //ถ้าไม่ส่งอะไรมาเลย
    if (Object.getOwnPropertyNames(req.query).length == 0) {
        d['date_start'] = "2000-01-01T00:00:00.000Z";
        d['date_end'] = parameters['CURRENT_DATE'];
    } else if (Object.getOwnPropertyNames(req.query).length == 1) {
        if (req.query['date_start'] !== undefined) {
            d['date_start'] = req.query['date_start']
            d['date_end'] = parameters['CURRENT_DATE'];
        } else {
            d['date_start'] = "2000-01-01T00:00:00.000Z";
            d['date_end'] = req.query['date_end']
        }
    } else {
        d['date_start'] = req.query['date_start']
        d['date_end'] = req.query['date_end']
    }

    if (Object.getOwnPropertyNames(d).length !== 0) {
        parameters['date_start'] = d['date_start'].split('T')[0];
        parameters['date_end'] = d['date_end'].split('T')[0];
    } else {
        parameters['date_start'] = parameters['date_start'].split('T')[0];
        parameters['date_end'] = parameters['date_end'].split('T')[0];
    }
    // console.log('parameters=>',parameters)
    // date_start = "2016-12-01T00:00:00.000Z";
    // date_end = "2016-12-31T00:00:00.000Z";
    date_start = parameters.date_start;
    date_end = parameters.date_end;
    r.db('external').table("exporter").between(date_start, date_end, { index: 'exporter_date_approve' })
        .merge(shm_det_merge => {
            return {
                quantity: r.db('g2g').table('shipment_detail')
                    .getAll(shm_det_merge('id'), { index: 'exporter_id' }).pluck("shm_det_quantity", "book_id").coerceTo('array')
                    .eqJoin('book_id', r.db('g2g').table('book')).pluck("left", { right: "etd_date" }).zip()
                    .filter(date_filter => {
                        return date_filter('etd_date').ge(date_start).and(date_filter('etd_date').le(date_end))
                    })
                    .sum('shm_det_quantity')
            }
        })
        .eqJoin('seller_id', r.db('external').table("seller")).pluck("left", { right: ["seller_name_th"] }).zip()
        .merge(function (m) {
            return {
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no'), r.expr('ข.').add(m('exporter_no').coerceTo('string'))
                    , null),
                exporter_date_approve: m('exporter_date_approve').split('T')(0),
                count_exporter: r.db('external').table("exporter").between(date_start, date_end
                    , { index: 'exporter_date_approve' }).count(),
                sum: r.db('external').table("exporter").between(date_start, date_end, { index: 'exporter_date_approve' })
                    .merge(shm_det_merge => {
                        return {
                            quantity: r.db('g2g').table('shipment_detail')
                                .getAll(shm_det_merge('id'), { index: 'exporter_id' }).pluck("shm_det_quantity", "book_id").coerceTo('array')
                                .eqJoin('book_id', r.db('g2g').table('book')).pluck("left", { right: "etd_date" }).zip()
                                .filter(date_filter => {
                                    return date_filter('etd_date').ge(date_start).and(date_filter('etd_date').le(date_end))
                                })
                                .sum('shm_det_quantity')
                        }
                    }).sum('quantity')
            }
        })
        .orderBy('exporter_date_approve')
        .run()
        .then(function (result) {
            //   res.json(result);
            //  parameters = {}
            res.ireport("exporter/report5_2.jasper", req.query.export || "pdf", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.exporter_detail = function (req, res) {
    var r = req.r;
    var params = req.params;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10)
    };
    r.db('external').table('exporter').getAll(req.params.id, { index: 'id' })
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
        // .filter({ exporter_id: params.exporter_id })
        // .filter(q)
        .filter(d)
        .orderBy('exporter_no')
        // r.db('external').table("company")
        // .outerJoin(
        //     r.db('external').table("exporter")
        //         .merge(function (m) {
        //             return {
        //                 exporter_id: m('id'),
        //                 book: r.db('g2g').table('shipment_detail')
        //                     .getAll(m('id'), { index: 'exporter_id' })
        //                     .pluck('book_id')
        //                     .distinct()
        //                     .coerceTo('array')
        //                     .eqJoin('book_id', r.db('g2g').table('book')).pluck({ right: 'etd_date' }, "left").zip()
        //                     .orderBy(r.desc('etd_date'))
        //                     .limit(1)
        //                     .getField('etd_date')
        //             }
        //         }).without('id')
        //         .merge(function (m) {
        //             return {
        //                 export_date: r.branch(
        //                     m('book').eq([]),
        //                     null,
        //                     m('book')(0).split('T')(0)
        //                 ),
        // export_date_expire: r.branch(
        //     m('book').eq([]),
        //     null,
        //     r.ISO8601(m('book')(0)).add(31449600)
        //     // r.ISO8601(m('book')(0)).year().add(1)
        //     //  r.ISO8601(m('book')(0)).month()
        //     //r.ISO8601(m('book')(0)).day().sub(1)
        //     //.add(31536000)
        // ),
        //         // export_status: r.branch(
        //         //     m('book').eq([]),
        //         //     false,
        //         //     r.ISO8601(m('book')(0)).add(31449600).gt(r.now())
        //         // ),
        //         exporter_date_expire: r.ISO8601(m('exporter_date_approve')).add(31449600)
        //     }
        // })
        // .merge(function (mm) {
        //     return {
        //         export_date_expire: r.branch(mm('export_date_expire').gt(mm('exporter_date_expire')),
        //             mm('export_date_expire'),
        //             mm('exporter_date_expire'))
        //     }
        // })
        // .merge(function (mmm) {
        //     return {
        //         export_status: r.branch(mmm('export_date_expire').gt(r.now()), true, false),
        //         export_date_expire: mmm('export_date_expire').toISO8601(),
        //         exporter_date_expire: mmm('exporter_date_expire').toISO8601()
        //     }
        // })
        // .without('book'),
        // function (company, exporter) {
        //     return exporter("company_id").eq(company("id"))
        // }
        // )
        // .merge(function (mm) {
        //     return {
        //         left: {
        //             company_id: mm('left')('id')
        //         }
        //     }
        // })
        // .without({ left: 'id' })
        // .zip()
        // .merge(function (m) {
        //     return {
        //         export_date_expire: r.branch(m.hasFields('export_date_expire'), m('export_date_expire').split('T')(0), null),
        //         export_status: r.branch(m.hasFields('export_status'), m('export_status'), null),
        //         exporter_id: r.branch(m.hasFields('exporter_id'), m('exporter_id'), null),
        //         exporter_status: m.hasFields('exporter_no'),
        //         exporter_status_name: r.branch(m.hasFields('exporter_no'), 'เป็นสมาชิก', 'ไม่เป็นสมาชิก'),
        //         exporter_date_approve: r.branch(m.hasFields('exporter_date_approve'), m('exporter_date_approve').split('T')(0), null),
        //         exporter_date_expire: r.branch(m.hasFields('exporter_date_expire'), m('exporter_date_expire').split('T')(0), null),
        //         exporter_no_name: r.branch(
        //             m.hasFields('exporter_no'),
        //             r.branch(
        //                 m('exporter_no').lt(10)
        //                 , r.expr('ข.000')
        //                 , r.branch(
        //                     m('exporter_no').lt(100)
        //                     , r.expr('ข.00')
        //                     , r.branch(
        //                         m('exporter_no').lt(1000)
        //                         , r.expr('ข.0')
        //                         , r.expr('ข.')
        //                     )
        //                 )
        //             ).add(m('exporter_no').coerceTo('string'))
        //             , null
        //         ),
        //         // trader_date_approve: m('trader_date_approve').split('T')(0),
        //         // trader_date_expire: m('trader_date_approve').split('T')(0).split('-')(0).add("-12-31"),
        //         // trader_active: r.now().toISO8601().lt(m('trader_date_approve').split('T')(0).split('-')(0).add("-12-31T00:00:00.000Z"))
        //         //r.time(m('trader_date_approve').split('T')(0).split('-')(0).coerceTo('number'), r.december, 31, 0, 0, 0, '+07:00').toISO8601()
        //     }
        // })
        // .merge(function (m) {
        //     return {
        //         // trader_active_name: r.branch(m('trader_active').eq(true), 'ปกติ', 'หมดอายุ'),
        //         export_status_name: r.branch(m('export_status').eq(null), null, m('export_status').eq(true), 'ปกติ', 'หมดอายุ')
        //     }
        // })
        // .without('id')
        // // .eqJoin("seller_id", r.db('external').table("seller")).without({ right: ["id", "date_created", "date_updated", "creater", "updater"] }).zip()
        // // .eqJoin("type_lic_id", r.db('external').table("type_license")).without({ right: ["id", "date_created", "date_updated", "creater", "updater"] }).zip()
        // // .eqJoin("country_id", r.db('common').table("country")).without({ right: ["id", "date_created", "date_updated", "creater", "updater"] }).zip()
        // .filter({ company_id: params.company_id })
        // .orderBy('exporter_no')(0)
        .run()
        .then(function (result) {
            // res.json(result);
            res.ireport("exporter/exporter_detail.jasper", "pdf", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.approve_general_1 = function (req, res) {
    var r = req.r;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10)
    };
    r.db('external').table('confirm_exporter').getAll(req.params.id, { index: 'id' })
        .merge(function (m) {
            return {
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no'), r.expr('ข.').add(m('exporter_no').coerceTo('string'))
                    , null),
                approve_status_name: r.branch(m('approve_status').eq('request'), 'ตรวจสอบเอกสาร', m('approve_status').eq('process'), 'รออนุมัติ', m('approve_status').eq('approve'), 'อนุมัติ', 'รอส่งเอกสารใหม่'),
                date_created: m('date_created').toISO8601().split('T')(0)
            }
        })
        .eqJoin('type_lic_id', r.db('external').table('type_license')).pluck("left", { right: "type_lic_name" }).zip()
        .eqJoin("company_id", r.db('external').table("company")).without({ right: 'id' }).zip()
        // .merge({ date_created: r.row('date_created').split('T')(0) })
        // .orderBy('exporter_no')
        // .filter(function (c) {
        //     return c('approve_status').ne('approve').and(c('approve_status').ne('reject'))
        // })
        // .filter({approve_status_name:'รออนุมัติ'})
        // .filter(function (row) {
        //     return row("type_lic_id").eq(req.query.type_lic_id)
        // })   

        .run()
        .then(function (result) {
            // res.json(result);
            res.ireport("exporter/approve_general_1.jasper", req.query.export || "word", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.approve_general_2 = function (req, res) {
    var r = req.r;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10)
    };
    r.db('external').table('confirm_exporter').getAll(req.params.id, { index: 'id' })
        .merge(function (m) {
            return {
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no'), r.expr('ข.').add(m('exporter_no').coerceTo('string'))
                    , null),
                approve_status_name: r.branch(m('approve_status').eq('request'), 'ตรวจสอบเอกสาร', m('approve_status').eq('process'), 'รออนุมัติ', m('approve_status').eq('approve'), 'อนุมัติ', 'รอส่งเอกสารใหม่'),
                date_created: m('date_created').toISO8601().split('T')(0)
            }
        })
        .eqJoin('type_lic_id', r.db('external').table('type_license')).pluck("left", { right: "type_lic_name" }).zip()
        .eqJoin("company_id", r.db('external').table("company")).without({ right: 'id' }).zip()
        // .eqJoin("company_id", r.db('external').table("company")).without({ right: 'id' }).zip()
        // .merge({ date_created: r.row('date_created').split('T')(0) })
        // .orderBy('exporter_no')
        // .filter(function (c) {
        //     return c('approve_status').ne('approve').and(c('approve_status').ne('reject'))
        // })
        // .filter({ approve_status_name: 'รออนุมัติ' })
        // .eqJoin('type_lic_id', r.db('external').table('type_license')).pluck("left", { right: "type_lic_name" }).zip()
        // .filter(function (row) {
        //     return row("type_lic_id").eq(req.query.type_lic_id)
        // })
        .run()
        .then(function (result) {
            // res.json(result);
            res.ireport("exporter/approve_general_2.jasper", req.query.export || "word", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.approve_changtype = function (req, res) {
    var r = req.r;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10)
    };
    r.db('external').table('exporter')
        .eqJoin('type_lic_id', r.db('external').table('type_license')).without({ right: 'id' }).zip()
        .merge(function (m) {
            return {
                type_lice_name_old: m('type_lic_name'),
                type_lice_id_old: m('type_lic_id')
            }
        })
        .eqJoin('confirm_id', r.db('external').table('confirm_exporter'))//.getAll(req.params.id, {index: 'id'})
        .without([{ left: ['type_lic_name', 'type_lic_id'] }]).zip()
        .eqJoin('type_lic_id', r.db('external').table('type_license')).without({ right: 'id' }).zip()
        .merge(function (m) {
            return {
                type_lice_name_new: m('type_lic_name'),
                type_lice_id_new: m('type_lic_id')
            }
        }).without('type_lic_name', 'type_lic_fullname')
        .eqJoin("company_id", r.db('external').table("company")).without({ right: 'id' }).zip()
        .merge(function (m) {
            return {
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no'), r.expr('ข.').add(m('exporter_no').coerceTo('string'))
                    , null),
                approve_status_name: r.branch(m('approve_status').eq('request'), 'ตรวจสอบเอกสาร', m('approve_status').eq('process'), 'รออนุมัติ', m('approve_status').eq('approve'), 'อนุมัติ', 'รอส่งเอกสารใหม่'),
                date_created: m('date_created').toISO8601().split('T')(0)
            }
        })
        .filter(function (row) {
            return row("id").eq(req.params.id)
        })
        .run()
        .then(function (result) {
            // res.json(result);
            res.ireport("exporter/approve_changtype.jasper", req.query.export || "word", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.approve_renew_1 = function (req, res) {
    var r = req.r;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10)
    };
    r.db('external').table('exporter')
        .merge(function (m) {
            return {
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no'), r.expr('ข.').add(m('exporter_no').coerceTo('string'))
                    , null),
                approve_status_name: r.branch(m('approve_status').eq('request'), 'ตรวจสอบเอกสาร', m('approve_status').eq('process'), 'รออนุมัติ', m('approve_status').eq('approve'), 'อนุมัติ', 'รอส่งเอกสารใหม่')
            }
        })
        .filter(function (row) {
            return row("id").eq(req.params.id)
        })
        .eqJoin('confirm_id', r.db('external').table('confirm_exporter')).pluck("right", { left: "exporter_date_approve" }).zip()//.getAll(req.params.id, {index: 'id'})
        .eqJoin('type_lic_id', r.db('external').table('type_license')).pluck("left", { right: "type_lic_name" }).zip()
        .eqJoin("company_id", r.db('external').table("company")).without({ right: 'id' }).zip()
        .run()
        .then(function (result) {
            // res.json(result);
            res.ireport("exporter/approve_renew_1.jasper", req.query.export || "word", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.approve_renew_2 = function (req, res) {
    var r = req.r;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10)
    };
    r.db('external').table('exporter')
        .merge(function (m) {
            return {
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no'), r.expr('ข.').add(m('exporter_no').coerceTo('string'))
                    , null),
                approve_status_name: r.branch(m('approve_status').eq('request'), 'ตรวจสอบเอกสาร', m('approve_status').eq('process'), 'รออนุมัติ', m('approve_status').eq('approve'), 'อนุมัติ', 'รอส่งเอกสารใหม่')
            }
        })
        .filter(function (row) {
            return row("id").eq(req.params.id)
        })
        .eqJoin('confirm_id', r.db('external').table('confirm_exporter')).pluck("right", { left: "exporter_date_approve" }).zip()//.getAll(req.params.id, {index: 'id'})
        .eqJoin('type_lic_id', r.db('external').table('type_license')).pluck("left", { right: "type_lic_name" }).zip()
        .eqJoin("company_id", r.db('external').table("company")).without({ right: 'id' }).zip()
        .run()
        .then(function (result) {
            res.json(result);
            // res.ireport("exporter/approve_renew_2.jasper", req.query.export || "word", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}

