module.exports = function (app) {
    var controller = require('../controllers/contract.controller');
    app.get('/list', controller.list);  //updated 2017-06-12
    app.get('/buyer', controller.buyerId);
    app.get('/', controller.getById);
    // app.post('/insert', controller.insert);
    // app.put('/update', controller.update);
    // app.delete('/delete/id/:id', controller.delete);
}