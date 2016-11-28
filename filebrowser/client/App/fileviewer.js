var browserService = soyut.Services.getInstance().getService("browserServer");
soyut.Services.getInstance().getService("browserServer").getDocServerUrl({}, function (err, data) {

    var documentServerUrl = data;

    $.getScript(documentServerUrl + '/web-apps/apps/api/documents/api.js');

    var frameEditor = $(getInstanceID("iframeEditor"));
    var frameEditorId = frameEditor.selector.split("#");

    var name = getParam('name');
    var url = getParam('url');
    var type = getParam('type');

    console.log(name+" - "+type+" - "+url)

    if (type == "application/pdf") {

        var html = "<iframe title=\"PDF\" src=\"" + url + "\" frameborder=\"1\" scrolling=\"auto\" height=\"800\" width=\"850\" ></iframe>";

        $('.content-data').html(html);
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

        soyut.Services.getInstance().getService("browserServer").generateDocKey({}, function (err, data) {
            initDocEditor(data.key, data.vkey);

            function initDocEditor(docKey, docVkey) {
                var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                    {
                        width: "800px",
                        height: "800px",
                        documentType: "text",
                        document: {
                            title: name,
                            url: url,
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

    }
    else if (type == "application/vnd.ms-excel") {

        soyut.Services.getInstance().getService("browserServer").generateSheetKey({}, function (err, data) {
            initSheetEditor(data.key, data.vkey);
            function initSheetEditor(docKey, docVkey) {
                var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                    {
                        width: "800px",
                        height: "800px",
                        documentType: "spreadsheet",
                        document: {
                            title: name,
                            url: url,
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

    }
    else if (type == "application/vnd.ms-powerpoint") {
        soyut.Services.getInstance().getService("browserServer").generatePresentationKey({}, function (err, data) {
            initPresentationEditor(data.key, data.vkey);
            function initPresentationEditor(docKey, docVkey) {
                var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                    {
                        width: "800px",
                        height: "800px",
                        documentType: "presentation",
                        document: {
                            title: name,
                            url: url,
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
    }
    else if (type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {

        soyut.Services.getInstance().getService("browserServer").generateDocxKey({}, function (err, data) {
            initDocxEditor(data.key, data.vkey);

            function initDocxEditor(docKey, docVkey) {
                var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                    {
                        width: "800px",
                        height: "800px",
                        documentType: "text",
                        document: {
                            title: name,
                            url: url,
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

    }
    else if (type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        soyut.Services.getInstance().getService("browserServer").generateSheetxKey({}, function (err, data) {
            initSheetxEditor(data.key, data.vkey);
            function initSheetxEditor(docKey, docVkey) {
                var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                    {
                        width: "800px",
                        height: "800px",
                        documentType: "spreadsheet",
                        document: {
                            title: name,
                            url: url,
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

    }
    else if (type == "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
        soyut.Services.getInstance().getService("browserServer").generatePresentationxKey({}, function (err, data) {
            initPresentationxEditor(data.key, data.vkey);
            function initPresentationxEditor(docKey, docVkey) {
                var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                    {
                        width: "800px",
                        height: "800px",
                        documentType: "presentation",
                        document: {
                            title: name,
                            url: url,
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
    }

});