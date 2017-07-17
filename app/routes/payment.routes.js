module.exports = function (app) {
    var controller = require('../controllers/payment.controller');
    app.get('/contract', controller.getByContractId);
    app.get('/silo', controller.getSilo);
}