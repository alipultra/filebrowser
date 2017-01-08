var browserService = soyut.Services.getInstance().getService("browserServer");
soyut.Services.getInstance().getService("browserServer").getDocServerUrl({}, function (err, data) {

    var documentServerUrl = data;

    var frameEditor = $(getInstanceID("iframeEditor"));
    var frameEditorId = frameEditor.selector.split("#");

    var path = getParam('path');

    $(getInstanceID('tes')).html(path);

    function getIPs(callback){
        var ip_dups = {};

        //compatibility for firefox and chrome
        var RTCPeerConnection = window.RTCPeerConnection
            || window.mozRTCPeerConnection
            || window.webkitRTCPeerConnection;
        var useWebKit = !!window.webkitRTCPeerConnection;

        //bypass naive webrtc blocking using an iframe
        if(!RTCPeerConnection){
            //NOTE: you need to have an iframe in the page right above the script tag
            //
            //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
            //<script>...getIPs called in here...
            //
            var win = iframe.contentWindow;
            RTCPeerConnection = win.RTCPeerConnection
                || win.mozRTCPeerConnection
                || win.webkitRTCPeerConnection;
            useWebKit = !!win.webkitRTCPeerConnection;
        }

        //minimal requirements for data connection
        var mediaConstraints = {
            optional: [{RtpDataChannels: true}]
        };

        var servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};

        //construct a new RTCPeerConnection
        var pc = new RTCPeerConnection(servers, mediaConstraints);

        function handleCandidate(candidate){
            //match just the IP address
            var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
            var ip_addr = ip_regex.exec(candidate)[1];

            //remove duplicates
            if(ip_dups[ip_addr] === undefined)
                callback(ip_addr);

            ip_dups[ip_addr] = true;
        }

        //listen for candidate events
        pc.onicecandidate = function(ice){

            //skip non-candidate events
            if(ice.candidate)
                handleCandidate(ice.candidate.candidate);
        };

        //create a bogus data channel
        pc.createDataChannel("");

        //create an offer sdp
        pc.createOffer(function(result){

            //trigger the stun server request
            pc.setLocalDescription(result, function(){}, function(){});

        }, function(){});

        //wait for a while to let everything done
        setTimeout(function(){
            //read candidate info from local description
            var lines = pc.localDescription.sdp.split('\n');

            lines.forEach(function(line){
                if(line.indexOf('a=candidate:') === 0)
                    handleCandidate(line);
            });
        }, 1000);
    }

    fileSystem.stat(path, function (err, files) {
        console.log("load file "+files.name)

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

            soyut.Services.getInstance().getService("browserServer").generateDocKey({}, function (err, data) {
                initDocEditor(data.key, data.vkey);

                function initDocEditor(docKey, docVkey) {
                    var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                        {
                            width: "800px",
                            height: "800px",
                            documentType: "text",
                            document: {
                                title: files.name,
                                url: files.url,
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
        else if (files.type == "application/vnd.ms-excel") {

            soyut.Services.getInstance().getService("browserServer").generateSheetKey({}, function (err, data) {
                initSheetEditor(data.key, data.vkey);
                function initSheetEditor(docKey, docVkey) {
                    var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                        {
                            width: "800px",
                            height: "800px",
                            documentType: "spreadsheet",
                            document: {
                                title: files.name,
                                url: files.url,
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
        else if (files.type == "application/vnd.ms-powerpoint") {
            soyut.Services.getInstance().getService("browserServer").generatePresentationKey({}, function (err, data) {
                initPresentationEditor(data.key, data.vkey);
                function initPresentationEditor(docKey, docVkey) {
                    var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                        {
                            width: "800px",
                            height: "800px",
                            documentType: "presentation",
                            document: {
                                title: files.name,
                                url: files.url,
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
        else if (files.type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {

            getIPs(function(ip){

                var xd = files.url;
                function getPosition(str, m, i) { return str.split(m, i).join(m).length; }

                var fileUrl = xd.substring(0, 8) + ip + xd.substring(getPosition(xd, ':', 2));

                soyut.Services.getInstance().getService("browserServer").generateDocKey({}, function (err, data) {
                    initDocEditor(data.key, data.vkey);

                    function initDocEditor(docKey, docVkey) {
                        var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                            {
                                width: "800px",
                                height: "800px",
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
        else if (files.type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            getIPs(function(ip) {

                var xd = files.url;

                function getPosition(str, m, i) {
                    return str.split(m, i).join(m).length;
                }

                var fileUrl = xd.substring(0, 8) + ip + xd.substring(getPosition(xd, ':', 2));

                soyut.Services.getInstance().getService("browserServer").generateSheetKey({}, function (err, data) {
                    initSheetEditor(data.key, data.vkey);
                    function initSheetEditor(docKey, docVkey) {
                        var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                            {
                                width: "800px",
                                height: "800px",
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
        else if (files.type == "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
            getIPs(function(ip) {

                var xd = files.url;

                function getPosition(str, m, i) {
                    return str.split(m, i).join(m).length;
                }

                var fileUrl = xd.substring(0, 8) + ip + xd.substring(getPosition(xd, ':', 2));

                soyut.Services.getInstance().getService("browserServer").generatePresentationKey({}, function (err, data) {
                    initPresentationEditor(data.key, data.vkey);
                    function initPresentationEditor(docKey, docVkey) {
                        var docEditor = new DocsAPI.DocEditor(frameEditorId[1],
                            {
                                width: "800px",
                                height: "800px",
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
    });
});