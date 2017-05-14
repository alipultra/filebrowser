soyut.browser = soyut.browser || soyut.Services.getInstance().getService("browserServer");
var socket = io.connect('https://'+ soyut.browser.origin);

soyut.browser.getDocServerUrl({}, function (err, docserver) {
    socket.on('edit_document', function (data) {

    });

    $.getScript(docserver + '/web-apps/apps/api/documents/api.js');
});

soyut.browser.initFiles = function (req) {
    return new Promise (function(resolve,reject) {
        soyut.browser.file_ls({path: req}, function (e, data) {
            if (e) {
                reject(e);
            } else {
                var dataObj = {};
                dataObj = data;
                resolve(dataObj);
            }
        });
    });
};

soyut.browser.file_ls = function (req, callback) {
    fileSystem.ls(req.path, function (err, files) {
        callback(false, files);
    });
};

soyut.browser.mp_ls = function (req, callback) {
    fileSystem.mp_ls(req.volume, req.path, function (err, files) {
        callback(false, files);
    });
};

soyut.browser.mountPointChange = function (volumes) {
    $(".device-list").html('');
    var curVol = $('.volume-browser').val();
    var fsSel = '';
    if(curVol == "0"){
        fsSel = 'selected';
    }
    var html = '<option value="0" '+ fsSel +'>File Sistem</option>';
    if(volumes.length > 0){
        volumes.forEach(function (i) {
            var mdSel = '';
            if(curVol == i){
                mdSel = 'selected';
            }
            var n = i.lastIndexOf('/');
            var nmp = i.substring(n + 1);

            html += '<option value="'+ i +'" '+ mdSel +'>'+ nmp +'</option>';
        });
    }
    $(".device-list").append(html);
};

document.addEventListener('fileSystem.mountPointChange', function() {
    /* do something */
    console.log("mountpoint change");
    var volumes = fileSystem.mp_list;
    soyut.browser.mountPointChange(volumes);
    soyut.browser.refreshBrowser();
}, false);

// document.addEventListener('fileSystem.structureChange', function() {
//     /* do something */
//     console.log("fileSystem change");
//     soyut.browser.refreshBrowser();
// }, false);
//
// document.removeEventListener('fileSystem.structureChange', function() {
//     /* do something */
//     console.log("remove");
// }, false);