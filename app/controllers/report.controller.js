const path = require('path');
const testFolder = path.join(__dirname, '../models');
const fs = require('fs');
exports.getTable = function (req, res) {
    fs.readdir(testFolder, (err, files) => {
        let arr = []
        let data_field = []
        files.map((item) => {
            let field = JSON.parse(fs.readFileSync(testFolder + '/' + item, 'utf8')).properties
            if (field === undefined)
                field = JSON.parse(fs.readFileSync(testFolder + '/' + item, 'utf8')).items.properties
            for (var key in field) {
                if (field.hasOwnProperty(key)) {
                    data_field.push({
                        field :  key
                    })
                }
            }
            arr.push({
                table_name: item.split('.')[0],
                fields: data_field
            })
            data_field = []

        })
        res.json(arr)
    })
}
exports.insert = function (req, res) {
    var r = req.r;
        var obj = Object.assign(req.body, {
            date_created: r.now().inTimezone('+07'),
            date_updated: r.now().inTimezone('+07'),
            creater: 'admin',
            updater: 'admin',
        });
        r.table("report")
            .insert(obj)
            .run()
            .then(function (response) {
                res.json(response);
            })
            .error(function (err) {
                res.json(err);
            })
}
exports.update = function (req, res) {
    var r = req.r;
        var obj = Object.assign(req.body, {
            date_updated: r.now().inTimezone('+07'),
            updater: 'admin',
        });
        r.table("report")
        .get(obj.id)
            .update(obj)
            .run()
            .then(function (response) {
                res.json(response);
            })
            .error(function (err) {
                res.json(err);
            })
}
exports.delete = function (req, res) {
    var r = req.r;
        r.table("report").get(req.params.id)
            .delete()
            .run()
            .then(function (response) {
                res.json(response);
            })
            .error(function (err) {
                res.json(err);
            })
}