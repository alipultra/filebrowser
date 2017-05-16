var curUrl = soyut.browser.origin.split(':');
soyut.browser.getDocServerUrl({}, function (err, docserver) {
    var documentServerUrl = docserver;
    var vm;
    var app = getAppInstance();

    soyut.browser.initFilterComponent = function () {
        function p(c) {
            var d = $(".breadcrumb").width() + c;
            var e = $("#view");
            var f = $("#help");

            if ($(".uploader").css("width", d), e.val() > 0) {
                if (1 == e.val()) $("ul.grid li, ul.grid figure").css("width", "100%"); else {
                    var g = Math.floor(d / 380);
                    0 == g && (g = 1, $("h4").css("font-size", 12)), d = Math.floor(d / g - 3), $("ul.grid li, ul.grid figure").css("width", d);
                }
                f.hide();
            } else
                f.show();
        }

        $(".view-controller button").on("click", function() {
            var current = $(this);
            $(".view-controller button").removeClass("btn-inverse");
            $(".view-controller i").removeClass("icon-white");
            current.addClass("btn-inverse");
            current.find("i").addClass("icon-white");

            var c = current.attr("data-value");
            var curView = $(getInstanceID("view-browser")).val();
            $("ul.grid").removeClass('list-view' + curView);
            $(getInstanceID("view-browser")).val(c);
            $("ul.grid").addClass("list-view" + c);
        });

        $(".close-uploader").on("click", function() {
            $(getInstanceID("media-container")).hide(500);
            $(".modal-browser").html('');
        });

        $(".create-file-btn").on("click", function() {
            $(getInstanceID("media-container")).show(500);
            soyut.browser.showCreateFile();
        });

        $(".new-folder-btn").on("click", function() {
            $(getInstanceID("media-container")).show(500);
            soyut.browser.showCreateFolder();
        });
    };

    soyut.browser.showCreateFile = function () {
        var volume = $('.volume-browser').val();
        if(volume != 0) {
            soyut.browser.showModalBrowser('warning', 'Anda tidak dapat membuat file di media!')
        }
        else {
            var html = '<div class="modal-header">' +
                '<h3 class="modal-title">Buat File</h3>' +
                '</div>' +
                '<div class="modal-body">' +
                '<form>' +
                '<label class="input-block-level">Nama</label>' +
                '<input type="text" id="browser-create-file-name" name="browser-create-file-name" class="input-block-level browser-create-file-name" placeholder="">' +
                '<label class="input-block-level">Tipe</label>' +
                '<select id="browser-create-file-type" class="browser-create-file-type" name="browser-create-file-type">' +
                '<option value="docx">Word</option>' +
                '<option value="xlsx">Excel</option>' +
                '<option value="pptx">Power Point</option>' +
                '</select>' +
                '</form>' +
                '</div>' +
                '<div class="modal-footer">' +
                '<button type="button" class="btn btn-create-file-cancel"> Batal</button>' +
                '<button type="button" class="btn btn-primary btn-create-file-confirm">Simpan</button>' +
                '</div>';
            $('.modal-browser').html(html);

            $(".btn-create-file-cancel").on('click').click(function () {
                soyut.browser.closeModalWindow();
            });
            $(".btn-create-file-confirm").on('click').click(function () {
                var name = $(".browser-create-file-name").val();
                if (name != '') {
                    soyut.browser.createFiles();
                }
                else {
                    $(".browser-create-file-name").addClass('input-error');
                    return false;
                }
            });
        }
    };

    soyut.browser.createFiles = function () {
        var name = $(".browser-create-file-name").val();
        var filetype = $(".browser-create-file-type").val();
        var curdir = $(getInstanceID('curdir-browser')).val();

        var targetdir = curdir + name +"."+filetype;
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

        var dataurl = '';
        if(filetype == "docx") {
            dataurl = 'https://'+ soyut.browser.origin +'/files/new.docx';
        }
        else if(filetype == "xlsx"){
            dataurl = 'https://'+ soyut.browser.origin +'/files/new.xlsx';
        }
        else if(filetype == "pptx"){
            dataurl = 'https://'+ soyut.browser.origin +'/files/new.pptx';
        }

        soyut.storage.getStorageKeyAsync({userId: fileSystem.userid}).then(function(storageKey) {
            var storagePath = targetdir;
            var fileUrl = 'https://'+ curUrl[0] +':5454/storage/' + storageKey + '/' + storagePath;

            function getPosition(str, m, i) { return str.split(m, i).join(m).length; }

            var safeUrl = dataurl.substring(0, 8) + curUrl[0] + dataurl.substring(getPosition(dataurl, ':', 2));

            // debugger;
            getFile(safeUrl, function(err, dataBuffer) {
                if (err) return;
                soyut.storage.putAsync({
                    storageKey: storageKey,
                    path: storagePath,
                    dataBuffer: dataBuffer
                }).then(function() {

                    soyut.browser.closeModalWindow();
                    soyut.browser.refreshBrowser();

                });
            });

        });


    };

    soyut.browser.showCreateFolder = function () {
        var volume = $('.volume-browser').val();
        if(volume != 0) {
            soyut.browser.showModalBrowser('warning', 'Anda tidak dapat membuat folder di media!')
        }
        else {
            var html = '<div class="modal-header">' +
                '<h3 class="modal-title">Buat Folder</h3>' +
                '</div>' +
                '<div class="modal-body">' +
                '<form>' +
                '<label class="input-block-level">Nama</label>' +
                '<input type="text" id="browser-create-folder-name" name="browser-create-folder-name" class="input-block-level browser-create-folder-name" placeholder="">' +
                '</form>' +
                '</div>' +
                '<div class="modal-footer">' +
                '<button type="button" class="btn btn-create-folder-cancel"> Batal</button>' +
                '<button type="button" class="btn btn-primary btn-create-folder-confirm">Simpan</button>' +
                '</div>';
            $('.modal-browser').html(html);

            $(".btn-create-folder-cancel").on('click').click(function () {
                soyut.browser.closeModalWindow();
            });
            $(".btn-create-folder-confirm").on('click').click(function () {
                var name = $(".browser-create-folder-name").val();
                if (name != '') {
                    soyut.browser.createFolder();
                }
                else {
                    $(".browser-create-folder-name").addClass('input-error');
                    return false;
                }
            });
        }
    };

    soyut.browser.createFolder = function () {
        var name = $(".browser-create-folder-name").val();
        var curdir = $(getInstanceID('curdir-browser')).val();

        var targetdir = curdir + name

        fileSystem.mkdir(targetdir, function (err, res) {

        });
        soyut.browser.closeModalWindow();
    };

    soyut.browser.selectDevices = function (val) {
        console.log("Load File: "+ val);
        $('.volume-browser').val(val);
        soyut.browser.initFileList('.file-browser', val, '', '');
    };

    soyut.browser.initTooltip = function () {
        $(".tip").tooltip({
            placement: "bottom"
        }), $(".tip-top").tooltip({
            placement: "top"
        }), $(".tip-left").tooltip({
            placement: "left"
        }), $(".tip-right").tooltip({
            placement: "right"
        });
    };

    soyut.browser.initSorting = function () {
        $("input[name=radio-sort]").on("click", function() {
            var dItem = $(this).attr("data-item");
            var selItem = $("#" + dItem);
            var fItem = $(".filters label");

            fItem.removeClass("btn-inverse");
            fItem.find("i").removeClass("icon-white");
            $(".filter-input").val("");
            selItem.addClass("btn-inverse");
            selItem.find("i").addClass("icon-white");

            $(this).is(":checked") && $(".grid li").not("." + dItem).hide(300);
            $(".grid li." + dItem).show(300);

            if("ff-item-type-all" == dItem) {
                $(".grid li").show(300);
            }
        });

        $(".filter-input").on("keyup", function() {
            $(".filters label").removeClass("btn-inverse");
            $(".filters label").find("i").removeClass("icon-white");
            $("#ff-item-type-all").addClass("btn-inverse");
            $("#ff-item-type-all").find("i").addClass("icon-white");
            var searchString = $(this).val().toLowerCase();
            $(this).val(searchString);
            $("li", "ul.grid ").each(function() {
                var selectedObj = $(this);
                "" != searchString && -1 == selectedObj.attr("data-name").toLowerCase().indexOf(searchString) ? selectedObj.hide(100) : selectedObj.show(100);
            });
        });
    };

    soyut.browser.removeLastSlash = function(val) {
        var lastChar = val.slice(-1);
        if (lastChar == '/') {
            val = val.slice(0, -1);
        }
        return val;
    };

    soyut.browser.checkArray = function(count, text, textLink){
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
    };

    soyut.browser.initNavigationComponent = function () {
        $(getInstanceID('nav-browser')).html('');
        var html = '<li class="pull-left"><a onclick="soyut.browser.returnHome()" href="#"><i class="icon-home"></i></a></li>';

        var curdir = $(getInstanceID('curdir-browser')).val();
        var dir = $(getInstanceID('dir-browser')).val();

        var titleLink = soyut.browser.removeLastSlash(curdir);
        var textLink = soyut.browser.removeLastSlash(dir);
        var lsDir = titleLink.split('/');
        var fsDir = textLink.split('/');
        var nav = [];
        for(var x = 0; x < lsDir.length; x++){
            if(x>0){
                var a = soyut.browser.checkArray(x, fsDir[x], titleLink);
                nav.push({
                    title:lsDir[x],
                    link:a
                });
            }
        }

        nav.forEach(function (i) {
            var activeClass = '';
            if(i.title != textLink){
                activeClass = 'class="text-blue"';
            }
            html += '<li><a href="#" '+activeClass+' onclick="soyut.browser.redirectBrowser(\'' + i.link + '\', \'' + i.title + '\')">'+ i.title +'</a></li>';
        });
        html += '<li><span class="divider"></span></li>'
        html += '<li class="pull-right"><a onclick="soyut.browser.refreshBrowser()" class="btn-small" href="#"><i class="icon-refresh"></i></a></li>';
        $(getInstanceID('nav-browser')).append(html);
    };

    soyut.browser.redirectBrowser = function (url, target) {
        var volume = $('.volume-browser').val();
        var parentDir = '';
        if(url == ''){
            parentDir = '/';
        }
        else {
            parentDir = url + '/';
        }
        var targetDir = target + '/';

        soyut.browser.initFileList('.file-browser', volume, parentDir, targetDir);
    };

    soyut.browser.initSortingComponent = function () {
        $(getInstanceID('sorting-component')).html('');
        var html = '<span>Filters : </span>' +
            '<input id="select-type-1" name="radio-sort" type="radio" data-item="ff-item-type-1" checked="checked" class="hide"  />' +
            '<label id="ff-item-type-1" title="Files" for="select-type-1" class="tip btn ff-label-type-1"><i class="icon-file"></i></label>' +
            '<input id="select-type-2" name="radio-sort" type="radio" data-item="ff-item-type-2" class="hide"/>' +
            '<label id="ff-item-type-2" title="Images" for="select-type-2" class="tip btn ff-label-type-2"><i class="icon-picture"></i></label>' +
            '<input id="select-type-3" name="radio-sort" type="radio" data-item="ff-item-type-3" class="hide"  />' +
            '<label id="ff-item-type-3" title="Archives" for="select-type-3" class="tip btn ff-label-type-3"><i class="icon-inbox"></i></label>' +
            '<input id="select-type-4" name="radio-sort" type="radio" data-item="ff-item-type-4" class="hide"  />' +
            '<label id="ff-item-type-4" title="Videos" for="select-type-4" class="tip btn ff-label-type-4"><i class="icon-film"></i></label>' +
            '<input id="select-type-5" name="radio-sort" type="radio" data-item="ff-item-type-5" class="hide"  />' +
            '<label id="ff-item-type-5" title="Music" for="select-type-5" class="tip btn ff-label-type-5"><i class="icon-music"></i></label>' +
            '<input accesskey="f" type="text" class="filter-input" id="filter-input" name="filter" placeholder="filter..." value=""/>' +
            '<input id="select-type-all" name="radio-sort" type="radio" data-item="ff-item-type-all" class="hide"  />' +
            '<label id="ff-item-type-all" title="All" data-item="ff-item-type-all" for="select-type-all" style="margin-rigth:0px;" class="tip btn btn-inverse ff-label-type-all"><i class="icon-remove icon-white"></i></label>';
        $(getInstanceID('sorting-component')).append(html);
    };

    soyut.browser.loadFileType = function(type) {
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
            case "directory":
                return 'folder';
            default:
                return 'file';
        }
    };

    soyut.browser.formatBytes = function(bytes, si) {
        var thresh = si ? 1000 : 1024;
        if(Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }
        var units = si
            ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
            : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
        var u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while(Math.abs(bytes) >= thresh && u < units.length - 1);
        return bytes.toFixed(1)+' '+units[u];
    };

    soyut.browser.clearActionMenu = function () {
        $(getInstanceID("cm-file")).val('');
        $(getInstanceID("cm-dir")).val('');
        $(getInstanceID("cm-type")).val('');
        $(getInstanceID("cm-drive")).val('');
        $(getInstanceID("cm-action")).val('');
        soyut.browser.loadActionContextMenu('');
    };

    var contextActions = {
        cut: function (a) {
            var file = a.file;
            var dir = a.dir;
            var type = a.type;
            var drive = $(".volume-browser").val();
            var action = 'cut';
            $(getInstanceID("cm-file")).val(file);
            $(getInstanceID("cm-dir")).val(dir);
            $(getInstanceID("cm-type")).val(type);
            $(getInstanceID("cm-drive")).val(drive);
            $(getInstanceID("cm-action")).val(action);

            soyut.browser.loadActionContextMenu(action);

        },
        copy: function (a) {
            var file = a.file;
            var dir = a.dir;
            var type = a.type;
            var drive = $(".volume-browser").val();
            var action = 'copy';
            $(getInstanceID("cm-file")).val(file);
            $(getInstanceID("cm-dir")).val(dir);
            $(getInstanceID("cm-type")).val(type);
            $(getInstanceID("cm-drive")).val(drive);
            $(getInstanceID("cm-action")).val(action);

            soyut.browser.loadActionContextMenu(action);
            console.log(action+" file: "+file);
        },
        delete: function (a) {
            $(getInstanceID("media-container")).show(500);
            soyut.browser.showDeleteConfirmation(a);
        },
        rename: function (a) {
            $(getInstanceID("media-container")).show(500);
            soyut.browser.showRenameDialog(a);
        },
        paste: function (a) {
            var curdir = $(getInstanceID('curdir-browser')).val();
            var volume = $(".volume-browser").val();
            var cmfile = $(getInstanceID("cm-file")).val();
            var cmdir = $(getInstanceID("cm-dir")).val();
            var cmtype = $(getInstanceID("cm-type")).val();
            var cmdrive = $(getInstanceID("cm-drive")).val();
            var cmaction = $(getInstanceID("cm-action")).val();

            var srcPath = cmdir + cmfile;
            var tgtPath = curdir + cmfile;
            if(cmdrive == 0) {
                if(cmtype == 'file') {
                    if (cmaction == 'copy') {
                        fileSystem.cp(srcPath, tgtPath, function (err, result) {
                            if (!err) {
                                console.log("copy file");
                                soyut.browser.clearActionMenu();
                            }
                        });
                    }
                    else {
                        fileSystem.mv(srcPath, tgtPath, function (err, result) {
                            if (!err) {
                                console.log("move file");
                                soyut.browser.clearActionMenu();
                            }
                        });
                    }
                }
                else {
                    if (cmaction == 'copy') {
                        fileSystem.cpdir(srcPath, tgtPath, function (err, result) {
                            if (!err) {
                                console.log("copy folder");
                                console.log(result);
                                soyut.browser.clearActionMenu();
                            }
                        });
                    }
                    else {
                        fileSystem.mvdir(srcPath, tgtPath, function (err, result) {
                            if (!err) {
                                console.log("move folder");
                                console.log(result);
                                soyut.browser.clearActionMenu();
                            }
                        });
                    }
                }
            }
        },
        newfile: function (a) {
            $(getInstanceID("media-container")).show(500);
            soyut.browser.showCreateFile();
        }
    };

    soyut.browser.showRenameDialog = function (data){
        var html = '<div class="modal-header">' +
            '<h3 class="modal-title">Ubah  '+ data.file +'?</h3>' +
            '</div>' +
            '<div class="modal-body">' +
            '<form>' +
            '<label class="input-block-level">Nama</label>' +
            '<input type="text" id="browser-file-name" name="browser-file-name" class="input-block-level browser-file-name" placeholder="">' +
            '</form>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-rename-cancel"> Batal</button>' +
            '<button type="button" class="btn btn-primary btn-rename-confirm">Simpan</button>' +
            '</div>';
        $('.modal-browser').html(html);

        $(".btn-rename-cancel").on('click').click(function () {
            soyut.browser.closeModalWindow();
        });
        $(".btn-rename-confirm").on('click').click(function () {
            var name = $(".browser-file-name").val();
            if(name != ''){
                soyut.browser.renameFiles(data);
            }
            else {
                $(".browser-file-name").addClass('input-error');
                return false;
            }
        });
    };

    soyut.browser.renameFiles = function (data) {
        var changeName = $(".browser-file-name").val();
        var ext = data.file.split('.').pop();
        var sourcedir = data.dir + data.file;
        var targetdir = data.dir + changeName+"."+ext;
        if(data.type == 'file') {
            fileSystem.mv(sourcedir, targetdir, function (err, res) {

            });
            console.log("file: "+ sourcedir+" to "+targetdir);
        }
        else {
            fileSystem.mvdir(sourcedir, targetdir, function (err, res) {

            });
            console.log("dir: "+ sourcedir+" to "+targetdir);
        }
        soyut.browser.closeModalWindow();
    };

    soyut.browser.showDeleteConfirmation = function (data) {
        var html = '<div class="modal-header">' +
                        '<h3 class="modal-title">Perhatian!</h3>' +
                    '</div>' +
                    '<div class="modal-body">Apa anda yakin akan menghapus '+ data.file +'?</div>' +
                    '<div class="modal-footer">' +
                        '<button type="button" class="btn btn-delete-cancel"> Batal</button>' +
                        '<button type="button" class="btn btn-primary btn-delete-confirm">YA</button>' +
                    '</div>';
        $('.modal-browser').html(html);

        $(".btn-delete-cancel").on('click').click(function () {
            soyut.browser.closeModalWindow();
        });
        $(".btn-delete-confirm").on('click').click(function () {
            soyut.browser.deleteFiles(data);
        });
    };

    soyut.browser.closeModalWindow = function () {
        $(getInstanceID("media-container")).hide(500);
        $(".modal-browser").html('');
    };

    soyut.browser.deleteFiles = function (data) {
        var path = data.dir + data.file;
        if(data.type == 'file') {
            fileSystem.rm(path, function (err, result) {
                //reloadFolder(a.dir);
            });
            console.log("file: "+ path);
        }
        else {
            fileSystem.rmdir(path, function (err, result) {
                //reloadFolder(a.dir);
            });
            console.log("dir: "+ path);
        }
        soyut.browser.closeModalWindow();
    };

    soyut.browser.loadContextMenu = function (name, isFile, isDirectory, type, size) {
        var volume = $(".volume-browser").val();
        var menu = {};
        if(volume == 0){
            menu = {
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
                    name: name,
                    icon: "info"
                },
                "name": {
                    name: soyut.browser.loadFileType(type),
                    icon: "label"
                },
                "size": {
                    name: soyut.browser.formatBytes(size, true),
                    icon: "size"
                }
            }
        }
        else {
            menu = {
                "copy": {
                    name: "Copy",
                    icon: "copy"
                },
                "rename": {
                    name: "Rename",
                    icon: "rename"
                },
                "sep1": "---------",
                "info": {
                    name: name,
                    icon: "info"
                },
                "name": {
                    name: soyut.browser.loadFileType(type),
                    icon: "label"
                },
                "size": {
                    name: soyut.browser.formatBytes(size, true),
                    icon: "size"
                }
            }
        }
        $.contextMenu({
            selector: "figure[data-name='" + name + "']",
            callback: function (key) {
                var d = {
                    "name": $(this).attr('data-name'),
                    "file": $(this).attr('data-file'),
                    "dir": $(this).attr('data-dir'),
                    "type" : $(this).attr('data-type')
                };
                contextActions[key](d);
            },
            items: menu
        });
    };

    soyut.browser.loadActionContextMenu = function (data) {
        if(data != '') {
            $(".file-browser").contextMenu(true);
            $.contextMenu({
                selector: ".file-browser",
                callback: function (key) {
                    var d = {
                        "name" : $(this).attr('data-name'),
                        "dir" : $(this).attr('data-dir')
                    };
                    contextActions[key](d);
                },
                items: {
                    "newfile": {
                        name: "New File",
                        icon: "duplicate"
                    },
                    "sep1": "---------",
                    "paste": {
                        name: "Paste",
                        icon: "paste"
                    }
                }
            });
        }
        else {
            $(".file-browser").contextMenu(false);
        }
    };

    Vue.component('file-component', {
        props: ['files'],
        template: '#file-component',
        data: function() {
            return {}
        },
        methods: {
            OpenFile: function (isFile, isDirectory, name, type, url, path) {
                var curdir = $(getInstanceID('curdir-browser')).val();
                var volume = $(getInstanceID('volume-browser')).val();
                var filename = name;
                if(volume != 0){
                    filename = name + '/';

                    if(isDirectory) {
                        soyut.browser.initFileList('.file-browser', volume, curdir, filename);
                    }
                    else {
                        soyut.browser.showModalBrowser('warning', 'Silahkan Kopi file terlebih dahulu ke file sistem!')
                    }
                }
                else {
                    if(isDirectory) {
                        soyut.browser.initFileList('.file-browser', volume, curdir, filename);
                    }
                    else {
                        soyut.browser.ViewFile(name, type, url, path);
                    }
                }

            },
            getFileName: function (name, isDirectory) {
                var volume = $('.volume-browser').val();
                var curVal = '';
                if(volume == '0') {
                    if(isDirectory) {
                        curVal = name.substring(0, name.length - 1);
                    }
                    else {
                        curVal = name;
                    }
                }
                else {
                    curVal = name;
                }
                var entityMap = {
                    '&': '',
                    '<': '',
                    '>': '',
                    '?': '',
                    '"': '',
                    "'": '',
                    '/': '',
                    '`': '',
                    '=': ''
                };

                function escapeHtml (string) {
                    return String(string).replace(/[&<>?"'`=\/]/g, function (s) {
                        return entityMap[s];
                    });
                }
                return escapeHtml(curVal);
            },
            loadAttr: function(name, isFile, isDirectory, type, size){
                soyut.browser.loadContextMenu(name, isFile, isDirectory, type, size);
                if(isDirectory) {
                    var attr;
                    attr = {
                        'data-name': name,
                        'class': 'dir ui-draggable ui-droppable'
                    };
                    return attr;
                }
                else {
                    var attr;
                    switch (type) {
                        case "text/plain":
                            attr = {
                                'data-name': name,
                                'class': 'ff-item-type-1 file ui-draggable'
                            };
                            return attr;
                        case "application/pdf":
                            attr = {
                                'data-name': name,
                                'class': 'ff-item-type-1 file ui-draggable'
                            };
                            return attr;
                        case "video/mp4":
                            attr = {
                                'data-name': name,
                                'class': 'ff-item-type-4 file ui-draggable'
                            };
                            return attr;
                        case "audio/mp3":
                            attr = {
                                'data-name': name,
                                'class': 'ff-item-type-5 file ui-draggable'
                            };
                            return attr;
                        case "application/msword":
                            attr = {
                                'data-name': name,
                                'class': 'ff-item-type-1 file ui-draggable'
                            };
                            return attr;
                        case "application/vnd.ms-excel":
                            attr = {
                                'data-name': name,
                                'class': 'ff-item-type-1 file ui-draggable'
                            };
                            return attr;
                        case "application/vnd.ms-powerpoint":
                            attr = {
                                'data-name': name,
                                'class': 'ff-item-type-1 file ui-draggable'
                            };
                            return attr;
                        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                            attr = {
                                'data-name': name,
                                'class': 'ff-item-type-1 file ui-draggable'
                            };
                            return attr;
                        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                            attr = {
                                'data-name': name,
                                'class': 'ff-item-type-1 file ui-draggable'
                            };
                            return attr;
                        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                            attr = {
                                'data-name': name,
                                'class': 'ff-item-type-1 file ui-draggable'
                            };
                            return attr;
                        case "image/jpeg":
                            attr = {
                                'data-name': name,
                                'class': 'ff-item-type-2 file ui-draggable'
                            };
                            return attr;
                        case "image/png":
                            attr = {
                                'data-name': name,
                                'class': 'ff-item-type-2 file ui-draggable'
                            };
                            return attr;
                        default:
                            attr = {
                                'data-name': name,
                                'class': 'ff-item-type-1 file ui-draggable'
                            };
                            return attr;
                    }
                }
            },
            loadFigureAttr: function (name, filename, isFile, isDirectory, type) {
                var curDir = $(getInstanceID('curdir-browser')).val();
                if(isDirectory) {
                    var attr;
                    attr = {
                        'data-name': name,
                        'data-file': filename,
                        'data-dir': curDir,
                        'class': 'directory',
                        'data-type': 'dir'
                    };
                    return attr;
                }
                else {
                    var attr;
                    switch (type) {
                        case "text/plain":
                            attr = {
                                'data-name': name,
                                'data-file': filename,
                                'data-dir': curDir,
                                'data-type': 'file'
                            };
                            return attr;
                        case "application/pdf":
                            attr = {
                                'data-name': name,
                                'data-file': filename,
                                'data-dir': curDir,
                                'data-type': 'file'
                            };
                            return attr;
                        case "video/mp4":
                            attr = {
                                'data-name': name,
                                'data-file': filename,
                                'data-dir': curDir,
                                'data-type': 'file'
                            };
                            return attr;
                        case "audio/mp3":
                            attr = {
                                'data-name': name,
                                'data-file': filename,
                                'data-dir': curDir,
                                'data-type': 'file'
                            };
                            return attr;
                        case "application/msword":
                            attr = {
                                'data-name': name,
                                'data-file': filename,
                                'data-dir': curDir,
                                'data-type': 'file'
                            };
                            return attr;
                        case "application/vnd.ms-excel":
                            attr = {
                                'data-name': name,
                                'data-file': filename,
                                'data-dir': curDir,
                                'data-type': 'file'
                            };
                            return attr;
                        case "application/vnd.ms-powerpoint":
                            attr = {
                                'data-name': name,
                                'data-file': filename,
                                'data-dir': curDir,
                                'data-type': 'file'
                            };
                            return attr;
                        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                            attr = {
                                'data-name': name,
                                'data-file': filename,
                                'data-dir': curDir,
                                'data-type': 'file'
                            };
                            return attr;
                        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                            attr = {
                                'data-name': name,
                                'data-file': filename,
                                'data-dir': curDir,
                                'data-type': 'file'
                            };
                            return attr;
                        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                            attr = {
                                'data-name': name,
                                'data-file': filename,
                                'data-dir': curDir,
                                'data-type': 'file'
                            };
                            return attr;
                        case "image/jpeg":
                            attr = {
                                'data-name': name,
                                'data-file': filename,
                                'data-dir': curDir,
                                'data-type': 'img'
                            };
                            return attr;
                        case "image/png":
                            attr = {
                                'data-name': name,
                                'data-file': filename,
                                'data-dir': curDir,
                                'data-type': 'img'
                            };
                            return attr;
                        default:
                            attr = {
                                'data-name': name,
                                'data-file': filename,
                                'data-dir': curDir,
                                'data-type': 'file'
                            };
                            return attr;
                    }
                }
            },
            loadLinkAttr: function (name, isFile, isDirectory) {
                var attr;
                if(isDirectory) {
                    attr = {
                        'class' : 'folder-link'
                    };
                }
                else {
                    attr = {
                        'class' : 'link',
                        'data-file' : name,
                        'data-function' : "apply_none"
                    };
                }
                return attr;
            },
            loadImgContainer: function (isFile, isDirectory) {
                var attr;
                if(isDirectory) {
                    attr = {
                        'class' : 'img-container directory'
                    };
                }
                else {
                    attr = {
                        'class' : 'img-container',
                    };
                }
                return attr;
            },
            loadImgContainerMini: function (isFile, isDirectory) {
                var attr;
                if(isDirectory) {
                    attr = {
                        'class' : 'img-precontainer-mini directory'
                    };
                }
                else {
                    attr = {
                        'class' : 'img-precontainer-mini',
                    };
                }
                return attr;
            },
            loadImageIcon: function(isFile, isDirectory, type, url){
                if(isDirectory) {
                    var attr;
                    attr = {
                        'class' : 'directory-img',
                        'src' : 'https://' + soyut.browser.origin + '/img/ico/folder.png'
                    };
                    return attr;
                }
                else {
                    var attr;
                    switch (type) {
                        case "text/plain":
                            attr = {
                                'class': 'icon lazy-loaded',
                                'src': 'https://' + soyut.browser.origin + '/img/ico/txt.jpg',
                                'data-original': 'https://' + soyut.browser.origin + '/img/ico/txt.jpg',
                                'style': 'display: inline;'
                            };
                            return attr;
                        case "application/pdf":
                            attr = {
                                'class': 'icon lazy-loaded',
                                'src': 'https://' + soyut.browser.origin + '/img/ico/pdf.jpg',
                                'data-original': 'https://' + soyut.browser.origin + '/img/ico/pdf.jpg',
                                'style': 'display: inline;'
                            };
                            return attr;
                        case "video/mp4":
                            attr = {
                                'class': 'icon lazy-loaded',
                                'src': 'https://' + soyut.browser.origin + '/img/ico/mp4.jpg',
                                'data-original': 'https://' + soyut.browser.origin + '/img/ico/mp4.jpg',
                                'style': 'display: inline;'
                            };
                            return attr;
                        case "audio/mp3":
                            attr = {
                                'class': 'icon lazy-loaded',
                                'src': 'https://' + soyut.browser.origin + '/img/ico/mp3.jpg',
                                'data-original': 'https://' + soyut.browser.origin + '/img/ico/mp3.jpg',
                                'style': 'display: inline;'
                            };
                            return attr;
                        case "application/msword":
                            attr = {
                                'class': 'icon lazy-loaded',
                                'src': 'https://' + soyut.browser.origin + '/img/ico/docx.jpg',
                                'data-original': 'https://' + soyut.browser.origin + '/img/ico/docx.jpg',
                                'style': 'display: inline;'
                            };
                            return attr;
                        case "application/vnd.ms-excel":
                            attr = {
                                'class': 'icon lazy-loaded',
                                'src': 'https://' + soyut.browser.origin + '/img/ico/xlsx.jpg',
                                'data-original': 'https://' + soyut.browser.origin + '/img/ico/xlsx.jpg',
                                'style': 'display: inline;'
                            };
                            return attr;
                        case "application/vnd.ms-powerpoint":
                            attr = {
                                'class': 'icon lazy-loaded',
                                'src': 'https://' + soyut.browser.origin + '/img/ico/pptx.jpg',
                                'data-original': 'https://' + soyut.browser.origin + '/img/ico/pptx.jpg',
                                'style': 'display: inline;'
                            };
                            return attr;
                        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                            attr = {
                                'class': 'icon lazy-loaded',
                                'src': 'https://' + soyut.browser.origin + '/img/ico/docx.jpg',
                                'data-original': 'https://' + soyut.browser.origin + '/img/ico/docx.jpg',
                                'style': 'display: inline;'
                            };
                            return attr;
                        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                            attr = {
                                'class': 'icon lazy-loaded',
                                'src': 'https://' + soyut.browser.origin + '/img/ico/xlsx.jpg',
                                'data-original': 'https://' + soyut.browser.origin + '/img/ico/xlsx.jpg',
                                'style': 'display: inline;'
                            };
                            return attr;
                        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                            attr = {
                                'class': 'icon lazy-loaded',
                                'src': 'https://' + soyut.browser.origin + '/img/ico/pptx.jpg',
                                'data-original': 'https://' + soyut.browser.origin + '/img/ico/pptx.jpg',
                                'style': 'display: inline;'
                            };
                            return attr;
                        case "image/jpeg":
                            attr = {
                                'class': 'icon lazy-loaded',
                                'src': url,
                                'data-original': url,
                                'style': 'display: inline;'
                            };
                            return attr;
                        case "image/png":
                            attr = {
                                'class': 'icon lazy-loaded',
                                'src': url,
                                'data-original': url,
                                'style': 'display: inline;'
                            };
                            return attr;
                        default:
                            attr = {
                                'class': 'icon lazy-loaded',
                                'src': 'https://' + soyut.browser.origin + '/img/ico/default.jpg',
                                'data-original': 'https://' + soyut.browser.origin + '/img/ico/default.jpg',
                                'style': 'display: inline;'
                            };
                            return attr;
                    }
                }
            },
            loadFileType: function (isFile, isDirectory, type) {
                var attr;
                if(isDirectory) {
                    attr = {
                        'class' : 'filetype hide'
                    };
                }
                else {
                    attr = {
                        'class' : 'filetype'
                    };
                }
                return attr;
            },
            loadFileTypeMini: function (isFile, isDirectory, type) {
                if(isDirectory) {
                    var attr;
                    attr = {
                        'class' : 'hide'
                    };
                    return attr;
                }
                else {
                    var attr;
                    switch (type) {
                        case "text/plain":
                            attr = {
                                'class': 'filetype txt'
                            };
                            return attr;
                        case "application/pdf":
                            attr = {
                                'class': 'filetype pdf'
                            };
                            return attr;
                        case "video/mp4":
                            attr = {
                                'class': 'filetype mp4'
                            };
                            return attr;
                        case "audio/mp3":
                            attr = {
                                'class': 'filetype mp3'
                            };
                            return attr;
                        case "application/msword":
                            attr = {
                                'class': 'filetype docx'
                            };
                            return attr;
                        case "application/vnd.ms-excel":
                            attr = {
                                'class': 'filetype xlsx'
                            };
                            return attr;
                        case "application/vnd.ms-powerpoint":
                            attr = {
                                'class': 'filetype pptx'
                            };
                            return attr;
                        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                            attr = {
                                'class': 'filetype docx'
                            };
                            return attr;
                        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                            attr = {
                                'class': 'filetype xlsx'
                            };
                            return attr;
                        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                            attr = {
                                'class': 'filetype pptx'
                            };
                            return attr;
                        case "image/jpeg":
                            attr = {
                                'class': 'filetype jpeg hide'
                            };
                            return attr;
                        case "image/png":
                            attr = {
                                'class': 'filetype png hide'
                            };
                            return attr;
                        default:
                            attr = {
                                'class': 'filetype txt'
                            };
                            return attr;
                    }
                }
            },
            loadCover: function (isFile, type) {
                if(isFile) {
                    var attr;
                    switch (type) {
                        case "text/plain":
                            attr = {
                                'class': 'cover'
                            };
                            return attr;
                        case "application/pdf":
                            attr = {
                                'class': 'cover'
                            };
                            return attr;
                        case "video/mp4":
                            attr = {
                                'class': 'cover'
                            };
                            return attr;
                        case "audio/mp3":
                            attr = {
                                'class': 'cover'
                            };
                            return attr;
                        case "application/msword":
                            attr = {
                                'class': 'cover'
                            };
                            return attr;
                        case "application/vnd.ms-excel":
                            attr = {
                                'class': 'cover'
                            };
                            return attr;
                        case "application/vnd.ms-powerpoint":
                            attr = {
                                'class': 'cover'
                            };
                            return attr;
                        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                            attr = {
                                'class': 'cover'
                            };
                            return attr;
                        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                            attr = {
                                'class': 'cover'
                            };
                            return attr;
                        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                            attr = {
                                'class': 'cover'
                            };
                            return attr;
                    }
                }
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
                        return 'folder';
                }
            },
            getFirstChar: function (name) {
                return name.substring(0,1);
            },
            setBackButton: function () {
                var curdir = $(getInstanceID('curdir-browser')).val();
                if(curdir == "" || curdir =="/"){
                    return false;
                }
                else {
                    return true;
                }
            },
            getParentFolder: function () {
                var curdir = $(getInstanceID('curdir-browser')).val();

                var resdir = curdir.substr(0, curdir.lastIndexOf("/"));
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

                $(getInstanceID('cdir-browser')).val(sourceFolder);
                $(getInstanceID('bdir-browser')).val(destFolder);
            },
            loadImageBackIcon: function () {
                var attr;
                attr = {
                    'class' : 'directory-img',
                    'src' : 'https://' + soyut.browser.origin + '/img/ico/folder_back.png'
                };
                return attr;
            },
            BackBrowser: function () {
                var volume = $('.volume-browser').val();
                var curDir = $(getInstanceID('cdir-browser')).val();
                var dir = $(getInstanceID('bdir-browser')).val();

                var parentDir = '';
                if(curDir == ''){
                    parentDir = '/';
                }
                else {
                    parentDir = curDir;
                }

                soyut.browser.initFileList('.file-browser', volume, parentDir, dir);
            }
        },
        mounted: function () {
            this.$nextTick(function () {
                soyut.browser.initMountPoint();
                soyut.browser.initSortingComponent();
                soyut.browser.initNavigationComponent();
                soyut.browser.initTooltip();
                soyut.browser.initFolderDraggable();
                soyut.browser.initSorting();
            });
        },
    });

    soyut.browser.showModalBrowser = function (type, content) {
          if(type == 'warning'){
              var html = '<div class="modal-header">' +
                  '<h3 class="modal-title">Informasi</h3>' +
                  '</div>' +
                  '<div class="modal-body"><p class="text-center">'+ content +'</p></form>' +
                  '</div>' +
                  '<div class="modal-footer">' +
                  '<button type="button" class="btn btn-info-cancel"> Batal</button>' +
                  '</div>';
              $(getInstanceID("media-container")).show(500);
              $('.modal-browser').html(html);

              $(".btn-info-cancel").on('click').click(function () {
                  soyut.browser.closeModalWindow();
              });
          }
    };

    soyut.browser.initMountPoint = function () {
        var volumes = fileSystem.mp_list;
        soyut.browser.mountPointChange(volumes);
    };

    soyut.browser.initFileList = function (elSelector, volume, curdir, dir) {
        soyut.browser.showLoader();
        var $el = $(elSelector);

        $el.html('');
        $el.append('<file-component :files="files"></file-component>');

        var path = '';
        if(curdir != ''){
            path = curdir + dir;
        }
        else {
            path = '/';
        }
        $(getInstanceID('curdir-browser')).val(path);
        $(getInstanceID('dir-browser')).val(dir);

        $('.file-browser').attr('data-name', '');
        $('.file-browser').attr('data-dir', path);
        var cmaction = $(getInstanceID("cm-action")).val();
        soyut.browser.loadActionContextMenu(cmaction);

        if(volume == 0) {
            soyut.browser.file_ls({path: path}, function (err, files) {
                vm = new Vue({
                    el: elSelector,
                    data: {
                        files: files
                    }
                });
                soyut.browser.hideLoader();
            });
        }
        else {
            soyut.browser.mp_ls({volume: volume, path: path}, function (err, files) {
                vm = new Vue({
                    el: elSelector,
                    data: {
                        files: files
                    }
                });
                soyut.browser.hideLoader();
            });
        }
    };

    soyut.browser.ViewFile = function (name, type, url, path) {
        soyut.browser.showLoader();
        var activitylistener = getActivityInstanceAsync();
        activitylistener.then(function (activity) {
            app.launchExternalActivity("soyut.module.browser.fileviewer", {name: name, type: type, url: url, path: path}, activity);
        });
    };

    soyut.browser.showLoader = function () {
        $(getInstanceID("browser-loader")).show();
    };

    soyut.browser.hideLoader = function () {
        $(getInstanceID("browser-loader")).hide(500);
    };

    soyut.browser.initFolderDraggable = function () {
        $("li.dir, li.file").draggable({
            distance: 20,
            cursor: "move",
            helper: function() {
                $(this).find("figure").find(".box").css("top", "0px");
                var b = $(this).clone().css("z-index", 1e3).find(".box").css("box-shadow", "none").css("-webkit-box-shadow", "none").parent().parent();
                return $(this).addClass("selected"), b;
            },
            start: function() {
                0 == $("#view").val() && $("#main-item-container").addClass("no-effect-slide");
            },
            stop: function() {
                $(this).removeClass("selected"), 0 == $("#view").val() && $("#main-item-container").removeClass("no-effect-slide");
            }
        });
        $("li.dir,li.back").droppable({
            accept: "ul.grid li",
            activeClass: "ui-state-highlight",
            hoverClass: "ui-state-hover",
            drop: function(b, c) {
                soyut.browser.dragItems(c.draggable.find("figure"), $(this).find("figure"));
            }
        })
    };

    soyut.browser.dragItems = function (obj, tgt) {
        console.log("asdasdasd")
    };

    soyut.browser.refreshBrowser = function () {
        var volume = $('.volume-browser').val();
        var curdir = $(getInstanceID('curdir-browser')).val();
        var dir = $(getInstanceID('dir-browser')).val();

        var rmdir = soyut.browser.removeLastSlash(curdir);
        var rmLink = soyut.browser.removeLastSlash(rmdir);
        var currentDir = rmLink.substr(0, rmLink.lastIndexOf("/")+ 1);

        soyut.browser.initFileList('.file-browser', volume, currentDir, dir);
    };

    soyut.browser.returnHome = function () {
        var volume = $('.volume-browser').val();
        soyut.browser.initFileList('.file-browser', volume, '', '');
    };

    soyut.browser.init = function(){
        $('.volume-browser').val('0');
        soyut.browser.initFileList('.file-browser', '0', '', '');
    };

    soyut.browser.initFilterComponent();
    soyut.browser.init();

});

