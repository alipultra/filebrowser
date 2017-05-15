var curUrl = soyut.browser.origin.split(':');

var frameEditor = $(getInstanceID("iframeEditor"));
var frameEditorId = frameEditor.selector.split("#");

var name = getParam('name');
var url = getParam('url');
var type = getParam('type');

soyut.browser.initFileViewer = function () {
    switch (type) {
        case "application/pdf":
            soyut.browser.openFilePDF();
        case "text/plain":
            soyut.browser.openFileText();
        case "video/mp4":
            soyut.browser.openFileVideo();
        case "audio/mp3":
            soyut.browser.openFileAudio();
        case "image/jpeg":
            soyut.browser.openFileImage();
        case "image/png":
            soyut.browser.openFileImage();
        case "application/msword":
            soyut.browser.openFileDocument();
        case "application/vnd.ms-excel":
            soyut.browser.openFileSheet();
        case "application/vnd.ms-powerpoint":
            soyut.browser.openFilePresentation();
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            soyut.browser.openFileDocumentx();
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            soyut.browser.openFileSheetx();
        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            soyut.browser.openFilePresentationx();
    }
};

soyut.browser.openFilePDF = function () {
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
        //var fileURL = URL.createObjectURL(blob);
        var geturl = URL.createObjectURL(blob);

        var html = "<iframe title=\"PDF\" type=\"application/pdf\" src=\""+ geturl +"\" frameborder=\"1\" scrolling=\"auto\" style=\"width:100%; height:100vw\" ></iframe>";
        $('.content-data').append(html)
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
    soyut.browser.downloadFile({url: url, name: name}, function (err, result) {

        soyut.browser.getLocalIP({}, function (err, ip) {
            var currentUrl = "https://" + ip + ":" + curUrl[1] + "/data/"+ name;
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
                                    }
                                },
                                editorConfig: {
                                    lang: "en",
                                    location: server + "/web-apps/",
                                    callbackUrl: 'https://'+ ip + ":" + curUrl[1] + '/track?useraddress='+ dirName +'&filename='+filesave,
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
    soyut.browser.downloadFile({url: url, name: name}, function (err, result) {

        soyut.browser.getLocalIP({}, function (err, ip) {
            var currentUrl = "https://" + ip + ":" + curUrl[1] + "/data/"+ name;
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
                                    }
                                },
                                editorConfig: {
                                    lang: "en",
                                    location: server + "/web-apps/",
                                    callbackUrl: 'https://'+ ip + ":" + curUrl[1] + '/track?useraddress='+ dirName +'&filename='+filesave,
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
    soyut.browser.downloadFile({url: url, name: name}, function (err, result) {

        soyut.browser.getLocalIP({}, function (err, ip) {
            var currentUrl = "https://" + ip + ":" + curUrl[1] + "/data/"+ name;
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
                                    }
                                },
                                editorConfig: {
                                    lang: "en",
                                    location: server + "/web-apps/",
                                    callbackUrl: 'https://'+ ip + ":" + curUrl[1] + '/track?useraddress='+ dirName +'&filename='+filesave,
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
    soyut.browser.downloadFile({url: url, name: name}, function (err, result) {

        soyut.browser.getLocalIP({}, function (err, ip) {
            var currentUrl = "https://" + ip + ":" + curUrl[1] + "/data/"+ name;
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
                                    }
                                },
                                editorConfig: {
                                    lang: "en",
                                    location: server + "/web-apps/",
                                    callbackUrl: 'https://'+ ip + ":" + curUrl[1] + '/track?useraddress='+ dirName +'&filename='+filesave,
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
    soyut.browser.downloadFile({url: url, name: name}, function (err, result) {

        soyut.browser.getLocalIP({}, function (err, ip) {
            var currentUrl = "https://" + ip + ":" + curUrl[1] + "/data/"+ name;
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
                                    }
                                },
                                editorConfig: {
                                    lang: "en",
                                    location: server + "/web-apps/",
                                    callbackUrl: 'https://'+ ip + ":" + curUrl[1] + '/track?useraddress='+ dirName +'&filename='+filesave,
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
    soyut.browser.downloadFile({url: url, name: name}, function (err, result) {

        soyut.browser.getLocalIP({}, function (err, ip) {
            var currentUrl = "https://" + ip + ":" + curUrl[1] + "/data/"+ name;
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
                                    }
                                },
                                editorConfig: {
                                    lang: "en",
                                    location: server + "/web-apps/",
                                    callbackUrl: 'https://'+ ip + ":" + curUrl[1] + '/track?useraddress='+ dirName +'&filename='+filesave,
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