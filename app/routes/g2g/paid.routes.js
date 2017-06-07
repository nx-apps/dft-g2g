module.exports = function (app) {
    var controller = require('../../controllers/g2g/paid.controller');
    app.get('/contract/id/:contract_id', controller.getByContractId);
  
}