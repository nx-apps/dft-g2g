var async = require('async');
exports.getByClId = function (req, res) {
    var r = req.r;
    r.table('book')
        .getAll(req.query.cl_id, { index: 'cl_id' })
        .pluck('id', 'ship_lot', { 'dest_port': ['country_name_en', 'port_name'] }, { 'deli_port': ['country_name_en', 'port_name'] })
        .orderBy(r.desc('ship_lot'))
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.getById = function (req, res) {
    var r = req.r;
    r.table('book')
        .get(req.query.id)
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.getHamonize = function (req, res) {
    req.r.table('confirm_letter').get(req.query.cl_id).getField('cl_hamonize')
        .run()
        .then(function (data) {
            res.json(data)
        })
}
exports.insert = function (req, res) {
    var r = req.r;
    insertShip(req.body, req, res, function (ship, req, res) {
        req.body.ship = ship;
        var valid = req.ajv.validate('g2g.book', req.body);
        if (valid) {
            var obj = Object.assign(req.body, {
                date_created: r.now().inTimezone('+07'),
                date_updated: r.now().inTimezone('+07'),
                creater: 'admin',
                updater: 'admin',
                invoice_status: false,
                cut_date: r.ISO8601(req.body.cut_date).inTimezone('+07'),
                eta_date: r.ISO8601(req.body.eta_date).inTimezone('+07'),
                etd_date: r.ISO8601(req.body.etd_date).inTimezone('+07'),
                packing_date: r.ISO8601(req.body.packing_date).inTimezone('+07'),
                product_date: r.ISO8601(req.body.product_date).inTimezone('+07')
            });
            r.table("book")
                .insert(obj)
                .run()
                .then(function (response) {
                    res.json(response);
                })
                .error(function (err) {
                    res.json(err);
                })
        } else {
            res.json(req.ajv.errorsText());
        }
    });
}
exports.update = function (req, res) {
    var r = req.r;
    // if (req.body.book_status == "approve" || typeof req.body.bl_no === 'undefined') {
    //     updateBook(req, res);
    // } else {
    insertShip(req.body, req, res, function (ship, req, res) {
        req.body.ship = ship;
        updateBook(req, res);
    });
    // }
}
exports.delete = function (req, res) {
    var r = req.r;
    if (req.params.id != '' || req.params.id != null) {
        var q = r.table("book").get(req.params.id).do(function (result) {
            return r.branch(
                result('book_status').eq(false)
                , r.table('book_detail').getAll(req.params.id, { index: 'book_id' }).delete()
                    .do(delete_do => {
                        return r.table('book').get(req.params.id).delete()
                    })
                , r.expr("Can't delete because this status = true.")
            )
        })
        q.run()
            .then(function (response) {
                res.json(response);
            })
            .error(function (err) {
                res.json(err);
            })
    } else {
        res.json('require field id');
    }
}
exports.approve = function (req, res) {
    req.r.table('book').get(req.body.id).pluck('id')
        .merge(function (m) {
            var detail = r.table('book_detail').getAll(m('id'), { index: 'book_id' });
            return {
                net_weight: detail.sum('net_weight'),
                gross_weight: detail.sum('gross_weight'),
                tare_weight: detail.sum('tare_weight'),
                value_d: detail.sum('value_d'),
                package_amount: detail.sum('package_amount'),
                book_status: req.body.book_status
            }
        })
        .do(function (d) {
            return r.table('book').get(d('id')).update(d)
        })
        .run()
        .then(function (data) {
            res.json(data);
        })
}
function insertShip(datas, req, res, cb) {
    var ship = [];
    async.waterfall([
        function (callback) {
            async.eachSeries(datas.ship, function (i, next) {
                if (!i.hasOwnProperty('ship_id')) {
                    r.db('common').table('ship').insert({
                        ship_name: i.ship_name,
                        date_created: r.now().inTimezone('+07'),
                        date_updated: r.now().inTimezone('+07')
                    })
                        .run()
                        .then(function (data) {
                            ship.push({
                                ship_id: data.generated_keys[0],
                                ship_voy: i.ship_voy,
                                ship_name: i.ship_name
                            });
                            next();
                        })
                } else {
                    ship.push(i);
                    next();
                }
            }, function (err) {
                if (!err) {
                    callback(null, ship);
                }
            });
        }
    ], function (err, ship) {
        cb(ship, req, res);
    });
}
function updateBook(req, res) {
    if (req.body.id != '' && req.body.id != null && typeof req.body.id !== 'undefined') {
        var valid = req.ajv.validate('g2g.book', req.body);
        if (valid) {
            var obj = Object.assign(req.body, {
                date_updated: r.now().inTimezone('+07'),
                updater: 'admin',
                cut_date: r.ISO8601(req.body.cut_date).inTimezone('+07'),
                eta_date: r.ISO8601(req.body.eta_date).inTimezone('+07'),
                etd_date: r.ISO8601(req.body.etd_date).inTimezone('+07'),
                packing_date: r.ISO8601(req.body.packing_date).inTimezone('+07'),
                product_date: r.ISO8601(req.body.product_date).inTimezone('+07')
            });
            r.table("book")
                .get(req.body.id)
                .update(obj)
                .run()
                .then(function (response) {
                    res.json(response);
                })
                .error(function (err) {
                    res.json(err);
                })
        } else {
            res.json(req.ajv.errorsText());
        }
    } else {
        res.json('require field id');
    }
}
exports.listDetail = function (req, res) {
    req.r.expr({
        detail: r.table('book_detail')
            .getAll(req.query.book_id, { index: 'book_id' })
            .orderBy('date_created')
            .pluck('id', 'book_det_weight', { 'package': 'package_kg_per_bag' }, { 'company': 'company_name_th' }, { 'hamonize': 'hamonize_en' })
        // .coerceTo('array')
    }).merge(function (m) {
        return r.table('book').get(req.query.book_id).pluck('book_status', 'invoice_status', 'id')
    })
        .run()
        .then(function (data) {
            res.json(data);
        })
}
exports.getDetailById = function (req, res) {
    req.r.table('book_detail')
        .get(req.query.id)
        .run()
        .then(function (data) {
            res.json(data);
        })
}
exports.insertDetail = function (req, res) {
    var valid = req.ajv.validate('g2g.book_detail', req.body);
    var r = req.r;
    if (valid) {
        var obj = Object.assign(req.body, {
            date_created: r.now().inTimezone('+07'),
            date_updated: r.now().inTimezone('+07'),
            creater: 'admin',
            updater: 'admin'
        });
        r.table("book_detail")
            .insert(obj)
            .run()
            .then(function (response) {
                res.json(response);
            })
            .error(function (err) {
                res.json(err);
            })
    } else {
        res.json(req.ajv.errorsText());
    }
}
exports.updateDetail = function (req, res) {
    var valid = req.ajv.validate('g2g.book_detail', req.body);
    var r = req.r;
    if (req.body.id != '' && req.body.id != null && typeof req.body.id != 'undefined') {
        if (valid) {
            var obj = Object.assign(req.body, {
                date_updated: r.now().inTimezone('+07'),
                updater: 'admin'
            });
            r.table("book_detail")
                .get(req.body.id)
                .update(obj)
                .run()
                .then(function (response) {
                    res.json(response);
                })
                .error(function (err) {
                    res.json(err);
                })
        } else {
            res.json(req.ajv.errorsText());
        }
    } else {
        res.json('require field id');
    }
}
exports.deleteDetail = function (req, res) {
    var r = req.r;
    if (req.params.id != '' || req.params.id != null) {
        var q = r.table("book_detail").get(req.params.id).do(function (result) {
            return r.branch(
                r.table('book').get(result('book_id')).getField('book_status').eq(false)
                , r.table("book_detail").get(req.params.id).delete()
                , r.expr("Can't delete because this status = true.")
            )
        })
        q.run()
            .then(function (response) {
                res.json(response);
            })
            .error(function (err) {
                res.json(err);
            })
    } else {
        res.json('require field id');
    }
}
