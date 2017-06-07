module.exports = function (app) {
    var controller = require('../../controllers/g2g/shipment.controller');

    app.get('/id/:shm_id', controller.getById);

    app.post('/insert', controller.insert);
    app.put('/update', controller.update);
    app.delete('/delete/id/:id', controller.delete);
}