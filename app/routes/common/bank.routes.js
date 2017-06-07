module.exports = function (app) {
    var controller = require('../../controllers/common/bank.controller');
    app.get(['/', '/list'], controller.list);
    app.get('/id/:bank_id', controller.getById);
    app.post('/insert', controller.insert);
    app.put('/update', controller.update);
    app.delete('/delete/id/:id', controller.delete);
}