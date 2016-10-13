module.exports = {
    init: function () {
        var self = this;

    },
    Tes :function (id, callback) {
        var tes = {
            "nama": "ssdasd",
            "alamat": "asdasd",
            "apiurl": this.docConfig.apiUrl
        };
        callback(false, tes);
    },
    LoadFile :function (id, callback) {
        var a = fileSystem.ls('/');

        callback(false, a);
    }
}