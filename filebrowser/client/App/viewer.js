var browserService = soyut.Services.getInstance().getService("browserServer");

    var frameEditor = $(getInstanceID("iframeEditor"));
    var frameEditorId = frameEditor.selector.split("#");

    var path = getParam('path');

    $(getInstanceID('tes')).html(path);

    fileSystem.stat(path, function (err, files) {
        if (files.type == "application/pdf") {

            var html = "<iframe title=\"PDF\" src=\"" + files.url + "\" frameborder=\"1\" scrolling=\"auto\" height=\"800\" width=\"850\" ></iframe>";

            $('.content-data').html(html);
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
        else if (files.type == "application/msword") {

            browserService.getLocalIP({}, function (err, ip) {

                var xd = files.url;

                function getPosition(str, m, i) {
                    return str.split(m, i).join(m).length;
                }

                var fileUrl = xd.substring(0, 8) + ip + xd.substring(getPosition(xd, ':', 2));
                console.log("file url "+fileUrl);
                soyut.Services.getInstance().getService("browserServer").generateDocKey({}, function (err, data) {
                    initDocEditor(data.key, data.vkey);

                    function initDocEditor(docKey, docVkey) {
                        var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                            {
                                width: "100%",
                                height: "1000px",
                                documentType: "text",
                                document: {
                                    title: files.name,
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
                                    location: documentServerUrl + "/web-apps/",
                                    customization: {
                                        about: false,
                                        logo: {
                                            image: 'https://' + browserService.origin + '/img/soyut.png'
                                        }
                                    }
                                }
                            });
                    }
                });

            });

        }
        else if (files.type == "application/vnd.ms-excel") {

            browserService.getLocalIP({}, function (err, ip) {

                var xd = files.url;

                function getPosition(str, m, i) {
                    return str.split(m, i).join(m).length;
                }

                var fileUrl = xd.substring(0, 8) + ip + xd.substring(getPosition(xd, ':', 2));
                console.log("file url "+fileUrl);
                soyut.Services.getInstance().getService("browserServer").generateSheetKey({}, function (err, data) {
                    initSheetEditor(data.key, data.vkey);
                    function initSheetEditor(docKey, docVkey) {
                        var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                            {
                                width: "100%",
                                height: "1000px",
                                documentType: "spreadsheet",
                                document: {
                                    title: files.name,
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
                                    location: documentServerUrl + "/web-apps/",
                                    customization: {
                                        about: false,
                                        logo: {
                                            image: 'https://' + browserService.origin + '/img/soyut.png'
                                        }
                                    }
                                }
                            });
                    }
                });

            });

        }
        else if (files.type == "application/vnd.ms-powerpoint") {
            browserService.getLocalIP({}, function (err, ip) {

                var xd = files.url;

                function getPosition(str, m, i) {
                    return str.split(m, i).join(m).length;
                }

                var fileUrl = xd.substring(0, 8) + ip + xd.substring(getPosition(xd, ':', 2));
                console.log("file url "+fileUrl);
                soyut.Services.getInstance().getService("browserServer").generatePresentationKey({}, function (err, data) {
                    initPresentationEditor(data.key, data.vkey);
                    function initPresentationEditor(docKey, docVkey) {
                        var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                            {
                                width: "100%",
                                height: "1000px",
                                documentType: "presentation",
                                document: {
                                    title: files.name,
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
                                    location: documentServerUrl + "/web-apps/",
                                    customization: {
                                        about: false,
                                        logo: {
                                            image: 'https://' + browserService.origin + '/img/soyut.png'
                                        }
                                    }
                                }
                            });
                    }
                });

            });
        }
        else if (files.type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {

            browserService.getLocalIP({}, function (err, ip){

                var xd = files.url;
                function getPosition(str, m, i) { return str.split(m, i).join(m).length; }

                var fileUrl = xd.substring(0, 8) + ip + xd.substring(getPosition(xd, ':', 2));
                console.log("file url "+fileUrl);
                soyut.Services.getInstance().getService("browserServer").generateDocxKey({}, function (err, data) {
                    initDocxEditor(data.key, data.vkey);


                        function initDocxEditor(docKey, docVkey) {
                            browserService.getDocServerUrl({}, function (err, server) {
                                var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                                    {
                                        width: "100%",
                                        height: "1000px",
                                        documentType: "text",
                                        document: {
                                            title: files.name,
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
        else if (files.type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            browserService.getLocalIP({}, function (err, ip){

                var xd = files.url;

                function getPosition(str, m, i) {
                    return str.split(m, i).join(m).length;
                }

                var fileUrl = xd.substring(0, 8) + ip + xd.substring(getPosition(xd, ':', 2));
                console.log("file url "+fileUrl);
                soyut.Services.getInstance().getService("browserServer").generateSheetxKey({}, function (err, data) {
                    initSheetxEditor(data.key, data.vkey);


                        function initSheetxEditor(docKey, docVkey) {
                            //debugger;
                            browserService.getDocServerUrl({}, function (err, server) {
                                //debugger;
                                var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                                    {
                                        width: "100%",
                                        height: "1000px",
                                        documentType: "spreadsheet",
                                        document: {
                                            title: files.name,
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
        else if (files.type == "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
            browserService.getLocalIP({}, function (err, ip){

                var xd = files.url;

                function getPosition(str, m, i) {
                    return str.split(m, i).join(m).length;
                }

                var fileUrl = xd.substring(0, 8) + ip + xd.substring(getPosition(xd, ':', 2));
                console.log("file url "+fileUrl);
                soyut.Services.getInstance().getService("browserServer").generatePresentationxKey({}, function (err, data) {
                    initPresentationxEditor(data.key, data.vkey);


                    function initPresentationxEditor(docKey, docVkey) {
                        browserService.getDocServerUrl({}, function (err, server) {
                        var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                            {
                                width: "100%",
                                height: "1000px",
                                documentType: "presentation",
                                document: {
                                    title: files.name,
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
    });