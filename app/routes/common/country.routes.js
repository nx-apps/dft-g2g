module.exports = function (app) {
    var controller = require('../../controllers/common/country.controller');
    app.get(['/', '/list'], controller.list);
    app.get('/id/:id', controller.getById);
    app.get('/port', controller.ports)
    app.post('/insert', controller.insert);
    app.put('/update', controller.update);
    app.delete('/delete/id/:id', controller.delete);
}