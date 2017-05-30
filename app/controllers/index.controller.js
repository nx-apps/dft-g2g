exports.index = function (req, res) {
    res.sendfile('./public/index.html');
}
exports.db = function (req, res) {
    req.logger.info("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
    req.jdbc.query("mysql", "SELECT *  FROM  vet_ages", [], function (err, data) {
        console.log(data);
    });



    var u = {
        id: 1333
    };

    if (!req.user) {
        var user = {
            id: 1234,
            name: "somchit",
            email: "somchit.c@nexts-corp.com"
        };

        req.login(user, function (err) {

        });


    } else {
        console.log('is loged');
    }

    console.log(req.ajv);
    var valid = req.ajv.validate('user', u);
    if (!valid) console.log(req.ajv.errorsText());

    req.r.table('session').coerceTo('array').run().then(function (result) {
        console.log(result);
        res.json(result);

    });



}
exports.render = function (req, res) {
    console.log(req.user);
    res.render('index', {
        'title': "Hello",
        'message': "somchit",
        'uname': "somchit@gm.com"
    });
}

exports.report = function (req, res) {
    //var iReport=req._jvm.import("nylon.report.iReport");
    var datas = [
        {
            name: "somchit",
            surname: "chanudom",
            address: "5/424",
            subject: [{
                name: "test",
                title: "xxxx"
            }],
            exports: [
                "a", "b", "c"
            ]
        },
        {
            name: "somchit",
            surname: "chanudom",
            address: "5/424",
            subject: [{
                name: "test",
                title: "xxxx"
            }]
            ,
            exports: [
                "a", "b", "c"
            ]
        }, {
            name: "somchit",
            surname: "chanudom",
            address: "5/424",
            subject: [{
                name: "test",
                title: "xxxx"
            }]
            ,
            exports: [
                "a", "b", "c"
            ]
        }
    ];
    // for(var i=0;i<1000;i++){
    //  datas[i]= {
    //    name:"somchit",
    //    surname:"chanudom",
    //     address:"5/424"
    // };
    //  }
    var parameters = {

        department: "it"
    };

    var type = req.param("type");
    console.log(type);
    res.ireport("report1.jasper", type, datas, parameters);






    //  var reportname=path.join(path.dirname(fs.realpathSync(__filename)), '../report/report1.jasper');
    // var rp=new iReport();
    // rp.export(reportname,"pdf",JSON.stringify(data),JSON.stringify(parameter),
    //   function(err,buff){
    //   res._responsePDF(buff);
    // var buffer= Buffer.from(buff, "hex");
    // var bufferStream = new stream.PassThrough();
    // bufferStream.end( buffer );
    // res.setHeader('Content-Length', buffer.length);
    //  res.setHeader('Content-Type', 'application/ms-word');
    //     res.setHeader('Content-Disposition', 'attachment; filename=quote.docx');
    // bufferStream.pipe(res);

    // }
    //);



}

function toArrayBuffer(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}
exports.sql = function (req, res) {
    var async = require('async');
    var mssql = req.jdbc;
    var re = req.r;
    var commands = [];
    var parameters = "";
    //_callback(1,2,3,4,5,)
    var _callback = function (...args) {
        var p1 = args[0];
        var out = {
            "deleted": p1('deleted'),
            "errors": p1('errors'),
            "inserted": p1('inserted'),
            "replaced": p1('replaced'),
            "skipped": p1('skipped'),
            "unchanged": p1('unchanged')
        };
        for (var i = 1; i < args.length; i++) {
            out.deleted = out.deleted.add(args[i]('deleted'));
            out.errors = out.errors.add(args[i]('errors'));
            out.inserted = out.inserted.add(args[i]('inserted'));
            out.replaced = out.replaced.add(args[i]('replaced'));
            out.skipped = out.skipped.add(args[i]('skipped'));
            out.unchanged = out.unchanged.add(args[i]('unchanged'));
        }
        return out;
    }


    mssql.query("mssql", `
        select
            company_taxno,max(approve_date) as approve_date
        from f3
        where tran_type='E'
        group by company_taxno
    `, [], function (e, str_companys) {

            var companys = JSON.parse(str_companys);

            async.each(companys, function (company, next) {
                var cmd = re.db('external').table('company').getAll(company.company_taxno, { index: 'company_taxno' })
                    .update({
                        date_exported: r.epochTime(company.approve_date / 1000).inTimezone('+07:00')
                    });

                // .run()
                // .then(function (data_com) {
                // var index = ddd.map(function (e) { return e.company_taxno; }).indexOf(data_com[0].company_taxno);
                //    if (data_com.length > 0) {
                //   var cmd = re.db('external').table('company_bak').get(data_com[0].id).update({
                //    date_exported: r.epochTime(company.approve_date / 1000).inTimezone('+07:00')
                //  })
                commands.push(cmd);
                if (parameters == "") {
                    parameters = "p" + company.company_taxno;
                } else {
                    parameters = parameters + ",p" + company.company_taxno;
                }
                //      }
                next();

                // })
            }, function (err) {

                global.callback = 0;
                eval("callback=function(" + parameters + "){return _callback.apply(this,arguments);};");
                commands.push(callback);
                re.do.apply(this, commands)
                    .run()
                    .then(function (data) {
                        res.json(data);
                    })
            })


            /* var ddd = JSON.parse(ddd);
             var a = [];
             var count = 0;
             for (var i = 0; i < ddd.length; i++) {
                 re.db('external').table('company_bak').getAll(ddd[i]['company_taxno'], { index: 'company_taxno' })
                     .run()
                     .then(function (data_com) {
                         if (data_com.length > 0) {
                             var index = ddd.map(function (e) { return e.company_taxno; }).indexOf(data_com[0].company_taxno);
 
                             a.push(
                                 re.db('external').table('company_bak').get(data_com[0].id).update({
                                     date_exported: r.epochTime(ddd[index]['approve_date'] / 1000).inTimezone('+07:00')
                                 })
                             );
                         }
 
                     })
             }
             setTimeout(function () {
                 // res.json(a);
                 re.do.apply(this, a)
                     .run()
                     .then(function (data) {
                         res.json(data);
                     })
             }, 3000);*/
            // res.send("update company success!");
        })

}
exports.date = function (req, res) {
    var d = req.body;
    d.date_register = r.ISO8601(d.date_register).inTimezone('+07');
    var re = req.r;
    // res.json(d);

    re.db('external_f3').table('test')
        // .insert(d)
        .run()
        .then(function (data) {
            res.json(data);
        })
}
exports.company = function (req, res) {
    var r = req.r;
    req.jdbc.query('mssql', `SELECT [company_taxno]
      ,[company_name_th]
      ,[company_name_en]
      ,[company_address_th]
      ,[company_address_en]
      ,[company_province_th]
      ,[company_province_en]
      ,[company_phone]
      ,[company_fax]
      ,convert(nvarchar(10),[company_date],121)+'T00:00:00+07:00' as company_date
      ,[username]
      ,convert(nvarchar(10),[create_date],121)+'T00:00:00+07:00' as create_date
      ,convert(nvarchar(10),[update_date],121)+'T00:00:00+07:00' as update_date
	  from company_info `, [],
        function (err, data) {

            r.db('external').table('company').insert(r.json(data).merge(function (m) {
                return {
                    company_date: r.ISO8601(m('company_date')),
                    create_date: r.ISO8601(m('create_date')),
                    update_date: r.ISO8601(m('update_date'))
                }
            }))
                .run()
                .then(function (result) {
                    res.json(result);
                })
        })
}