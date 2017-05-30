module.exports = function (app) {

    var controller = require('../../controllers/external/company.controller');
    app.route('/').get(controller.list);
    app.route('/:id').get(controller.listId);
    app.route('/insert').post(controller.insert);
    app.route('/update').put(controller.update);
    app.route('/delete/id/:id').delete(controller.delete);
}