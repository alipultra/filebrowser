var curUrl = soyut.browser.origin.split(':');

var frameEditor = $(getInstanceID("iframeEditor"));
var frameEditorId = frameEditor.selector.split("#");

var name = getParam('name');
var url = getParam('url');
var type = getParam('type');
var storagekey = getParam('storageKey');
var editmode = getParam('edit');

soyut.browser.initFileViewer = function () {
    if(type == "application/pdf") {
        soyut.browser.openFilePDF();
    }
    else if(type == "text/plain") {
        soyut.browser.openFileText();
    }
    else if(type == "video/mp4") {
        soyut.browser.openFileVideo();
    }
    else if(type == "audio/mp3") {
        soyut.browser.openFileAudio();
    }
    else if(type == "image/jpeg") {
        soyut.browser.openFileImage();
    }
    else if(type == "image/png") {
        soyut.browser.openFileImage();
    }
    else if(type == "application/msword") {
        soyut.browser.openFileDocument();
    }
    else if(type == "application/vnd.ms-excel") {
        soyut.browser.openFileSheet();
    }
    else if(type == "application/vnd.ms-powerpoint") {
        soyut.browser.openFilePresentation();
    }
    else if(type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        soyut.browser.openFileDocumentx();
    }
    else if(type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        soyut.browser.openFileSheetx();
    }
    else if(type == "application/vnd.openxmlformats-officedocument.presentationml.presentation"){
            soyut.browser.openFilePresentationx();
    }
};

soyut.browser.openFilePDF = function () {
    console.log(url)
    function getPosition(str, m, i) { return str.split(m, i).join(m).length; }
    var safeUrl = url.substring(0, 8) + curUrl[0] + url.substring(getPosition(url, ':', 2));
    console.log(safeUrl);
    function getFile(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
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
    getFile(safeUrl, function(err, dataBuffer) {
        var blob = new Blob([dataBuffer],{type: 'application/pdf'});
        var geturl = URL.createObjectURL(blob);

        var html = '<iframe title="PDF" type="application/pdf" src="'+ geturl+'#page=1&zoom=100&toolbar=0&navpanes=0' +'" frameborder="1" scrolling="auto" style="width:100%; height: 95vh;"></iframe>';
        $('.content-data').append(html);
    });
};

soyut.browser.openFileText = function () {
    $.ajax({
        url: url,
        dataType: "text",
        success: function (data) {
            $('.content-data').html(data);
        }
    });
};
soyut.browser.openFileVideo = function () {
    var html = "<video width=\"100%\" height=\"100%\" controls autoplay>";
    html += "<source src=\"" + url + "\" type=\"video/mp4\">";
    html += "</video>";
    $('.content-data').html(html);
};
soyut.browser.openFileAudio = function () {
    var html = "<audio controls autoplay>";
    html += "<source src=\""+ url + "\" type=\"audio/mp3\">";
    html += "</audio>";
    $('.content-data').html(html);
};
soyut.browser.openFileImage = function () {
    var html = "<img src=\"" + url + "\" height=\"100%\" width=\"100%\">";
    $('.content-data').html(html);
};
soyut.browser.openFileDocument = function () {
    soyut.storage.getStorageKeyAsync({userId: storagekey}).then(function(storageKey) {
        soyut.browser.showFileLoader(name, storageKey);

        soyut.browser.getLocalIP({}, function (err, ip) {
            var currentUrl = '';
            if(editmode) {
                soyut.browser.downloadFile({url: url, name: name, storageKey: storageKey}, function (err, result) {
                });
                currentUrl = "https://" + ip + ":" + curUrl[1] + "/data/temp-"+ storageKey + "/" + name;
            }
            else {
                currentUrl = url;
            }

            soyut.browser.generateDocKey({}, function (err, data) {
                initDocEditor(data.key, data.vkey);

                function initDocEditor(docKey, docVkey) {
                    soyut.browser.getDocServerUrl({}, function (err, server) {
                        //save
                        var onDocumentStateChange = function (event) {

                        };

                        var filesave = encodeURIComponent(name);
                        var curx = url.split(':');
                        var httpstr = curx[2].substring(curx[2].indexOf("/") + 1);
                        var strg = httpstr.substring(httpstr.indexOf("/") + 1);
                        var strkey = strg.substring(strg.indexOf("/") + 1);
                        var dirName = strkey.substr(0, strkey.lastIndexOf("/") + 1);

                        var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                            {
                                width: "100%",
                                height: "100%",
                                documentType: "text",
                                document: {
                                    title: name,
                                    url: currentUrl,
                                    key: docKey,
                                    vkey: docVkey,
                                    permissions: {
                                        download: false,
                                        print: false,
                                        edit: editmode
                                    }
                                },
                                editorConfig: {
                                    lang: "en",
                                    location: server + "/web-apps/",
                                    callbackUrl: 'https://' + ip + ":" + curUrl[1] + '/track?useraddress=' + dirName + '&filename=' + filesave + '&storagekey=' + storageKey,
                                    customization: {
                                        about: false,
                                        logo: {
                                            image: 'https://' + soyut.browser.origin + '/img/soyut.png'
                                        }
                                    }
                                },
                                events: {
                                    "onDocumentStateChange": onDocumentStateChange
                                }
                            });
                    });
                }
            });

        });
    });
};

