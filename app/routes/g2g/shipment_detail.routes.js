module.exports = function (app) {
    var controller = require('../../controllers/g2g/shipment_detail.controller');
    app.get('/book/id/:book_id', controller.getByBookId);
    app.post('/insert', controller.insert);
    app.put('/update', controller.update);
    app.delete('/delete/id/:id', controller.delete);
}