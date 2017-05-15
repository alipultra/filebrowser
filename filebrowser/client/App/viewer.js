var browserService = soyut.Services.getInstance().getService("browserServer");
var curUrl = browserService.origin.split(':');

    var frameEditor = $(getInstanceID("iframeEditor"));
    var frameEditorId = frameEditor.selector.split("#");

    var path = getParam('path');
    console.log(path)
    $(getInstanceID('tes')).html(path);

    fileSystem.stat(path, function (err, files) {
        if (files.type == "application/pdf") {
            function getPosition(str, m, i) { return str.split(m, i).join(m).length; }
            var safeUrl = files.url.substring(0, 8) + curUrl[0] + files.url.substring(getPosition(files.url, ':', 2));
            console.log(safeUrl);
            function getFile(url, callback) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', files.url, true);
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

                var html = "<iframe title=\"PDF\" type=\"application/pdf\" src=\""+ geturl +"\" frameborder=\"1\" scrolling=\"auto\" style=\"width:100%; height:100vw\"></iframe>";
                $('.content-data').append(html)
            });
        }
        else if (files.type == "text/plain") {
            $.ajax({
                url: files.url,
                dataType: "text",
                success: function (data) {
                    $('.content-data').html(data);
                }
            });
        }
        else if (files.type == "video/mp4") {
            var html = "<video width=\"100%\" height=\"100%\" controls autoplay>";
            html += "<source src=\"" + files.url + "\" type=\"video/mp4\">";
            html += "</video>";
            $('.content-data').html(html);
        }
        else if (files.type == "image/jpeg") {
            var html = "<img src=\"" + files.url + "\" height=\"100%\" width=\"100%\">";
            $('.content-data').html(html);
        }
        else if (files.type == "image/png") {
            var html = "<img src=\"" + files.url + "\" height=\"100%\" width=\"100%\">";
            $('.content-data').html(html);
        }
        else if (files.type == "application/msword") {

            browserService.downloadFile({url: files.url, name: files.name}, function (err, result) {
                
                browserService.getLocalIP({}, function (err, ip) {
                    var currentUrl = "https://" + ip + ":" + curUrl[1] + "/data/"+ files.name;
                    soyut.Services.getInstance().getService("browserServer").generateDocKey({}, function (err, data) {
                        initDocEditor(data.key, data.vkey);

                        function initDocEditor(docKey, docVkey) {
                            browserService.getDocServerUrl({}, function (err, server) {
                                //save 
                                var onDocumentStateChange = function (event) {
                                    
                                };

                                var filesave = encodeURIComponent(files.name);
                                var dirName = path.substr(0, path.lastIndexOf("/"));

                                var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                                    {
                                        width: "100%",
                                        height: "100%",
                                        documentType: "text",
                                        document: {
                                            title: files.name,
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
                                                    image: 'https://' + browserService.origin + '/img/soyut.png'
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

        }
        else if (files.type == "application/vnd.ms-excel") {
            browserService.downloadFile({url: files.url, name: files.name}, function (err, result) {
                
                browserService.getLocalIP({}, function (err, ip) {
                    var currentUrl = "https://" + ip + ":" + curUrl[1] + "/data/"+ files.name;
                    soyut.Services.getInstance().getService("browserServer").generateSheetKey({}, function (err, data) {
                        initSheetEditor(data.key, data.vkey);

                        function initSheetEditor(docKey, docVkey) {
                            browserService.getDocServerUrl({}, function (err, server) {
                                
                                var filesave = encodeURIComponent(files.name);
                                var dirName = path.substr(0, path.lastIndexOf("/"));

                                var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                                    {
                                        width: "100%",
                                        height: "100%",
                                        documentType: "spreadsheet",
                                        document: {
                                            title: files.name,
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
                                                    image: 'https://' + browserService.origin + '/img/soyut.png'
                                                }
                                            }
                                        }
                                    });
                            });
                        }
                    });

                });

            });
        }
        else if (files.type == "application/vnd.ms-powerpoint") {
            browserService.downloadFile({url: files.url, name: files.name}, function (err, result) {

                browserService.getLocalIP({}, function (err, ip) {
                    var currentUrl = "https://" + ip + ":" + curUrl[1] + "/data/"+ files.name;
                    soyut.Services.getInstance().getService("browserServer").generatePresentationKey({}, function (err, data) {
                        initPresentationEditor(data.key, data.vkey);

                        function initPresentationEditor(docKey, docVkey) {
                            browserService.getDocServerUrl({}, function (err, server) {
                                var filesave = encodeURIComponent(files.name);
                                var dirName = path.substr(0, path.lastIndexOf("/"));

                                var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                                    {
                                        width: "100%",
                                        height: "100%",
                                        documentType: "presentation",
                                        document: {
                                            title: files.name,
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
                                                    image: 'https://' + browserService.origin + '/img/soyut.png'
                                                }
                                            }
                                        }
                                    });
                            });
                        }
                    });

                });
            });
        }
        else if (files.type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            browserService.downloadFile({url: files.url, name: files.name}, function (err, result) {
                
                browserService.getLocalIP({}, function (err, ip) {
                    var currentUrl = "https://" + ip + ":" + curUrl[1] + "/data/"+ files.name;
                    soyut.Services.getInstance().getService("browserServer").generateDocxKey({}, function (err, data) {
                        initDocxEditor(data.key, data.vkey);

                        function initDocxEditor(docKey, docVkey) {
                            browserService.getDocServerUrl({}, function (err, server) {
                                var filesave = encodeURIComponent(files.name);
                                var dirName = path.substr(0, path.lastIndexOf("/"));

                                var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                                    {
                                        width: "100%",
                                        height: "100%",
                                        documentType: "text",
                                        document: {
                                            title: files.name,
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
                                                    image: 'https://' + browserService.origin + '/img/soyut.png'
                                                }
                                            }
                                        }
                                    });
                            });
                        }
                    });
                });

            });
        }
        else if (files.type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            browserService.downloadFile({url: files.url, name: files.name}, function (err, result) {

                browserService.getLocalIP({}, function (err, ip){
                    var currentUrl = "https://" + ip + ":" + curUrl[1] + "/data/"+ files.name;
                    soyut.Services.getInstance().getService("browserServer").generateSheetxKey({}, function (err, data) {
                        initSheetxEditor(data.key, data.vkey);


                            function initSheetxEditor(docKey, docVkey) {
                                browserService.getDocServerUrl({}, function (err, server) {
                                    var filesave = encodeURIComponent(files.name);
                                    var dirName = path.substr(0, path.lastIndexOf("/"));

                                    var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                                        {
                                            width: "100%",
                                            height: "100%",
                                            documentType: "spreadsheet",
                                            document: {
                                                title: files.name,
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
                                                        image: 'https://' + browserService.origin + '/img/soyut.png'
                                                    }
                                                }
                                            }
                                        });
                                });
                            }
                    });
                });

            });
        }
        else if (files.type == "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
            browserService.downloadFile({url: files.url, name: files.name}, function (err, result) {

                browserService.getLocalIP({}, function (err, ip){
                    var currentUrl = "https://" + ip + ":" + curUrl[1] + "/data/"+ files.name;
                    soyut.Services.getInstance().getService("browserServer").generatePresentationxKey({}, function (err, data) {
                        initPresentationxEditor(data.key, data.vkey);

                        function initPresentationxEditor(docKey, docVkey) {
                            browserService.getDocServerUrl({}, function (err, server) {
                                var filesave = encodeURIComponent(files.name);
                                var dirName = path.substr(0, path.lastIndexOf("/"));

                                var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                                    {
                                        width: "100%",
                                        height: "100%",
                                        documentType: "presentation",
                                        document: {
                                            title: files.name,
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
                                                    image: 'https://' + browserService.origin + '/img/soyut.png'
                                                }
                                            }
                                        }
                                    });
                                });
                        }

                    });
                });

            });
        }

        
    });

