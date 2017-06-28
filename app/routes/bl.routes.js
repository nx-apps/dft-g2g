module.exports = function (app) {
    var controller = require('../controllers/bl.controller');
    //bl
    app.get('/contract', controller.getByContractId);
}