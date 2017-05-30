module.exports = function (app) {

    var document_type = require('../../controllers/external/document_type.controller');
    app.route('/').get(document_type.document_type);
    app.route('/id/:doc_type_id').get(document_type.document_typeId);
    // app.route('/insert').post(documentType.insert);
    // app.route('/update').put(documentType.update);
    // app.route('/delete/id/:id').delete(documentType.delete);
}