soyut.browser.openFileSheet = function () {
    soyut.storage.getStorageKeyAsync({userId: storagekey}).then(function(storageKey) {
        soyut.browser.showFileLoader(name, storageKey);
        soyut.browser.getLocalIP({}, function (err, ip) {
            var currentUrl = '';
            if(editmode) {
                soyut.browser.downloadFile({url: url, name: name, storageKey: storageKey}, function (err, result) {
                });
                currentUrl = "https://" + ip + ":" + curUrl[1] + "/data/temp-"+ storageKey + "/" + name;
            }
            else {
                currentUrl = url;
            }

            soyut.browser.generateSheetKey({}, function (err, data) {
                initSheetEditor(data.key, data.vkey);

                function initSheetEditor(docKey, docVkey) {
                    soyut.browser.getDocServerUrl({}, function (err, server) {
                        //save
                        var onDocumentStateChange = function (event) {

                        };

                        var filesave = encodeURIComponent(name);
                        var curx = url.split(':');
                        var httpstr = curx[2].substring(curx[2].indexOf("/") + 1);
                        var strg = httpstr.substring(httpstr.indexOf("/") + 1);
                        var strkey = strg.substring(strg.indexOf("/") + 1);
                        var dirName = strkey.substr(0, strkey.lastIndexOf("/") + 1);

                        var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                            {
                                width: "100%",
                                height: "100%",
                                documentType: "spreadsheet",
                                document: {
                                    title: name,
                                    url: currentUrl,
                                    key: docKey,
                                    vkey: docVkey,
                                    permissions: {
                                        download: false,
                                        print: false,
                                        edit: editmode
                                    }
                                },
                                editorConfig: {
                                    lang: "en",
                                    location: server + "/web-apps/",
                                    callbackUrl: 'https://' + ip + ":" + curUrl[1] + '/track?useraddress=' + dirName + '&filename=' + filesave + '&storagekey=' + storageKey,
                                    customization: {
                                        about: false,
                                        logo: {
                                            image: 'https://' + soyut.browser.origin + '/img/soyut.png'
                                        }
                                    }
                                },
                                events: {
                                    "onDocumentStateChange": onDocumentStateChange
                                }
                            });
                    });
                }
            });

        });
    });
};
soyut.browser.openFilePresentation = function () {
    soyut.storage.getStorageKeyAsync({userId: storagekey}).then(function(storageKey) {
        soyut.browser.showFileLoader(name, storageKey);

        soyut.browser.getLocalIP({}, function (err, ip) {
            var currentUrl = '';
            if(editmode) {
                soyut.browser.downloadFile({url: url, name: name, storageKey: storageKey}, function (err, result) {
                });
                currentUrl = "https://" + ip + ":" + curUrl[1] + "/data/temp-"+ storageKey + "/" + name;
            }
            else {
                currentUrl = url;
            }

            soyut.browser.generatePresentationKey({}, function (err, data) {
                initPresentationEditor(data.key, data.vkey);

                function initPresentationEditor(docKey, docVkey) {
                    soyut.browser.getDocServerUrl({}, function (err, server) {
                        //save
                        var onDocumentStateChange = function (event) {

                        };

                        var filesave = encodeURIComponent(name);
                        var curx = url.split(':');
                        var httpstr = curx[2].substring(curx[2].indexOf("/") + 1);
                        var strg = httpstr.substring(httpstr.indexOf("/") + 1);
                        var strkey = strg.substring(strg.indexOf("/") + 1);
                        var dirName = strkey.substr(0, strkey.lastIndexOf("/") + 1);

                        var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                            {
                                width: "100%",
                                height: "100%",
                                documentType: "presentation",
                                document: {
                                    title: name,
                                    url: currentUrl,
                                    key: docKey,
                                    vkey: docVkey,
                                    permissions: {
                                        download: false,
                                        print: false,
                                        edit: editmode
                                    }
                                },
                                editorConfig: {
                                    lang: "en",
                                    location: server + "/web-apps/",
                                    callbackUrl: 'https://' + ip + ":" + curUrl[1] + '/track?useraddress=' + dirName + '&filename=' + filesave + '&storagekey=' + storageKey,
                                    customization: {
                                        about: false,
                                        logo: {
                                            image: 'https://' + soyut.browser.origin + '/img/soyut.png'
                                        }
                                    }
                                },
                                events: {
                                    "onDocumentStateChange": onDocumentStateChange
                                }
                            });
                    });
                }
            });

        });
    });
};

