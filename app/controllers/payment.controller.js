exports.getSilo = function (req, res) {
    req.jdbc.query("mssql",
        `  SELECT bk.Keyword as keyword,bk.Status as statusName,sum(p.tWeight) as weightAll 
         FROM ( 
         SELECT s.Keyword ,s.Status ,b.book_id 
         FROM  dft_lk_status s 
         INNER JOIN dft_booking b on b.status_id = s.Id 
         WHERE s.Keyword like ? AND s.Active like ? 
         GROUP BY  s.Keyword,s.Status,b.book_id 
         ) bk 
         INNER JOIN dft_product p on p.status = bk.book_id 
         GROUP BY  bk.Keyword,bk.Status `
        ,
        ["GG%", "R3%"],
        function (err, data) {
            res.send(data);
        });
}
exports.getByContractId = function (req, res) {
    r.table('payment').getAll([req.query.id, false], { index: 'contractPayStatus' })
        .group(r.row.pluck('company_taxno'))
        .ungroup()
        .map(function (m) {
            return m('group').merge(
                m('reduction')(0).pluck('company', 'exporter_id'),
                { cheque_count: m('reduction').count() }
            )
        })
        .run()
        .then(function (data) {
            res.json(data)
        })
}
exports.getByCompany = function (req, res) {
    r.table('payment').getAll([req.query.contract_id, req.query.company_taxno, false], { index: 'contractTaxIdPayStatus' })
        .pluck('id', 'pay_no', 'pay_year', 'pay_date', 'value_bal_b', 'value_tax_b', 'value_final_b', 'invoice_company_no', 'invoice_company_date')
        .run()
        .then(function (data) {
            res.json(data);
        })
}
exports.getPayRuning = function (req, res) {
    var run = r.table('payment').getAll(r.now().inTimezone('+07').year(), { index: 'yearPayDate' })
        .filter(function (f) {
            return f.hasFields('pay_runing')
        });

    r.expr({
        pay_runing: r.branch(run.count().eq(0), 1, run.max('pay_runing')('pay_runing').add(1))
    }).run().then(function (data) {
        res.json(data)
    })
}
exports.update = function (req, res) {
    var valid = req.ajv.validate('g2g.payment_array', req.body);
    if (valid) {
        // r.expr(req.body)
        //     .forEach(function (fe) {
        //         var paid_date = r.ISO8601(fe('paid_date')).inTimezone('+07');
        //         return r.branch(fe.hasFields('pay_date'),
        //             tb.update({ pay_date: pay_date, pay_year: pay_date.year().add(543) }),
        //             tb.update({ cheque_status: false, pay_no: r.literal(), deliver_date: r.literal() })
        //         )
        //     })
        //     .run().then(function (data) {
        //         res.json(data)
        //     })
    } else {
        res.json(req.ajv.errorsText());
    }
}