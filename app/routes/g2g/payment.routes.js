module.exports = function (app) {
    var controller = require('../../controllers/g2g/payment.controller');
    app.get('/contract/id/:contract_id', controller.getByContractId);
    app.get('/fee/id/:fee_id', controller.getByFeeId);
    app.get('/silo', controller.getSilo);

    app.post('/insert', controller.insert);
    app.put('/update', controller.update);
}