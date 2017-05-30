module.exports = function (app) {

    var upload = require('../../controllers/external/upload.controller');
    app.route('/exporter/file/:company_id').post(upload.uploadFileExporter);
    app.route('/file/:id').delete(upload.deleteFile);
    app.route('/file/:id').get(upload.downloadFile);
    app.route('/list/:refPath/:company_id').get(upload.listFilePath);
    app.route('/list/:company_id').get(upload.listFileDelete);
    app.route('/update/:file_id').put(upload.recoveryFile);
    // app.route('/file').post(upload.uploadFile);
    // app.route('/list').get(upload.listFile);
}