soyut.browser.openFileDocumentx = function () {
    soyut.storage.getStorageKeyAsync({userId: storagekey}).then(function(storageKey) {
        soyut.browser.showFileLoader(name, storageKey);

        soyut.browser.getLocalIP({}, function (err, ip) {
            var currentUrl = '';
            if(editmode) {
                soyut.browser.downloadFile({url: url, name: name, storageKey: storageKey}, function (err, result) {
                });
                currentUrl = "https://" + ip + ":" + curUrl[1] + "/data/temp-"+ storageKey + "/" + name;
            }
            else {
                currentUrl = url;
            }

            soyut.browser.generateDocxKey({}, function (err, data) {
                initDocxEditor(data.key, data.vkey);

                function initDocxEditor(docKey, docVkey) {
                    soyut.browser.getDocServerUrl({}, function (err, server) {
                        //save
                        var onDocumentStateChange = function (event) {
                        };

                        var filesave = encodeURIComponent(name);
                        var curx = url.split(':');
                        var httpstr = curx[2].substring(curx[2].indexOf("/") + 1);
                        var strg = httpstr.substring(httpstr.indexOf("/") + 1);
                        var strkey = strg.substring(strg.indexOf("/") + 1);
                        var dirName = strkey.substr(0, strkey.lastIndexOf("/") + 1);

                        var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                            {
                                width: "100%",
                                height: "100%",
                                documentType: "text",
                                document: {
                                    title: name,
                                    url: currentUrl,
                                    key: docKey,
                                    vkey: docVkey,
                                    permissions: {
                                        download: false,
                                        print: false,
                                        edit: editmode
                                    }
                                },
                                editorConfig: {
                                    lang: "en",
                                    location: server + "/web-apps/",
                                    callbackUrl: 'https://' + ip + ":" + curUrl[1] + '/track?useraddress=' + dirName + '&filename=' + filesave + '&storagekey=' + storageKey,
                                    customization: {
                                        about: false,
                                        logo: {
                                            image: 'https://' + soyut.browser.origin + '/img/soyut.png'
                                        }
                                    }
                                },
                                events: {
                                    "onDocumentStateChange": onDocumentStateChange
                                }
                            });
                    });
                }
            });
        });

    });
};

