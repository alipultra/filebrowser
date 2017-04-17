var getCDir = getParam('currentDir');
var getDir = getParam('dir');

console.log("cur "+getCDir+" dir "+getDir);

var browserService = soyut.Services.getInstance().getService("browserServer");
soyut.Services.getInstance().getService("browserServer").getDocServerUrl({}, function (err, data) {

var app = getAppInstance();
var activitylistener = getActivityInstanceAsync();
    activitylistener.then(function (activity) {
        var documentServerUrl = data;

        $.getScript(documentServerUrl + '/web-apps/apps/api/documents/api.js');

        $(".view-controller button").on("click", function () {
            console.log("aaa")
            var b = $(this);

            $(".view-controller button").removeClass('btn-inverse');
            $(".view-controller i").removeClass("icon-white");
            b.addClass("btn-inverse");
            b.find("i").addClass("icon-white");

            var val = b.attr("data-value");
            ChangeView(val);

        });

        function ChangeView(a) {
            var viewStatus = $(getInstanceID('view-status')).val();
            $("ul.grid").removeClass('list-view' + viewStatus);
            var c = a;
            $(getInstanceID('view-status')).val(a);
            $("ul.grid").addClass("list-view" + c);
            console.log(a + " - " + viewStatus);
            /*
            $(".sorter-container").addClass("list-view" + c);
            if(a >= 1) {
            $("ul.grid li").css("width", 126);
            $("ul.grid figure").css("width", 122);
            }
            */
        }

        function p(c) {
            $(".breadcrumb").width() + c;
        }
        var contextDeviceActions = {
            import: function (a) {
                var sourcePath = a.dir + a.name;
                var targetPath = getCDir + a.name;

                fileSystem.mp_get(a.volume, sourcePath, targetPath, function(err, res){
                    //if(!err) {
                        ReloadImportSelected();
                    //}
                });
            },
            copy: function (a) {
                var dir = '';
                if (a.dir == '') {
                    dir = '/';
                }
                else {
                    dir = a.dir + '/';
                }
                browserService.FileAction_searchCopy({session: soyut.Session.id, role: soyut.Session.role.id}, function (err, data) {
                    if(data.length > 0){
                        browserService.FileAction_updateCopy({
                            id: data[0].id,
                            path: dir+ a.name
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
                            path: dir+ a.name,
                            actions: 'copy'

                        },function(err, msg) {
                            console.log(msg);
                            if (!err) {
                            }
                        })
                    }
                })
            },
            cut: function (a) {
                //l(a, "cut");
                console.log(a);
            },
            paste: function (a) {
                var dir = '';
                if (a.dir == '') {
                    dir = '/';
                }
                else {
                    dir = a.dir + '/';
                }
                soyut.Services.getInstance().getService("browserServer").FileAction_searchCopy({session: soyut.Session.id, role: soyut.Session.role.id}, function (err, data) {
                    if (data.length > 0) {
                        fileSystem.cp(data[0].path, dir + a.name);
                        app.loadServer();
                    }
                });
            },
            delete: function (a) {
                var dir = '';
                if (a.dir == '') {
                    dir = '/';
                }
                else {
                    dir = a.dir + '/';
                }
                fileSystem.rm(dir + a.name);
                reloadFolder(dir, a.name);
            },
            rename: function (a) {
                var app = getAppInstance();
                var activitylistener = getActivityInstanceAsync();
                activitylistener.then(function (activity) {
                    app.launchActivity("soyut.module.browser.rename.", {dir: a.dir, name: a.name}, activity);
                    function browserRenamed() {
                        activity.unbind('browser_renamed', browserRenamed);
                        app.loadServer();
                    }
                    activity.on('browser_renamed', browserRenamed);
                })
            },
            chmod: function (a) {
                h(a);
            },
            edit_text_file: function (a) {
                f(a);
            }
        }

        function reloadFolder(dir) {
            // var directory = {
            //     "currentDir": currentDir,
            //     "dir": dir
            // };
            //
            // var activity = getActivityInstance();
            // activity.context.invoke('folder_created', directory);
            // activity.window.close();
        }

        function ReloadImportSelected() {
            var directory = {
                "currentDir": getCDir,
                "dir": getDir
            };

            activity.context.invoke('media_selected', directory);
            activity.window.close();
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

        function deviceContextMenu(val){
            if(val.hasOwnProperty('isDirectory') || val.hasOwnProperty('isFile')){
                var curVal = val.name.replace("'","&nbps;");
                
                $.contextMenu({
                    selector: "figure[data-path='" + curVal + "']",
                    callback: function (key, options) {
                        var d = {};
                        var m = "clicked: " + key + " value " + $(this).attr('data-name');
                        d = {
                            "name": $(this).attr('data-name'),
                            "dir": $(this).attr('data-dir'),
                            "volume": $(this).attr('data-volume')
                        };
                        contextDeviceActions[key](d);
                    },
                    items: {
                        "import": {
                            name: "Import",
                            icon: "import"
                        },
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
                        "sep1": "---------",
                        "info": {
                            name: "Informasi",
                            icon: "info"
                        }
                    }
                });
            }
        }

        function loadDeviceContextMenu(val) {
            if(val != '') {
                $(".media-browser").contextMenu(true);
                $.contextMenu({
                    selector: ".media-browser",
                    callback: function (key, options) {
                        var d = {};
                        var m = "clicked: " + key + " value " + $(this).attr('data-dir');
                        d = {
                            "name" : $(this).attr('data-name'),
                            "path" : $(this).attr('data-path'),
                            "dir" : $(this).attr('data-dir')
                        };
                        contextDeviceActions[key](d);
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
                $(".media-browser").contextMenu(false);
            }
        }

        Vue.component('navigation', {
            template: '#nav-template',
            props:['navigations']
        });
        var app = new Vue({
            el: '#media-content',
            data: {
                files: '',
                curDir: '',
                dir: '',
                volumes: '',
                navigations: '',
                folderPng: 'https://' + browserService.origin + '/img/ico/folder.png',
                backPng: 'https://' + browserService.origin + '/img/ico/folder_back.png',
                cdir:'',
                bdir:''
            },
            methods: {
                loadServer: function () {
                    $(getInstanceID('browser-loader')).fadeIn('fast');
                    var _this = this;
                    var menuPaste = '';

                    var files = [];
                    var volumes = fileSystem.mp_list;
                    volumes.forEach(function (ls) {
                        var n = ls.lastIndexOf('/');
                        var name = ls.substring(n + 1);

                        var dir = {
                            isDirectory: false,
                            isFile: false,
                            isDevice: true,
                            name: name,
                            path: ls,
                            size:0,
                            type: "device"
                        };
                        files.push(dir);
                    });

                    _this.$set(_this, 'curDir', '');
                    _this.$set(_this, 'navigations', '');
                    _this.$set(_this, 'dir', '');
                    _this.$set(_this, 'files', files);

                    loadDeviceContextMenu(menuPaste);
                    $(getInstanceID('browser-loader')).fadeOut('fast');
                },
                LoadFolder: function (volume, currentDir, i) {
                    $(getInstanceID('browser-loader')).fadeIn('fast');
                    var _this = this;
                    var curdir = '';
                    if (currentDir == '') {
                        curdir = '/';
                    }
                    else {
                        curdir = currentDir;
                    }
                    var dir = '';
                    if(i!= ''){
                        dir = i + '/';
                    }
                    else {
                        dir = i;
                    }

                    _this.LoadNavigation(volume, curdir, curdir+dir);
                    fileSystem.mp_ls(volume, curdir + dir, function (err, files) {
                        _this.$set(_this, 'volumes', volume);
                        _this.$set(_this, 'dir', dir);
                        _this.$set(_this, 'curDir', curdir + dir);

                        _this.$set(_this, 'files', files);
                        loadDeviceContextMenu(curdir + dir);

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
                        //app.launchActivity("soyut.module.browser.viewer", {path: dir + i}, activity);
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
                    });
                },
                LoadFolderForm: function (currentDir, dir) {
                    var _this = this;

                    var resdir = currentDir.substr(0, currentDir.lastIndexOf("/"));
                    var cresdir = resdir.substr(0, resdir.lastIndexOf("/"));

                    var currentFolder = cresdir.substr(0, cresdir.lastIndexOf("/"));

                    var app = getAppInstance();
                    var activitylistener = getActivityInstanceAsync();
                    activitylistener.then(function (activity) {
                        app.launchActivity("soyut.module.browser.create.folder", {currentDir: currentDir, dir: dir}, activity);
                        function folderCreated(evtData) {
                            activity.unbind('folder_created', folderCreated);
                            var resdir = evtData.currentDir.substr(0, evtData.currentDir.lastIndexOf("/"));
                            var cresdir = resdir.substr(0, resdir.lastIndexOf("/"));
                            var targetFolder = '';
                            if(cresdir!=''){
                                targetFolder = cresdir + '/';
                            }
                            else {
                                targetFolder = cresdir;
                            }
                            _this.LoadFolder(targetFolder, evtData.dir);
                        }
                        activity.on('folder_created', folderCreated);
                    });
                },
                getParentFolder: function (curDir) {
                    var _this = this;

                    var resdir = curDir.substr(0, curDir.lastIndexOf("/"));
                    var cdir = resdir.substr(0, resdir.lastIndexOf("/"));
                    var msum = cdir.substr(0, cdir.lastIndexOf("/")+1);

                    var n = cdir.lastIndexOf('/');
                    var targetFolder = cdir.substring(n + 1);

                    var parentFolder = '';
                    if(n < 0){
                        if(resdir == ''){
                            parentFolder = '';
                        }
                        else{
                            parentFolder = '/'
                        }
                    }
                    else{
                        parentFolder = msum;
                    }

                    _this.$set(_this, 'cdir', parentFolder);
                    _this.$set(_this, 'bdir', targetFolder);
                },
                setBackButton: function (curDir, dir) {
                    var _this = this;
                    if(curDir == ""){
                        return false;
                    }
                    else {
                        return true;
                    }
                },
                BackBrowser: function (volumes, curDir, dir) {
                    var _this = this;
                    if(curDir == "" && dir == ""){
                        _this.loadServer();
                    }
                    else {
                        _this.LoadFolder(volumes, curDir, dir);
                    }
                },
                LoadNavigation: function (volume, dir, curDir) {
                    //console.log(dir+" cur "+curDir);
                    var _this = this;
                    var titleLink = _this.removeLastSlash(curDir);
                    var textLink = _this.removeLastSlash(dir);
                    var lsDir = titleLink.split('/');
                    var fsDir = textLink.split('/');
                    var nav = [];

                    var n = volume.lastIndexOf('/');
                    var medianame = volume.substring(n + 1);
                    nav.push({
                        volume: volume,
                        title: medianame,
                        link: ''
                    });

                    for(var x = 0; x < lsDir.length; x++){
                        if(x>0){
                            var a = _this.checkArray(x, fsDir[x], titleLink);
                            nav.push({
                                volume: volume,
                                title:lsDir[x],
                                link:a
                            });
                        }
                    }
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

                    var n = val.volume.lastIndexOf('/');
                    var medianame = val.volume.substring(n + 1);

                    var parentDir = '';
                    if(val.link == ''){
                        parentDir = '/';
                    }
                    else {
                        parentDir = val.link+'/';
                    }
                    var targetFolder = '';
                    if(medianame == val.title) {
                        targetFolder = '';
                    }
                    else {
                        targetFolder = val.title;
                    }

                    _this.LoadFolder(val.volume, parentDir, targetFolder);
                },
                getDeviceContextMenu: function(val){
                    deviceContextMenu(val)
                },
                loadMainAttribute: function (curDir) {
                    var attr;
                    attr = {
                        'data-name' : '',
                        'data-dir': curDir
                    };
                    return attr;
                },
                loadAttribute: function(val, curDir, volume){
                    var curVal = val.replace("'",'&nbsp;');

                    var attr;
                    attr = {
                        'data-name' : curVal,
                        'data-path' : curVal,
                        'data-dir': curDir,
                        'data-volume': volume
                    };
                    return attr;
                },
                loadFromDevice: function (type, name) {
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
                getFolderType: function(){
                    var imgSrc = 'https://' + browserService.origin + '/img/ico/folder.png';
                    return imgSrc;
                },
                getDeviceType: function(){
                    var imgSrc = 'https://' + browserService.origin + '/img/ico/dmg.jpg';
                    return imgSrc;
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
});

