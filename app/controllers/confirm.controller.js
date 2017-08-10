exports.getByContractId = function (req, res) {
    var r = req.r;
    var table = r.table("confirm_letter");
    var query;
    if (req.query.status == 'all') {
        query = table.getAll(req.query.contract_id, { index: "contract_id" });
    } else {
        var status = true;
        if (req.query.status == 'false') status = false;
        query = table.getAll([req.query.contract_id, status], { index: "contractClStatus" });
    }

    if (typeof req.query.exporter_id === 'undefined') {
        query = query.map(function (cl) {
            var book = r.table('book').getAll(cl('id'), { index: 'cl_id' }).count();
            var detail = r.table('book_detail').getAll(cl('id'), { index: 'cl_id' }).sum('net_weight');
            return cl.pluck('id', 'cl_no', 'cl_status', 'cl_weight', 'contract_id', 'contract_no', 'buyer_id')
                .merge({
                    book_weight: detail,
                    cl_weight_balance: cl('cl_weight').sub(detail),
                    count_ship: book
                })
        });
    } else {
        query = query.map(function (cl) {
            var detail = r.table('book_detail').getAll([cl('id'), req.query.exporter_id], { index: 'clExporter' });
            return cl.pluck('id', 'cl_no', 'cl_status', 'cl_weight', 'contract_id', 'contract_no', 'buyer_id')
                .merge({
                    book_weight: detail.sum('net_weight'),
                    count_ship: detail.group('book_id').ungroup().count()
                })
        });
    }
    query.orderBy(r.desc('cl_no'))
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.getHmByContract = function (req, res) {
    req.r.table('contract')
        .get(req.query.contract_id)
        .getField('contract_hamonize')
        .merge(function (m) {
            return {
                hamonize: r.db('common').table('hamonize')
                    .get(m('hamonize_id'))
                    .without('creater', 'updater', 'date_created', 'date_updated')
            }
        })
        .run()
        .then(function (data) {
            res.json(data);
        })
}
exports.getById = function (req, res) {
    var r = req.r;
    r.table("confirm_letter")
        .get(req.query.id)
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.getExporter = function (req, res) {
    var r = req.r;
    r.table('book_detail')
        .getAll(req.query.contract_id, { index: 'contract_id' })
        .group('exporter_id')
        .nth(0)
        .ungroup()
        .map(function (m) {
            return m.getField('reduction')
                .pluck({ 'company': ['company_name_th', 'company_taxno'] }, 'exporter_no')
                .merge({
                    exporter_id: m('group')
                })
        })
        .orderBy('exporter_no')
        .run()
        .then(function (result) {
            res.json(result);
        })
}
exports.getFP = function (req, res) {
    var j = req.jdbc;
    j.query("mssql", `
        select
            oldPrice as fp4,
            oldNewPrice as fp3,
            newPrice as fp2
        from fn_rice_price_avg(?,?) price
        left join dft_lk_type lkt on lkt.Id = price.riceTypeId
        where lkt.hamonize_code = ?
     `, [
            req.query.startDate,
            req.query.endDate,
            req.query.hmcode
        ],
        function (err, data) {
            data = JSON.parse(data);
            if (data.length == 0) {
                data = [{
                    fp2: 0, fp3: 0, fp4: 0
                }];
            }
            res.json(data)
            // res.json(data)
        })
}
exports.insert = function (req, res) {
    var valid = req.ajv.validate('g2g.confirm_letter', req.body);
    var r = req.r;
    if (valid) {
        var obj = Object.assign(req.body, {
            date_created: r.now().inTimezone('+07'),
            date_updated: r.now().inTimezone('+07'),
            creater: 'admin',
            updater: 'admin',
            cl_date: r.ISO8601(req.body.cl_date).inTimezone('+07')
        });
        r.table("confirm_letter")
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
exports.update = function (req, res) {
    var valid = req.ajv.validate('g2g.confirm_letter', req.body);
    var r = req.r;
    if (req.body.id != '' && req.body.id != null && typeof req.body.id != 'undefined') {
        if (valid) {
            var obj = Object.assign(req.body, {
                date_updated: r.now().inTimezone('+07'),
                updater: 'admin'
            });
            if (typeof req.body.cl_date !== "undefined") {
                obj = Object.assign(obj, {
                    cl_date: r.ISO8601(req.body.cl_date).inTimezone('+07')
                });
            }
            r.table("confirm_letter")
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
exports.delete = function (req, res) {
    var r = req.r;
    if (req.params.id != '' || req.params.id != null) {
        var q = r.table("confirm_letter").get(req.params.id).do(function (result) {
            return r.branch(
                result('cl_status').eq(false)
                , r.table("confirm_letter").get(req.params.id).delete()
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