soyut.browser.openFileSheetx = function () {
    soyut.storage.getStorageKeyAsync({userId: storagekey}).then(function(storageKey) {
        soyut.browser.showFileLoader(name, storageKey);

        soyut.browser.getLocalIP({}, function (err, ip) {
            var currentUrl = '';
            if(editmode) {
                soyut.browser.downloadFile({url: url, name: name, storageKey: storageKey}, function (err, result) {
                });
                currentUrl = "https://" + ip + ":" + curUrl[1] + "/data/temp-"+ storageKey + "/" + name;
            }
            else {
                currentUrl = url;
            }

            soyut.browser.generateSheetxKey({}, function (err, data) {
                initSheetxEditor(data.key, data.vkey);

                function initSheetxEditor(docKey, docVkey) {
                    soyut.browser.getDocServerUrl({}, function (err, server) {
                        //save
                        var onDocumentStateChange = function (event) {

                        };

                        var filesave = encodeURIComponent(name);
                        var curx = url.split(':');
                        var httpstr = curx[2].substring(curx[2].indexOf("/") + 1);
                        var strg = httpstr.substring(httpstr.indexOf("/") + 1);
                        var strkey = strg.substring(strg.indexOf("/") + 1);
                        var dirName = strkey.substr(0, strkey.lastIndexOf("/") + 1);

                        var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                            {
                                width: "100%",
                                height: "100%",
                                documentType: "spreadsheet",
                                document: {
                                    title: name,
                                    url: currentUrl,
                                    key: docKey,
                                    vkey: docVkey,
                                    permissions: {
                                        download: false,
                                        print: false,
                                        edit: editmode
                                    }
                                },
                                editorConfig: {
                                    lang: "en",
                                    location: server + "/web-apps/",
                                    callbackUrl: 'https://' + ip + ":" + curUrl[1] + '/track?useraddress=' + dirName + '&filename=' + filesave + '&storagekey=' + storageKey,
                                    customization: {
                                        about: false,
                                        logo: {
                                            image: 'https://' + soyut.browser.origin + '/img/soyut.png'
                                        }
                                    }
                                },
                                events: {
                                    "onDocumentStateChange": onDocumentStateChange
                                }
                            });
                    });
                }
            });

        });
    });
};
soyut.browser.openFilePresentationx = function () {
    soyut.storage.getStorageKeyAsync({userId: storagekey}).then(function(storageKey) {
        soyut.browser.showFileLoader(name, storageKey);

        soyut.browser.getLocalIP({}, function (err, ip) {
            var currentUrl = '';
            if(editmode) {
                soyut.browser.downloadFile({url: url, name: name, storageKey: storageKey}, function (err, result) {
                });
                currentUrl = "https://" + ip + ":" + curUrl[1] + "/data/temp-"+ storageKey + "/" + name;
            }
            else {
                currentUrl = url;
            }

            soyut.browser.generatePresentationxKey({}, function (err, data) {
                initPresentationxEditor(data.key, data.vkey);

                function initPresentationxEditor(docKey, docVkey) {
                    soyut.browser.getDocServerUrl({}, function (err, server) {
                        //save
                        var onDocumentStateChange = function (event) {

                        };

                        var filesave = encodeURIComponent(name);
                        var curx = url.split(':');
                        var httpstr = curx[2].substring(curx[2].indexOf("/") + 1);
                        var strg = httpstr.substring(httpstr.indexOf("/") + 1);
                        var strkey = strg.substring(strg.indexOf("/") + 1);
                        var dirName = strkey.substr(0, strkey.lastIndexOf("/") + 1);

                        var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                            {
                                width: "100%",
                                height: "100%",
                                documentType: "presentation",
                                document: {
                                    title: name,
                                    url: currentUrl,
                                    key: docKey,
                                    vkey: docVkey,
                                    permissions: {
                                        download: false,
                                        print: false,
                                        edit: editmode
                                    }
                                },
                                editorConfig: {
                                    lang: "en",
                                    location: server + "/web-apps/",
                                    callbackUrl: 'https://' + ip + ":" + curUrl[1] + '/track?useraddress=' + dirName + '&filename=' + filesave + '&storagekey=' + storageKey,
                                    customization: {
                                        about: false,
                                        logo: {
                                            image: 'https://' + soyut.browser.origin + '/img/soyut.png'
                                        }
                                    }
                                },
                                events: {
                                    "onDocumentStateChange": onDocumentStateChange
                                }
                            });
                    });
                }
            });

        });
    });
};

soyut.browser.initFileViewer();