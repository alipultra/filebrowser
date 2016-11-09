var browserService = soyut.Services.getInstance().getService("browserServer");
soyut.Services.getInstance().getService("browserServer").getDocServerUrl({}, function (err, data) {

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
    var contextActions = {
        copy: function (a) {
            var dir = '';
            if (a.dir == '') {
                dir = '/';
            }
            else {
                dir = a.dir + '/';
            }
            soyut.Services.getInstance().getService("browserServer").FileAction_searchCopy({session: soyut.Session.id, role: soyut.Session.role.id}, function (err, data) {
                if(data.length > 0){
                    soyut.Services.getInstance().getService("browserServer").FileAction_updateCopy({
                        id: data[0].id,
                        path: dir+ a.name
                    }, function (err, msg) {
                        console.log(msg);
                        if (!err) {
                        }
                    })
                }
                else {
                    soyut.Services.getInstance().getService("browserServer").FileAction_copy({
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
                activity.on('browser_renamed', function (activity) {
                    app.loadServer();
                })
            })
        },
        chmod: function (a) {
            h(a);
        },
        edit_text_file: function (a) {
            f(a);
        }
    }

    function reloadFolder(dir, target) {
        if(getFileExtension(target)){
            console.log("file")
            app.loadServer();
        }
        else {
            console.log("folder")
            app.loadServer();
        }
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
        if(val.hasOwnProperty('_id')){
            if(val.type != 'device'){
                    $.contextMenu({
                        selector: "figure[data-name='" + val.name + "']",
                        callback: function (key, options) {
                            var d = {};
                            var m = "clicked: " + key + " value " + $(this).attr('data-name');
                            d = {
                                "name": $(this).attr('data-name'),
                                "dir": $(this).attr('data-dir')
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
                            }
                        }
                    });
            }
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
                
                var files = fileSystem.ls('/');
                _this.$set(_this, 'curDir', '');
                _this.$set(_this, 'dir', '');
                _this.$set(_this, 'files', files);

                loadMainContextMenu(menuPaste);

                $(getInstanceID('browser-loader')).fadeOut('fast');
            },
            LoadFolder: function (currentDir, i) {
                $(getInstanceID('browser-loader')).fadeIn('fast');
                var _this = this;
                var dir = '';
                if (currentDir == '') {
                    dir = '/';
                }
                else {
                    dir = currentDir + '/';
                }

                _this.LoadNavigation(dir, dir+i);
                var files = fileSystem.ls(dir + i);
                _this.$set(_this, 'dir', i);
                _this.$set(_this, 'curDir', dir + i);

                var lsFile =[];                
                for (var x in files) {
                    if(files[x].info.hasOwnProperty('isLink')){
                        if(files[x].info.type != undefined){
                            if(files[x].info.source.hasOwnProperty('isDirectory')){     
                                if(files[x].info.source.isDirectory && !files[x].info.source.isFile){                       
                                    var dir = {};
                                    dir.contents = {};
                                    dir.info = {
                                        _id: '',
                                        type: files[x].info.source.type,
                                        name: files[x].info.source.name,
                                        size: files[x].info.source.size,
                                        path: files[x].info.source.path
                                    };
                                    lsFile.push(dir);
                                }
                                else {
                                    var devChar = files[x].info.source.name.substring(0,2);
                                    if(devChar != "._"){                
                                        var fileType = _this.getThumbFile(files[x].info.source.type);
                                        var file = {};
                                        file.contents = {};
                                        file.info = {
                                            _id: '',
                                            type: files[x].info.source.type,
                                            name: files[x].info.source.name,
                                            size: files[x].info.source.size,
                                            path: files[x].info.source.path,
                                            url: fileType
                                        };
                                        lsFile.push(file);
                                    }
                                }
                            }
                            else {
                                var devices = {};
                                devices.contents = {};
                                devices.info = {
                                    _id: '',
                                    type: 'device',
                                    name: files[x].info.source.name,
                                };
                                                    
                                lsFile.push(devices);
                            }                    
                        }    
                    }        
                    else{
                        var uchar = files[x].info.name.substring(0,2);
                        if(uchar != "._"){
                            lsFile.push(files[x]);
                        }
                    }
                }
                _this.$set(_this, 'files', lsFile);
                loadMainContextMenu(dir +i);

                $(getInstanceID('browser-loader')).fadeOut('fast');
            },
            LoadFile: function (currentDir, i) {
                var _this = this;
                var dir = '';
                if (currentDir == '') {
                    dir = '/';
                }
                else {
                    dir = currentDir + '/';
                }

                // load activity
                var app = getAppInstance();
                var activitylistener = getActivityInstanceAsync();
                activitylistener.then(function (activity) {
                    app.launchActivity("soyut.module.browser.viewer", {path: dir + i}, activity);
                })
            },
            LoadFolderForm: function (currentDir, dir) {
                var _this = this;
                var app = getAppInstance();
                var activitylistener = getActivityInstanceAsync();
                activitylistener.then(function (activity) {
                    app.launchActivity("soyut.module.browser.create.folder", {currentDir: currentDir, dir: dir}, activity);
                    activity.on('folder_created', function (activity) {
                        var fDir = activity.dir.split('/');
                        var dirLength = fDir[1].length;
                        var mdir = '';
                        if(dirLength > 0){
                            mdir = activity.dir + activity.currentDir;
                        }
                        var xDir = activity.currentDir.split('/');
                        //_this.LoadFolder(mdir, xDir[1]);
                        _this.loadServer();
                        console.log("ls "+mdir+","+xDir[1])
                    })
                });
            },
            LoadNavigation: function (dir, curDir) {
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
            setBackButton: function (curDir, dir) {
                var _this = this;
                if(curDir != ""){
                    return true;
                }
                else {
                    return false;
                }
            },
            getParentFolder: function (curDir, dir) {
                var _this = this;
                var resdir = curDir.substr(0, curDir.lastIndexOf("/"));
                var cresdir = _this.removeLastSlash(resdir);
                var lastSlash = cresdir.lastIndexOf("/");
                var currentFolder = resdir.substr(0, resdir.lastIndexOf("/"));
                var lastSlash = resdir.lastIndexOf("/");
                var targetFolder = resdir.substring(lastSlash+1);

                _this.$set(_this, 'cdir', currentFolder);
                _this.$set(_this, 'bdir', targetFolder);
            },
            redirectBrowser: function (val) {
                var _this = this;
                _this.LoadFolder(val.link, val.title);
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
            getThumbFile: function(data){
                var value = "";
                if(data == "image/jpeg" || data == "image/png" || data == "image/gif" || data == "image/svg"){
                    value = 'https://' + browserService.origin + '/img/ico/jpeg.jpg';
                }
                return value;
            },
            getFileType: function(data){
                switch (data) {
                    case "text/html":
                        return true;
                    case "application/x-msdos-program":
                        return true;
                    case "application/javascript":
                        return true;
                    default:
                        return false;
                }
            },
            getFolderType: function(data){
                var imgSrc = "";
                if(data.hasOwnProperty('_id')){
                    var imgSrc = 'https://' + browserService.origin + '/img/ico/folder.png';
                }
                else{    
                    var imgSrc = 'https://' + browserService.origin + '/img/ico/dmg.jpg';
                }
                return imgSrc;
            },
            ChangeBrowserView: function () {
                
            }
        }
    });

    app.loadServer();
});

