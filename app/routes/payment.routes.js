module.exports = function (app) {
    var controller = require('../controllers/payment.controller');
    app.get('/silo', controller.getSilo);
    app.get('/contract', controller.getByContractId);
    app.get('/company',controller.getByCompany);
    app.put('/update',controller.update);
}