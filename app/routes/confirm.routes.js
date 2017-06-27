module.exports = function (app) {
    var controller = require('../controllers/confirm.controller');
    app.get('/contract', controller.getByContractId);
    app.get('/', controller.getById);
    app.get('/exporter', controller.getExporter)
    app.get('/fp',controller.getFP);
    app.post('/insert', controller.insert);
    app.put('/update', controller.update);
    app.delete('/delete/:id', controller.delete);
}