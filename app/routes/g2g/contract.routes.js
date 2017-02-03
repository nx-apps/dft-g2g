module.exports = function (app) {
    var controller = require('../../controllers/g2g/contract.controller');
    app.get(['/', '/list'], controller.list);
    app.get('/id/:contract_id', controller.getById);

    app.post('/insert', controller.insert);
    app.put('/update', controller.update);
    app.delete('/delete/id/:id', controller.delete);
}