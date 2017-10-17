exports.read = function (req, res) {
    //Read file here.
    var XLSX = require('xlsx');
    var workbook = XLSX.readFile('../dft-g2g/files/g2g.xlsx');

    var file = workbook.Sheets;
    var data = {};
    var temp = { db: "", col: [], maxCol: "" };
    var keyIndex = 1; //num row has field_key
    var row = {};
    for (var sheet in file) {
        for (var key in file[sheet]) {
            if (key !== '!ref' && key !== '!margins' && key !== '!autofilter') {
                if (str2NumOnly(key) == keyIndex) {
                    temp.col[str2CharOnly(key)] = file[sheet][key].v;
                    temp.maxCol = str2CharOnly(key);
                } else {
                    if (temp.col[str2CharOnly(key)].indexOf("date") > -1) {
                        // console.log('column ' + str2CharOnly(key));
                        // console.log(file[sheet][key]);
                        if (file[sheet][key].t == 'n') {
                            var dateArr = file[sheet][key].w.split('/');

                            row[temp.col[str2CharOnly(key)]] = req.r.ISO8601(
                                '20' + dateArr[2] + '-'
                                + (Number(dateArr[0]) < 10 ? '0' + dateArr[0] : dateArr[0]) + '-'
                                + (Number(dateArr[1]) < 10 ? '0' + dateArr[1] : dateArr[1])
                                + "T00:00:00+07:00"
                            );
                            // console.log(
                            //     '20' + dateArr[2] + '-'
                            //     + (Number(dateArr[0]) < 10 ? '0' + dateArr[0] : dateArr[0]) + '-'
                            //     + (Number(dateArr[1]) < 10 ? '0' + dateArr[1] : dateArr[1])
                            //     + "T00:00:00+07:00")
                        } else {
                            row[temp.col[str2CharOnly(key)]] = req.r.ISO8601(file[sheet][key].w + "T00:00:00+07:00");
                            // console.log(file[sheet][key].w)
                        }
                    } else {
                        row[temp.col[str2CharOnly(key)]] = file[sheet][key].v;
                    }
                    if (str2CharOnly(key) == temp.maxCol) {
                        data[temp.db].push(row);
                        row = {};
                    }
                }

            } else {
                temp.col = [];
                temp.db = sheet;
                if (!data.hasOwnProperty(sheet)) {
                    data[sheet] = [];
                }
            }
        }
    }
    var dataSheet = [];
    for (table in data) {
        dataSheet.push({ table: table, data: data[table] });
    }

    // res.json(dataSheet);
    var r = req.r;
    r.expr(dataSheet)
        .forEach(function (row) {
            return r.db('g2g_raw').tableList().contains(row('table'))
                .do(function (tbExists) {
                    return r.branch(tbExists,
                        r.db('g2g_raw').table(row('table')).delete(),
                        r.db('g2g_raw').tableCreate(row('table'))
                    ).do(function (tbInsert) {
                        return r.db('g2g_raw').table(row('table')).insert(row('data'))
                    })
                })
        })
        .run()
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            res.status(500).json(err);
        })

}
function str2NumOnly(string) { //input AB123  => output 123
    let t = [];
    for (let i = 0; i < string.length; i++) {
        if ((string[i].charCodeAt(0) >= 48) && (string[i].charCodeAt(0) <= 57)) {
            t.push(string[i].charCodeAt(0));
        }
    }
    return String.fromCharCode(t);
}
function str2CharOnly(string) { //input AB123  => output AB
    let t = [];
    for (let i = 0; i < string.length; i++) {
        if ((string[i].charCodeAt(0) >= 65) && (string[i].charCodeAt(0) <= 90)) {
            t.push(string[i].charCodeAt(0));
        }
    }
    return String.fromCharCode.apply(String, t);
}
