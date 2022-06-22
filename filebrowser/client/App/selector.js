var p1 = getParam('p1');
var p2 = getParam('p2');

soyut.browser.getDocServerUrl({}, function (err, docserver) {
    var documentServerUrl = docserver;
    var vm;
    var app = getAppInstance();

    soyut.browser.initFilterComponent = function () {
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
    };

    var contextActions = {
        preview: function (a) {
            var file = a.file;
            var dir = a.dir;
            var type = a.type;

            console.log("preview ")
        }
    };

    soyut.browser.loadContextMenu = function (name, isFile, isDirectory, type, size) {
        var volume = $(".volume-browser").val();
        var menu = {
            "preview": {
                name: "Preview",
                icon: "info"
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
        };

        $.contextMenu( 'destroy', "figure[data-name='" + name + "']" );
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

        soyut.browser.initFileList('.file-selector', volume, parentDir, targetDir);
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
            case "application/rtf":
                return 'rtf';
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

    Vue.component('selector-component', {
        props: ['files'],
        template: '#selector-component',
        data: function() {
            return {}
        },
        methods: {
            OpenFile: function (isFile, isDirectory, name, type, url, path) {
                var curdir = $(getInstanceID('curdir-browser')).val();
                var volume = $(getInstanceID('volume-browser')).val();
                var filename = name;

                if(isDirectory) {
                    soyut.browser.initFileList('.file-selector', volume, curdir, filename);
                }
                else {
                    fileSystem.stat(path, function (err, files) {
                        var activity =  getActivityInstance();
                        var Obj = {
                            files: files,
                            p1: p1,
                            p2: p2
                        };
                        activity.context.invoke('loadfile_selected',Obj);
                        activity.window.close();
                    });
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
                        case "application/rtf":
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
                        case "application/rtf":
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
                                'data-type': 'file'
                            };
                            return attr;
                        case "image/png":
                            attr = {
                                'data-name': name,
                                'data-file': filename,
                                'data-dir': curDir,
                                'data-type': 'file'
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
                        case "application/rtf":
                            attr = {
                                'class': 'icon lazy-loaded',
                                'src': 'https://' + soyut.browser.origin + '/img/ico/rtf.jpg',
                                'data-original': 'https://' + soyut.browser.origin + '/img/ico/rtf.jpg',
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
                            if(url == undefined){
                                attr = {
                                    'class': 'icon lazy-loaded',
                                    'src': 'https://' + soyut.browser.origin + '/img/ico/jpeg.jpg',
                                    'data-original': 'https://' + soyut.browser.origin + '/img/ico/jpeg.jpg',
                                    'style': 'display: inline;'
                                };
                            }
                            else {
                                attr = {
                                    'class': 'icon lazy-loaded',
                                    'src': url,
                                    'data-original': url,
                                    'style': 'display: inline;'
                                };
                            }
                            return attr;
                        case "image/png":
                            if(url == undefined){
                                attr = {
                                    'class': 'icon lazy-loaded',
                                    'src': 'https://' + soyut.browser.origin + '/img/ico/png.jpg',
                                    'data-original': 'https://' + soyut.browser.origin + '/img/ico/png.jpg',
                                    'style': 'display: inline;'
                                };
                            }
                            else {
                                attr = {
                                    'class': 'icon lazy-loaded',
                                    'src': url,
                                    'data-original': url,
                                    'style': 'display: inline;'
                                };
                            }
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
                        case "application/rtf":
                            attr = {
                                'class': 'filetype rtf'
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
                        case "application/rtf":
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
                    case "application/rtf":
                        return 'rtf';
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

                soyut.browser.initFileList('.file-selector', volume, parentDir, dir);
            }
        },
        mounted: function () {
            this.$nextTick(function () {
                soyut.browser.initSortingComponent();
                soyut.browser.initNavigationComponent();
                soyut.browser.initTooltip();
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

    soyut.browser.initFileList = function (elSelector, volume, curdir, dir) {
        soyut.browser.showLoader();
        var $el = $(elSelector);

        $el.html('');
        $el.append('<selector-component :files="files"></selector-component>');

        var path = '';
        if(curdir != ''){
            path = curdir + dir;
        }
        else {
            path = '/';
        }
        $(getInstanceID('curdir-browser')).val(path);
        $(getInstanceID('dir-browser')).val(dir);

        $('.file-selector').attr('data-name', '');
        $('.file-selector').attr('data-dir', path);

        soyut.browser.file_ls({path: path}, function (err, files) {
            vm = new Vue({
                el: elSelector,
                data: {
                    files: files
                }
            });
            soyut.browser.hideLoader();
        });
    };

    soyut.browser.ViewFile = function (name, type, url) {
        var activitylistener = getActivityInstanceAsync();
        activitylistener.then(function (activity) {
            app.launchExternalActivity("soyut.module.browser.fileviewer", {name: name, type: type, url: url}, activity);
        });
    };

    soyut.browser.refreshBrowser = function () {
        var volume = $('.volume-browser').val();
        var curdir = $(getInstanceID('curdir-browser')).val();
        var dir = $(getInstanceID('dir-browser')).val();

        var rmdir = soyut.browser.removeLastSlash(curdir);
        var rmLink = soyut.browser.removeLastSlash(rmdir);
        var currentDir = rmLink.substr(0, rmLink.lastIndexOf("/")+ 1);

        soyut.browser.initFileList('.file-selector', volume, currentDir, dir);
    };

    soyut.browser.returnHome = function () {
        var volume = $('.volume-browser').val();
        soyut.browser.initFileList('.file-selector', volume, '', '');
    };

    soyut.browser.init = function(){
        $('.volume-browser').val('0');
        soyut.browser.initFileList('.file-selector', '0', '', '');
    };

    soyut.browser.initFilterComponent();
    soyut.browser.init();

});


