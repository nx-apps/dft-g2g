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
        .run()
        .then(function (data) {
            res.json(data)
        })
}
