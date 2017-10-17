module.exports = function (app) {
    var controller = require('../controllers/cheque.controller');
    app.get('/contract', controller.getByContractId);
    app.route('/fee').get(controller.getByFeeId).post(controller.getByFeeId);
    app.get('/no', controller.getChequeNo);
    app.put('/update', controller.update);
    app.put('/approve',controller.approve);
}