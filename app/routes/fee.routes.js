module.exports = function (app) {
    var controller = require('../controllers/fee.controller');
    app.route('/calc').get(controller.calc).post(controller.calc);
    app.post('/insert', controller.insert);
    app.get('/contract', controller.getByContractId);
    app.get('', controller.getById);
    app.put('/update', controller.update);
    app.delete('/delete/:id', controller.delete);
    app.put('/approve', controller.approve);
    // app.get('/shm/id/:shm_id', controller.getByShmID);

    // app.get('/invoice/id/:invoice_id', controller.getByInvoiceId);
    // app.get('/approve/id/:fee_id', controller.approve);
    // app.get('/payment/contract/id/:contract_id', controller.getPayByContractId);

    // app.put('/update', controller.update);
    // app.delete('/delete/id/:id', controller.delete);
}