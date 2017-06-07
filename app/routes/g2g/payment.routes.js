module.exports = function (app) {
    var controller = require('../../controllers/g2g/payment.controller');
    app.get('/noti/contract/id/:contract_id',controller.getNotiByContractId);
    app.get('/contract/id/:contract_id', controller.getByContractId);
    app.get('/fee/id/:fee_id', controller.getByFeeId);
    app.get('/silo', controller.getSilo);
    app.get('/checkno/buyer/id/:buyer_id',controller.getCheckNoByBuyerId);
    app.post('/insert', controller.insert);
    app.put('/update', controller.update);
}