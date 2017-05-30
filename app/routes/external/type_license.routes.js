module.exports = function (app) {

    var type_license = require('../../controllers/external/type_license.controller');
    app.route('/').get(type_license.type_license);
    app.route('/id/:type_lic_id').get(type_license.type_licenseId);
    app.route('/insert').post(type_license.insert);
    // app.route('/update').put(typeLicense.update);
    // app.route('/delete/id/:id').delete(typeLicense.delete);
}