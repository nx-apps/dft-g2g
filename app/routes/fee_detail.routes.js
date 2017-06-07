module.exports = function (app) {
    var controller = require('../../controllers/g2g/fee_detail.controller');
    app.get('/id/:fee_det_id', controller.getById);
    app.post('/insert', controller.insert);
    app.put('/update', controller.update);
    app.delete('/delete/id/:id', controller.delete);
}