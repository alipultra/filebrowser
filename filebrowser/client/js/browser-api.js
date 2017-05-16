soyut.browser = soyut.browser || soyut.Services.getInstance().getService("browserServer");
var socket = io.connect('https://'+ soyut.browser.origin);

soyut.browser.getDocServerUrl({}, function (err, docserver) {
    socket.on('edit_document', function (data) {
        soyut.browser.updateOfficeDocument(data)
    });
    socket.on('view_document', function (data) {
        soyut.browser.viewOfficeDocument(data)
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

soyut.browser.viewOfficeDocument = function (file) {
    soyut.browser.deleteFile({file: file.filename}, function (err, resfile) {
        soyut.browser.hideLoader();
    });
};

soyut.browser.showLoader = function () {
    $(".loader-container").show();
};

soyut.browser.hideLoader = function () {
    $(".loader-container").hide(500);
};

soyut.browser.updateOfficeDocument = function (file) {
    var dataurl = "https://"+ soyut.browser.origin +"/data/"+file.filename;
    var curUrl = soyut.browser.origin.split(':');

    function getFile(furl, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', furl, true);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
            if (this.status == 200) {
                // get binary data as a response
                callback(false, this.response);
            }
        };
        xhr.onerror = function (e) {
            callback(true, e);
        };
        xhr.send();
    }

    function saveFileToSystem(targetFolder){
        soyut.storage.getStorageKeyAsync({userId: fileSystem.userid}).then(function(storageKey) {
            var storagePath = "/" + targetFolder + file.filename;

            function getPosition(str, m, i) { return str.split(m, i).join(m).length; }

            var safeUrl = dataurl.substring(0, 8) + curUrl[0] + dataurl.substring(getPosition(dataurl, ':', 2));

            // debugger;
            getFile(safeUrl, function(err, dataBuffer) {
                if (err) return;
                soyut.storage.putAsync({
                    storageKey: storageKey,
                    path: storagePath,
                    dataBuffer: dataBuffer
                }).then(function() {
                    soyut.browser.deleteFile({file: file.filename}, function (err, resfile) {
                        soyut.browser.hideLoader();
                        console.log("File telah di update!");
                    });
                });
            });
        });
    }

    saveFileToSystem(file.useraddress);
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
    //soyut.browser.refreshBrowser();
}, false);

soyut.browser.listenFileChanges = function() {
    console.log("file system changes!");
    document.removeEventListener('fileSystem.structureChange', soyut.browser.listenFileChanges);
    //soyut.browser.refreshBrowser();
};

document.addEventListener('fileSystem.structureChange', soyut.browser.listenFileChanges);



