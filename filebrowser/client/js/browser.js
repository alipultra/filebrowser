var browserService = soyut.Services.getInstance().getService("browserServer");
soyut.Services.getInstance().getService("browserServer").getDocServerUrl({}, function (err, data) {

    var documentServerUrl = data;

    $.getScript(documentServerUrl + '/web-apps/apps/api/documents/api.js');

    function p(c) {
        $(".breadcrumb").width() + c;
    }
    var contextActions = {
        copy: function (a) {
            browserService.FileAction_searchCopy({session: soyut.Session.id, role: soyut.Session.role.id}, function (err, data) {
                if(data.length > 0){
                    browserService.FileAction_updateCopy({
                        id: data[0].id,
                        path: a.dir+ a.name,
                        actions: 'copy',
                        type: a.type
                    }, function (err, msg) {
                        console.log(msg);
                        if (!err) {
                        }
                    })
                }
                else {
                    browserService.FileAction_copy({
                        session: soyut.Session.id,
                        role: soyut.Session.role.id,
                        path: a.dir + a.name,
                        actions: 'copy',
                        type: a.type
                    },function(err, msg) {
                        console.log(msg);
                        if (!err) {
                        }
                    })
                }
            })
        },
        cut: function (a) {
            browserService.FileAction_searchCopy({session: soyut.Session.id, role: soyut.Session.role.id}, function (err, data) {
                if(data.length > 0){
                    browserService.FileAction_updateCopy({
                        id: data[0].id,
                        path: a.dir+ a.name,
                        actions: 'cut',
                        type: a.type
                    }, function (err, msg) {
                        console.log(msg);
                        if (!err) {
                        }
                    })
                }
                else {
                    browserService.FileAction_copy({
                        session: soyut.Session.id,
                        role: soyut.Session.role.id,
                        path: a.dir + a.name,
                        actions: 'cut',
                        type: a.type
                    },function(err, msg) {
                        console.log(msg);
                        if (!err) {
                        }
                    })
                }
            })
        },
        paste: function (a) {
            browserService.FileAction_searchCopy({session: soyut.Session.id, role: soyut.Session.role.id}, function (err, data) {
                if (data.length > 0) {
                    if(data[0].type == 'file'){
                        var srcPath = data[0].path;
                        var n = srcPath.lastIndexOf('/');
                        var cpath = srcPath.substring(n + 1);
                        var tgtPath = a.dir + cpath;

                        if(data[0].actions == 'copy') {
                            fileSystem.cp(srcPath, tgtPath, function (err, result) {
                                if (!err) {
                                    browserService.FileAction_deleteAction({id: data[0].id}, function (err, del) {
                                        reloadFolder(a.dir);
                                    })
                                }
                            });
                        }
                        else {
                            fileSystem.mv(srcPath, tgtPath, function (err, result) {
                                if (!err) {
                                    browserService.FileAction_deleteAction({id: data[0].id}, function (err, del) {
                                        reloadFolder(a.dir);
                                    })
                                }
                            });
                        }
                    }
                    else {
                        console.log("copi folder ");
                    }
                }
            });
        },
        delete: function (a) {
            var path = a.dir + a.name;
            fileSystem.rm(path, function (err, result) {
                reloadFolder(a.dir);
            });
        },
        rename: function (a) {
            var app = getAppInstance();
            var activitylistener = getActivityInstanceAsync();
            activitylistener.then(function (activity) {
                app.launchActivity("soyut.module.browser.rename", {currentDir: a.dir, dir: a.name, type: a.type}, activity);
                activity.on('browser_renamed', function (activity) {
                    reloadFolder(activity.currentDir);
                })
            });
        },
        chmod: function (a) {
            h(a);
        },
        edit_text_file: function (a) {
            f(a);
        }
    };

    function loadFiletype(type) {
        switch (type) {
            case "text/plain":
                return 'txt';
            case "application/pdf":
                return 'pdf';
            case "video/mp4":
                return 'mp4';
            case "audio/mp3":
                return 'mp3';
            case "audio/mpeg":
                return 'mp3';
            case "application/msword":
                return 'doc';
            case "application/vnd.ms-excel":
                return 'xls';
            case "application/vnd.ms-powerpoint":
                return 'ppt';
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                return 'docx';
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                return 'xlsx';
            case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                return 'pptx';
            case "image/jpeg":
                return 'jpg';
            case "image/png":
                return 'png';
            default:
                return 'file';
        }
    }

    function reloadFolder(dir) {
        var resdir = dir.substr(0, dir.lastIndexOf("/"));
        var cresdir = resdir.substr(0, resdir.lastIndexOf("/"));
        var curFolder = '';
        if(cresdir!=''){
            curFolder = cresdir + '/';
        }
        else {
            curFolder = cresdir;
        }

        var n = resdir.lastIndexOf('/');
        var tgtFolder = resdir.substring(n + 1)+'/';

        app.LoadFolder(curFolder, tgtFolder);
    }

    function getFileExtension(fname) {
        var pos = fname.lastIndexOf(".");
        var strlen = fname.length;
        if (pos != -1 && strlen != pos + 1) {
            var ext = fname.split(".");
            var len = ext.length;
            var extension = true;
        } else {
            extension = false;
        }
        return extension;
    }

    function contextMenu(val){
        if(val.hasOwnProperty('isDirectory') || val.hasOwnProperty('isFile')){
            $.contextMenu({
                selector: "figure[data-name='" + val.name + "']",
                callback: function (key, options) {
                    var d = {};
                    var m = "clicked: " + key + " value " + $(this).attr('data-name');
                    d = {
                        "name": $(this).attr('data-name'),
                        "dir": $(this).attr('data-dir'),
                        "type" : $(this).attr('data-type')
                    };
                    contextActions[key](d);
                },
                items: {
                    "cut": {
                        name: "Cut",
                        icon: "cut"
                    },
                    "copy": {
                        name: "Copy",
                        icon: "copy"
                    },
                    "delete": {
                        name: "Delete",
                        icon: "delete"
                    },
                    "rename": {
                        name: "Rename",
                        icon: "rename"
                    },
                    "sep1": "---------",
                    "info": {
                        name: "Informasi",
                        icon: "info"
                    },
                    "name": {
                        name: val.name,
                        icon: "label"
                    },
                    "size": {
                        name: val.size,
                        icon: "size"
                    },
                    "type": {
                        name: loadFiletype(val.type),
                        icon: "preview"
                    }
                }
            });
        }
    }

    function loadMainContextMenu(val) {
        if(val != '') {
            $(".main-browser").contextMenu(true);
            $.contextMenu({
                selector: ".main-browser",
                callback: function (key, options) {
                    var d = {};
                    var m = "clicked: " + key + " value " + $(this).attr('data-dir');
                    d = {
                        "name" : $(this).attr('data-name'),
                        "dir" : $(this).attr('data-dir')
                    };
                    contextActions[key](d);
                },
                items: {
                    "paste": {
                        name: "Paste",
                        icon: "paste"
                    }
                }
            });
        }
        else {
            $(".main-browser").contextMenu(false);
        }
    }

    Vue.component('navigation', {
        template: '#nav-template',
        props:['navigations']
    });
    var app = new Vue({
        el: '#main-content',
        data: {
            files: '',
            curDir: '',
            dir: '',
            navigations: '',
            folderPng: 'https://' + browserService.origin + '/img/ico/folder.png',
            backPng: 'https://' + browserService.origin + '/img/ico/folder_back.png',
            txtPng: 'https://' + browserService.origin + '/img/ico/txt.jpg',
            pdfPng: 'https://' + browserService.origin + '/img/ico/pdf.jpg',
            mp4Png: 'https://' + browserService.origin + '/img/ico/mp4.jpg',
            mp3Png: 'https://' + browserService.origin + '/img/ico/mp3.jpg',
            docxPng: 'https://' + browserService.origin + '/img/ico/docx.jpg',
            xlsxPng: 'https://' + browserService.origin + '/img/ico/xlsx.jpg',
            pptxPng: 'https://' + browserService.origin + '/img/ico/pptx.jpg',
            devicePng: 'https://' + browserService.origin + '/img/ico/dmg.jpg',
            etcPng: 'https://' + browserService.origin + '/img/ico/default.jpg',
            cdir:'',
            bdir:''
        },
        methods: {
            loadServer: function () {
                $(getInstanceID('browser-loader')).fadeIn('fast');
                var _this = this;
                var menuPaste = '';

                fileSystem.ls('/', function (err, files) {
                    _this.$set(_this, 'curDir', '');
                    _this.$set(_this, 'dir', '');
                    _this.$set(_this, 'files', files);

                    loadMainContextMenu(menuPaste);
                    $(getInstanceID('browser-loader')).fadeOut('fast');
                });
            },
            LoadFolder: function (currentDir, i) {
                $(getInstanceID('browser-loader')).fadeIn('fast');
                var _this = this;
                var curdir = '';
                if (currentDir == '') {
                    curdir = '/';
                }
                else {
                    curdir = currentDir;
                }

                //console.log("load server "+curdir+i);
                _this.LoadNavigation(curdir, curdir+i);
                fileSystem.ls(curdir + i, function (err, files) {
                    _this.$set(_this, 'dir', i);
                    _this.$set(_this, 'curDir', curdir + i);

                    _this.$set(_this, 'files', files);
                    loadMainContextMenu(curdir + i);

                    $(getInstanceID('browser-loader')).fadeOut('fast');
                });
            },
            LoadFile: function (currentDir, i) {
                var _this = this;
                var dir = '';
                if (currentDir == '') {
                    dir = '/';
                }
                else {
                    dir = currentDir;
                }

                // load activity
                var app = getAppInstance();
                var activitylistener = getActivityInstanceAsync();
                activitylistener.then(function (activity) {
                    app.launchActivity("soyut.module.browser.viewer", {path: dir + i}, activity);
                })
            },
            BrowseMedia: function (currentDir, dir) {
                var _this = this;

                var app = getAppInstance();
                var activitylistener = getActivityInstanceAsync();
                activitylistener.then(function (activity) {
                    app.launchActivity("soyut.module.browser.media", {
                        currentDir: currentDir,
                        dir: dir
                    }, activity);
                    activity.on('media_selected', function (activity) {
                        var resdir = activity.currentDir.substr(0, activity.currentDir.lastIndexOf("/"));
                        var cresdir = resdir.substr(0, resdir.lastIndexOf("/"));
                        var targetFolder = '';
                        if(cresdir!=''){
                            targetFolder = cresdir + '/';
                        }
                        else {
                            targetFolder = cresdir;
                        }
                        _this.LoadFolder(targetFolder, activity.dir);
                    });
                });
            },
            LoadFolderForm: function (currentDir, dir) {
                var _this = this;

                var app = getAppInstance();
                var activitylistener = getActivityInstanceAsync();
                activitylistener.then(function (activity) {
                    app.launchActivity("soyut.module.browser.create.folder", {currentDir: currentDir, dir: dir}, activity);
                    activity.on('folder_created', function (activity) {
                        var resdir = activity.currentDir.substr(0, activity.currentDir.lastIndexOf("/"));
                        var cresdir = resdir.substr(0, resdir.lastIndexOf("/"));
                        var targetFolder = '';
                        if(cresdir!=''){
                            targetFolder = cresdir + '/';
                        }
                        else {
                            targetFolder = cresdir;
                        }
                        console.log("cur "+targetFolder+" tgt "+activity.dir);
                        _this.LoadFolder(targetFolder, activity.dir);
                    })
                });
            },
            LoadFileForm: function (currentDir, dir) {
                var _this = this;

                var app = getAppInstance();
                var activitylistener = getActivityInstanceAsync();
                activitylistener.then(function (activity) {
                    app.launchActivity("soyut.module.browser.create.file", {currentDir: currentDir, dir: dir}, activity);
                    activity.on('file_created', function (activity) {
                        var resdir = activity.currentDir.substr(0, activity.currentDir.lastIndexOf("/"));
                        var cresdir = resdir.substr(0, resdir.lastIndexOf("/"));
                        var targetFolder = '';
                        if(cresdir!=''){
                            targetFolder = cresdir + '/';
                        }
                        else {
                            targetFolder = cresdir;
                        }
                        console.log("cur "+targetFolder+" tgt "+activity.dir);
                        _this.LoadFolder(targetFolder, activity.dir);

                    })
                });

            },
            getParentFolder: function (curDir) {
                var _this = this;
                var resdir = curDir.substr(0, curDir.lastIndexOf("/"));
                var cresdir = resdir.substr(0, resdir.lastIndexOf("/"));
                var lastSlash = cresdir.lastIndexOf("/");

                var currentFolder = cresdir.substr(0, cresdir.lastIndexOf("/"));
                var targetFolder = cresdir.substring(lastSlash+1);
                var destFolder = '';
                if(targetFolder != ''){
                    destFolder = targetFolder + '/';
                }
                else {
                    destFolder = targetFolder;
                }
                var sourceFolder = '';
                if(currentFolder != ''){
                    sourceFolder = currentFolder + '/';
                }
                else {
                    sourceFolder = currentFolder;
                }

                _this.$set(_this, 'cdir', sourceFolder);
                _this.$set(_this, 'bdir', destFolder);
            },
            setBackButton: function (curDir, dir) {
                var _this = this;
                if(curDir == "" || curDir =="/"){
                    return false;
                }
                else {
                    return true;
                }
            },
            BackBrowser: function (curDir, dir) {
                var _this = this;
                if(curDir == "" && dir == ""){
                    _this.loadServer();
                }
                else {
                    _this.LoadFolder(curDir, dir);
                }
            },
            LoadNavigation: function (dir, curDir) {
                //console.log(dir+" cur "+curDir);
                var _this = this;
                var titleLink = _this.removeLastSlash(curDir);
                var textLink = _this.removeLastSlash(dir);
                var lsDir = titleLink.split('/');
                var fsDir = textLink.split('/');
                var nav = [];
                var mnav = [];
                for(var x = 0; x < lsDir.length; x++){
                    if(x>0){
                        var a = _this.checkArray(x, fsDir[x], titleLink);
                        nav.push({
                            title:lsDir[x],
                            link:a
                        });
                    }
                }
                //console.log(JSON.stringify(nav))
                var link = nav;
                _this.$set(_this, 'navigations', link);
            },
            removeLastSlash: function (val) {
                var lastChar = val.slice(-1);
                if (lastChar == '/') {
                    val = val.slice(0, -1);
                }
                return val;
            },
            checkArray: function(count, text, textLink){
                var _this = this;
                var fsDir = textLink.split('/');
                var textarray = "";
                for(var i = 0; i < count; i++){
                    if(fsDir[i]==""){
                        textarray = "";
                    }
                    else{
                        textarray += "/"+fsDir[i];
                    }
                }
                return textarray;
            },
            redirectBrowser: function (val) {
                var _this = this;
                var parentDir = '';
                if(val.link == ''){
                    parentDir = '/';
                }
                else {
                    parentDir = val.link+'/';
                }
                var targetFolder = val.title + '/';

                _this.LoadFolder(parentDir, targetFolder);
            },
            loadContextMenu: function(val){
                contextMenu(val)
            },
            loadMainAttribute: function (curDir) {
                var attr;
                attr = {
                    'data-name' : '',
                    'data-dir': curDir
                };
                return attr;
            },
            loadAttribute: function(val, curDir){
                var attr;
                attr = {
                    'data-name' : val,
                    'data-dir': curDir
                };
                return attr;
            },
            getFolderType: function(){
                var imgSrc = 'https://' + browserService.origin + '/img/ico/folder.png';
                return imgSrc;
            },
            loadFromServer: function (type, name) {
                if(type){
                    var devChar = name.substring(0,1);
                    if(devChar != ".") {
                        return true;
                    }
                }
                else {
                    return false;
                }
            },
            getFileName: function (name) {
                return name.substring(0, name.length-1);
            },
            getFileType: function (type) {
                switch (type) {
                    case "text/plain":
                        return 'txt';
                    case "application/pdf":
                        return 'pdf';
                    case "video/mp4":
                        return 'mp4';
                    case "audio/mp3":
                        return 'mp3';
                    case "audio/mpeg":
                        return 'mp3';
                    case "application/msword":
                        return 'doc';
                    case "application/vnd.ms-excel":
                        return 'xls';
                    case "application/vnd.ms-powerpoint":
                        return 'ppt';
                    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                        return 'docx';
                    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                        return 'xlsx';
                    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                        return 'pptx';
                    case "image/jpeg":
                        return 'jpg';
                    case "image/png":
                        return 'png';
                    default:
                        return 'file';
                }
            },
            getImageFile: function(img, url){
                switch (img) {
                    case "text/plain":
                        return 'https://' + browserService.origin + '/img/ico/txt.jpg';
                    case "application/pdf":
                        return 'https://' + browserService.origin + '/img/ico/pdf.jpg';
                    case "video/mp4":
                        return 'https://' + browserService.origin + '/img/ico/mp4.jpg';
                    case "audio/mp3":
                        return 'https://' + browserService.origin + '/img/ico/mp3.jpg';
                    case "audio/mpeg":
                        return 'https://' + browserService.origin + '/img/ico/mp3.jpg';
                    case "application/msword":
                        return 'https://' + browserService.origin + '/img/ico/docx.jpg';
                    case "application/vnd.ms-excel":
                        return 'https://' + browserService.origin + '/img/ico/xlsx.jpg';
                    case "application/vnd.ms-powerpoint":
                        return 'https://' + browserService.origin + '/img/ico/pptx.jpg';
                    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                        return 'https://' + browserService.origin + '/img/ico/docx.jpg';
                    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                        return 'https://' + browserService.origin + '/img/ico/xlsx.jpg';
                    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                        return 'https://' + browserService.origin + '/img/ico/pptx.jpg';
                    case "image/jpeg":
                        return url;
                    case "image/png":
                        return url;
                    default:
                        return 'https://' + browserService.origin + '/img/ico/default.jpg';
                }
            },
            ChangeBrowserView: function(attr, val){
                var _this = this;
                $(".view-controller button").removeClass('btn-inverse');
                $(".view-controller i").removeClass("icon-white");
                // //
                // var b = $(getInstanceID(attr));
                // b.addClass("btn-inverse");
                // b.find("i").addClass("icon-white");
                // var dataval = b.attr("data-value");

                _this.ChangeView(val);
            },
            ChangeView: function(a) {
                var _this = this;
                var viewStatus = $(getInstanceID('view-status')).val();
                $("ul.grid").removeClass('list-view' + viewStatus);
                var c = a;
                $(getInstanceID('view-status')).val(a);
                $("ul.grid").addClass("list-view" + c);
            },
        }
    });

    app.loadServer();
});

