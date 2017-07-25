module.exports = function (app) {
    var controller = require('../controllers/report.controller');
    //bl
    app.get('/table', controller.getTable);
    app.post('/insert', controller.insert);
    app.put('/update', controller.update);
    app.delete('/delete/:id', controller.delete);

}