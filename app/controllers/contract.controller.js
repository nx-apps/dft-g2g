exports.list = function (req, res) {
    var r = req.r;
    r.table('contract')
        .group("buyer_id")
        .ungroup()
        .map(function (buyer_map) {
            var buyer = buyer_map('reduction')(0)('buyer');
            var country = buyer_map('reduction')(0)('country');
            return buyer, {
                buyer_id: buyer_map('group'),
                contract: buyer_map('reduction').orderBy(r.desc('contract_date')).limit(3)
                    .pluck('id', 'contract_date', 'contract_weight')
                    .map(function (contract_merge) {
                        return {
                            contract_weight: contract_merge('contract_weight'),
                            contract_year: contract_merge('contract_date').year(),
                            cl_weight: r.table('confirm_letter').getAll(contract_merge('id'), { index: 'contract_id' }).sum('cl_weight'),
                            book_weight: r.table('book_detail').getAll(contract_merge('id'), { index: 'contract_id' }).sum('book_det_weight'),
                            payment_weight: r.table('payment').getAll(contract_merge('id'), { index: 'contract_id' }).sum('pay_amount')
                        }
                    }),
                buyer_name: buyer('buyer_name'),
                country_name_en: country('country_name_en')
            }
        })
        .run()
        .then(function (data) {
            res.json(data);
        })
}
exports.buyerId = function (req, res) {
    var r = req.r;
    r.table("contract")
        .getAll(req.query.id, { index: 'buyer_id' })
        .map(function (m) {
            var cl_sum = r.table('confirm_letter').getAll(m('id'), { index: 'contract_id' }).sum('cl_weight');
            var book_sum = r.table('book_detail').getAll(m('id'), { index: 'contract_id' }).sum('book_det_weight');
            return m.pluck('contract_name')
                .merge({
                    contract_id: m('id'),
                    contract_weight_confirm: cl_sum,
                    contract_weight_confirm_balance: m('contract_weight').sub(cl_sum),
                    contract_weight_book: book_sum,
                    contract_weight_book_balance: m('contract_weight').sub(book_sum)
                })
        })
        .orderBy(r.desc('contract_date'))
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
    r.table("contract")
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
    var valid = req.ajv.validate('g2g.contract', req.body);
    var r = req.r;
    if (valid) {
        var obj = Object.assign(req.body, {
            date_created: r.now().inTimezone('+07'),
            date_updated: r.now().inTimezone('+07'),
            creater: 'admin',
            updater: 'admin',
            contract_date: r.ISO8601(req.body.contract_date).inTimezone('+07')
        });
        r.table("contract")
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
    var valid = req.ajv.validate('g2g.contract', req.body);
    var r = req.r;
    if (req.body.id != '' && req.body.id != null && typeof req.body.id !== 'undefined') {
        if (valid) {
            var obj = Object.assign(req.body, {
                date_updated: r.now().inTimezone('+07'),
                updater: 'admin',
                contract_date: r.ISO8601(req.body.contract_date).inTimezone('+07')
            });
            r.table("contract")
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
        res.json('require field id' );
    }
}
exports.delete = function (req, res) {
    var r = req.r;
    if (req.params.id != '' && req.params.id != null) {
        var q = r.table("contract").get(req.params.id).do(function (result) {
            return r.branch(
                result('contract_status').eq(false)
                , r.table("contract").get(req.params.id).delete()
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
        res.json('require field id' );
    }
}