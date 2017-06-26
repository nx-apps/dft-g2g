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
exports.insert = function (req, res) {
    var r = req.r;
    var result = { result: false, message: null, id: null };
    insertShip(req.body, function (ship) {
        req.body.ship = ship;
        var valid = req.ajv.validate('g2g.book', req.body);
        if (valid) {
            var obj = Object.assign(req.body, {
                date_created: r.now().inTimezone('+07'),
                date_updated: r.now().inTimezone('+07'),
                creater: 'admin',
                updater: 'admin',
                invoice_status: false
            });
            r.table("book")
                .insert(obj)
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
    });
}
exports.update = function (req, res) {
    var r = req.r;
    var result = { result: false, message: null, id: null };
    if (req.body.book_status == "approve" || typeof req.body.bl_no === 'undefined') {
        updateBook(req, res, result);
    } else {
        insertShip(req.body, req, res, function (ship, req, res) {
            req.body.ship = ship;
            updateBook(req, res, result);
        });
    }
}
exports.delete = function (req, res) {
    var r = req.r;
    var result = { result: false, message: null, id: null };
    if (req.params.id != '' || req.params.id != null) {
        result.id = req.params.id;
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
function updateBook(req, res, result) {
    if (req.body.id != '' && req.body.id != null && typeof req.body.id !== 'undefined') {
        result.id = req.body.id;
        var valid = req.ajv.validate('g2g.book', req.body);
        if (valid) {
            var obj = Object.assign(req.body, {
                date_updated: r.now().inTimezone('+07'),
                updater: 'admin'
            });
            r.table("book")
                .get(req.body.id)
                .update(obj)
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
            result.message = req.ajv.errorsText()
            res.json(result);
        }
    } else {
        result.message = 'require field id';
        res.json(result);
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
    var result = { result: false, message: null, id: null };
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
exports.updateDetail = function (req, res) {
    var valid = req.ajv.validate('g2g.book_detail', req.body);
    var r = req.r;
    var result = { result: false, message: null, id: null };
    if (req.body.id != '' && req.body.id != null && typeof req.body.id != 'undefined') {
        result.id = req.body.id;
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
            result.message = req.ajv.errorsText()
            res.json(result);
        }
    } else {
        result.message = 'require field id';
        res.json(result);
    }
}
exports.deleteDetail = function (req, res) {
    var r = req.r;
    var result = { result: false, message: null, id: null };
    if (req.params.id != '' || req.params.id != null) {
        result.id = req.params.id;
        var q = r.table("book_detail").get(req.params.id).do(function (result) {
            return r.branch(
                r.table('book').get(result('book_id')).getField('book_status').eq(false)
                , r.table("book_detail").get(req.params.id).delete()
                , r.expr("Can't delete because this status = true.")
            )
        })
        q.run()
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