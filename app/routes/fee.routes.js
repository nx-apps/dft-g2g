module.exports = function (app) {
    var controller = require('../../controllers/g2g/fee.controller');
    app.get('/contract/id/:contract_id', controller.getByContractId);
    app.get('/confirm/id/:cl_id', controller.getByClID);
    app.get('/shm/id/:shm_id', controller.getByShmID);
    app.get('/id/:id', controller.getById);
    app.get('/invoice/id/:invoice_id', controller.getByInvoiceId);
    app.get('/approve/id/:fee_id', controller.approve);
    app.get('/payment/contract/id/:contract_id', controller.getPayByContractId);
    app.post('/insert', controller.insert);
    app.put('/update', controller.update);
    app.delete('/delete/id/:id', controller.delete);
}