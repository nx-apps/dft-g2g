module.exports = function (app) {
    var controller = require('../../controllers/g2g/payment_detail.controller');

    app.put('/update', controller.update);
}