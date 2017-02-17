var browserService = soyut.Services.getInstance().getService("browserServer");
var curUrl = browserService.origin.split(':');

    var frameEditor = $(getInstanceID("iframeEditor"));
    var frameEditorId = frameEditor.selector.split("#");

    var name = getParam('name');
    var url = getParam('url');
    var type = getParam('type');

    //console.log(name+" - "+type+" - "+url)

    if (type == "application/pdf") {
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

            var html = "<iframe title=\"PDF\" type=\"application/pdf\" src=\""+ geturl +"\" frameborder=\"1\" scrolling=\"auto\" height=\"800\" width=\"850\" ></iframe>";
            $('.content-data').append(html)
        });
    }
    else if (type == "text/plain") {
        $.ajax({
            url: url,
            dataType: "text",
            success: function (data) {
                $('.content-data').html(data);
            }
        });
    }
    else if (type == "video/mp4") {
        var html = "<video width=\"100%\" height=\"100%\" controls autoplay>";
        html += "<source src=\"" + url + "\" type=\"video/mp4\">";
        html += "</video>";
        $('.content-data').html(html);
    }
    else if (type == "image/jpeg") {
        var html = "<img src=\"" + url + "\" height=\"100%\" width=\"100%\">";
        $('.content-data').html(html);
    }
    else if (type == "application/msword") {

        browserService.getLocalIP({}, function (err, ip) {

            var xd = url;

            function getPosition(str, m, i) {
                return str.split(m, i).join(m).length;
            }

            var fileUrl = xd.substring(0, 8) + ip + xd.substring(getPosition(xd, ':', 2));
            console.log("file url "+fileUrl);
            soyut.Services.getInstance().getService("browserServer").generateDocKey({}, function (err, data) {
                initDocEditor(data.key, data.vkey);

                function initDocEditor(docKey, docVkey) {
                    browserService.getDocServerUrl({}, function (err, server) {
                        //$.getScript(server + '/web-apps/apps/api/documents/api.js');

                        var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                            {
                                width: "100%",
                                height: "1000px",
                                documentType: "text",
                                document: {
                                    title: name,
                                    url: fileUrl,
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
                                    customization: {
                                        about: false,
                                        logo: {
                                            image: 'https://' + browserService.origin + '/img/soyut.png'
                                        }
                                    }
                                }
                            });
                    });
                }
            });

        });

    }
    else if (type == "application/vnd.ms-excel") {
        browserService.getLocalIP({}, function (err, ip) {

            var xd = url;

            function getPosition(str, m, i) {
                return str.split(m, i).join(m).length;
            }

            var fileUrl = xd.substring(0, 8) + ip + xd.substring(getPosition(xd, ':', 2));
            console.log("file url " + fileUrl);
            soyut.Services.getInstance().getService("browserServer").generateSheetKey({}, function (err, data) {
                initSheetEditor(data.key, data.vkey);
                function initSheetEditor(docKey, docVkey) {
                    browserService.getDocServerUrl({}, function (err, server) {
                        //$.getScript(server + '/web-apps/apps/api/documents/api.js');

                        var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                            {
                                width: "800px",
                                height: "800px",
                                documentType: "spreadsheet",
                                document: {
                                    title: name,
                                    url: fileUrl,
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
                                    customization: {
                                        about: false,
                                        logo: {
                                            image: 'https://' + browserService.origin + '/img/soyut.png'
                                        }
                                    }
                                }
                            });
                    });
                }
            });
        });

    }
    else if (type == "application/vnd.ms-powerpoint") {
        browserService.getLocalIP({}, function (err, ip) {

            var xd = url;

            function getPosition(str, m, i) {
                return str.split(m, i).join(m).length;
            }

            var fileUrl = xd.substring(0, 8) + ip + xd.substring(getPosition(xd, ':', 2));
            console.log("file url " + fileUrl);

            soyut.Services.getInstance().getService("browserServer").generatePresentationKey({}, function (err, data) {
                initPresentationEditor(data.key, data.vkey);
                function initPresentationEditor(docKey, docVkey) {
                    browserService.getDocServerUrl({}, function (err, server) {
                        //$.getScript(server + '/web-apps/apps/api/documents/api.js');

                        var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                            {
                                width: "800px",
                                height: "800px",
                                documentType: "presentation",
                                document: {
                                    title: name,
                                    url: fileUrl,
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
                                    customization: {
                                        about: false,
                                        logo: {
                                            image: 'https://' + browserService.origin + '/img/soyut.png'
                                        }
                                    }
                                }
                            });
                    });
                }
            });
        });
    }
    else if (type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        browserService.getLocalIP({}, function (err, ip) {

            var xd = url;

            function getPosition(str, m, i) {
                return str.split(m, i).join(m).length;
            }

            var fileUrl = xd.substring(0, 8) + ip + xd.substring(getPosition(xd, ':', 2));
            console.log("file url " + fileUrl);
            soyut.Services.getInstance().getService("browserServer").generateDocxKey({}, function (err, data) {
                initDocxEditor(data.key, data.vkey);

                function initDocxEditor(docKey, docVkey) {
                    browserService.getDocServerUrl({}, function (err, server) {
                        //$.getScript(server + '/web-apps/apps/api/documents/api.js');

                        var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                            {
                                width: "800px",
                                height: "800px",
                                documentType: "text",
                                document: {
                                    title: name,
                                    url: fileUrl,
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
                                    customization: {
                                        about: false,
                                        logo: {
                                            image: 'https://' + browserService.origin + '/img/soyut.png'
                                        }
                                    }
                                }
                            });
                    });
                }
            });
        });

    }
    else if (type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        browserService.getLocalIP({}, function (err, ip) {

            var xd = url;

            function getPosition(str, m, i) {
                return str.split(m, i).join(m).length;
            }

            var fileUrl = xd.substring(0, 8) + ip + xd.substring(getPosition(xd, ':', 2));
            console.log("file url " + fileUrl);
            soyut.Services.getInstance().getService("browserServer").generateSheetxKey({}, function (err, data) {
                initSheetxEditor(data.key, data.vkey);
                function initSheetxEditor(docKey, docVkey) {
                    browserService.getDocServerUrl({}, function (err, server) {
                       // $.getScript(server + '/web-apps/apps/api/documents/api.js');

                        var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                            {
                                width: "800px",
                                height: "800px",
                                documentType: "spreadsheet",
                                document: {
                                    title: name,
                                    url: fileUrl,
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
                                    customization: {
                                        about: false,
                                        logo: {
                                            image: 'https://' + browserService.origin + '/img/soyut.png'
                                        }
                                    }
                                }
                            });
                    });
                }
            });
        });

    }
    else if (type == "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
        browserService.getLocalIP({}, function (err, ip) {

            var xd = url;

            function getPosition(str, m, i) {
                return str.split(m, i).join(m).length;
            }

            var fileUrl = xd.substring(0, 8) + ip + xd.substring(getPosition(xd, ':', 2));
            console.log("file url " + fileUrl);
            soyut.Services.getInstance().getService("browserServer").generatePresentationxKey({}, function (err, data) {
                initPresentationxEditor(data.key, data.vkey);
                function initPresentationxEditor(docKey, docVkey) {
                    browserService.getDocServerUrl({}, function (err, server) {
                        //$.getScript(server + '/web-apps/apps/api/documents/api.js');

                        var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                            {
                                width: "800px",
                                height: "800px",
                                documentType: "presentation",
                                document: {
                                    title: name,
                                    url: fileUrl,
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
                                    customization: {
                                        about: false,
                                        logo: {
                                            image: 'https://' + browserService.origin + '/img/soyut.png'
                                        }
                                    }
                                }
                            });
                    });
                }
            });
        });
    }