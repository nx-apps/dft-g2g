module.exports = function (app) {
    var controller = require('../../controllers/g2g/book.controller');
    app.get('/contract/id/:contract_id', controller.getByContractId);
    app.get('/shipment/id/:shm_id', controller.getByShmId);
    app.get('/id/:book_id', controller.getById);

    app.post('/insert', controller.insert);
    app.put('/update', controller.update);
    app.delete('/delete/id/:id', controller.delete);
}