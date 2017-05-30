module.exports = function (app) {

    var document_file = require('../../controllers/external/document_file.controller');
    app.route('/').get(document_file.document_file);
    app.route('/id/:id').get(document_file.document_fileId);
    // app.route('/insert').post(documentFile.insert);
    // app.route('/update').put(documentFile.update);
    // app.route('/delete/id/:id').delete(documentFile.delete);
}