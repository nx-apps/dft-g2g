exports.getArrVal = function (req, key, spt = null) {
    if (req.method == 'GET' && spt != null) {
        return req.query[key].split('_');
    } else if (req.method == 'POST' || spt == null) {
        return req.body[key];
    }
}