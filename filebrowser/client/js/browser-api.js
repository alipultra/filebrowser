soyut.browser = soyut.browser || soyut.Services.getInstance().getService("browserServer");
var socket = io.connect('https://'+ soyut.browser.origin);

socket.on('edit_document', function (data) {
    soyut.browser.updateOfficeDocument(data)
});
socket.on('view_document', function (data) {
    soyut.browser.viewOfficeDocument(data)
});

soyut.browser.getDocServerUrl({}, function (err, docserver) {
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
    soyut.browser.deleteFile({file: file.filename, storageKey: file.storagekey}, function (err, resfile) {
        soyut.browser.hideFileLoader(file);
    });
};

soyut.browser.showLoader = function () {
    $(".loader-container").show(500);
};

soyut.browser.hideLoader = function () {
    $(".loader-container").hide(500);
};

soyut.browser.showFileLoader = function (name, storagekey) {
    soyut.storage.getStorageKeyAsync({userId: fileSystem.userid}).then(function(curStorageKey) {
        if (curStorageKey == storagekey) {
            var fileLoader = $("ul").find("li[data-file='" + name + "']");
            fileLoader.children("div").removeClass('hide');
            fileLoader.children("figure").addClass('hide');
        }
    });
};

soyut.browser.hideFileLoader = function (file) {
    soyut.storage.getStorageKeyAsync({userId: fileSystem.userid}).then(function(curStorageKey) {
        if (curStorageKey == file.storagekey) {
            var fileLoader = $("ul").find("li[data-file='" + file.filename + "']");
            fileLoader.children("div").addClass('hide');
            fileLoader.children("figure").removeClass('hide');
        }
    });
};

soyut.browser.updateOfficeDocument = function (file) {
    var dataurl = "https://" + soyut.browser.origin + "/data/temp-"+ file.storagekey + "/" + file.filename;
    var curUrl = soyut.browser.origin.split(':');

    function getFile(furl, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', furl, true);
        xhr.responseType = 'blob';
        xhr.onload = function (e) {
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

    function saveFileToSystem(targetFolder) {
            var storagePath = "/" + targetFolder + file.filename;

            function getPosition(str, m, i) {
                return str.split(m, i).join(m).length;
            }

            var safeUrl = dataurl.substring(0, 8) + curUrl[0] + dataurl.substring(getPosition(dataurl, ':', 2));

            // debugger;
            getFile(safeUrl, function (err, dataBuffer) {
                if (err) return;
                soyut.storage.putAsync({
                    storageKey: file.storagekey,
                    path: storagePath,
                    dataBuffer: dataBuffer
                }).then(function () {
                    soyut.browser.deleteFile({file: file.filename, storageKey: file.storagekey}, function (err, resfile) {
                        soyut.browser.hideFileLoader(file);
                        console.log("File telah di update!");
                    });
                });
            });
    }

    saveFileToSystem(file.useraddress);
};

soyut.browser.listenMountpointChanges = function () {
    var volumes = fileSystem.mp_list;

    $(".device-list option:not([value='0']):not([value='1'])").remove();
    var curVol = $('.volume-browser').val();
    var html = '';
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
    else {
        if(curVol != 0 && curVol != 1) {
            console.log("media unplugged");
            soyut.browser.devicesChanges();
        }
    }
    $(".device-list").append(html);
};

document.addEventListener('fileSystem.mountPointChange', soyut.browser.listenMountpointChanges);

soyut.browser.listenFileChanges = function() {
    console.log("file system changes!");
    document.removeEventListener('fileSystem.structureChange', soyut.browser.listenFileChanges);
};



