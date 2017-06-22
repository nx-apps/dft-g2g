module.exports = function (app) {
    var controller = require('../controllers/book.controller');
    //book
    app.get('/confirm', controller.getByClId);
    app.get('/', controller.getById);
    app.post('/insert', controller.insert);
    app.put('/update', controller.update);
    app.delete('/delete/:id', controller.delete);
    //book_detail
    app.get('/detail/list', controller.listDetail);
    app.get('/detail', controller.getDetailById);
    app.post('/detail/insert', controller.insertDetail);
    app.put('/detail/update', controller.updateDetail);
    app.delete('/detail/delete/:id', controller.deleteDetail);
}