module.exports = function (app) {
    var controller = require('../controllers/invoice.controller');
    app.get('/contract', controller.getByContractId);
    app.get('/book', controller.getByBookId);
    app.get('/madeout', controller.getMadeOut);
    // app.get('/id/:invoice_id', controller.getById);

    app.put('/update', controller.update);
    app.delete('/reject/:id', controller.reject);
    // app.delete('/delete/id/:id', controller.delete);
}