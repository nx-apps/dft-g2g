module.exports = function (app) {
    var controller = require('../../controllers/g2g/confirm.controller');
    app.get('/contract/id/:contract_id', controller.getByContractId);
    app.get('/id/:cl_id', controller.getById);

    app.post('/insert', controller.insert);
    app.put('/update', controller.update);
    app.delete('/delete/id/:id', controller.delete);
}