var browserService = soyut.Services.getInstance().getService("browserServer");
soyut.Services.getInstance().getService("browserServer").getDocServerUrl({}, function (err, data) {

    var documentServerUrl = data;

    $.getScript(documentServerUrl + '/web-apps/apps/api/documents/api.js');

    $(".view-controller button").on("click", function () {
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
    }

    function p(c) {
        $(".breadcrumb").width() + c;
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

                var path = dir + i;
                var files = fileSystem.stats(path);

                var activity =  getActivityInstance();
                activity.context.invoke('loadfile_selected',files);
                activity.window.close();
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

