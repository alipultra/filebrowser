var vmc;

Vue.component('media-component', {
    props: ['files'],
    template: '#media-component',
    methods: {
        OpenFile: function (isFile, isDirectory, name, type, url) {
            if(isDirectory) {
                var curdir = $(getInstanceID('curdir-browser')).val();

            }
            else {

            }
        },
        getFileName: function (name) {
            var curVal = name.substring(0, name.length-1);
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
        loadAttr: function(name, isFile, isDirectory, type){
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
        loadFigureAttr: function (name, isFile, isDirectory, type) {
            var curDir = $(getInstanceID('curdir-browser')).val();
            if(isDirectory) {
                var attr;
                attr = {
                    'data-name': name,
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
                            'data-type': 'file'
                        };
                        return attr;
                    case "application/pdf":
                        attr = {
                            'data-name': name,
                            'data-type': 'file'
                        };
                        return attr;
                    case "video/mp4":
                        attr = {
                            'data-name': name,
                            'data-type': 'file'
                        };
                        return attr;
                    case "audio/mp3":
                        attr = {
                            'data-name': name,
                            'data-type': 'file'
                        };
                        return attr;
                    case "application/msword":
                        attr = {
                            'data-name': name,
                            'data-type': 'file'
                        };
                        return attr;
                    case "application/vnd.ms-excel":
                        attr = {
                            'data-name': name,
                            'data-type': 'file'
                        };
                        return attr;
                    case "application/vnd.ms-powerpoint":
                        attr = {
                            'data-name': name,
                            'data-type': 'file'
                        };
                        return attr;
                    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                        attr = {
                            'data-name': name,
                            'data-type': 'file'
                        };
                        return attr;
                    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                        attr = {
                            'data-name': name,
                            'data-type': 'file'
                        };
                        return attr;
                    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                        attr = {
                            'data-name': name,
                            'data-type': 'file'
                        };
                        return attr;
                    case "image/jpeg":
                        attr = {
                            'data-name': name,
                            'data-type': 'img'
                        };
                        return attr;
                    case "image/png":
                        attr = {
                            'data-name': name,
                            'data-type': 'img'
                        };
                        return attr;
                    default:
                        attr = {
                            'data-name': name,
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
                    'class' : ''
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

        }
    }
});

soyut.browser.initMediaContainer = function (elSelector, volume, curdir, dir) {
    var $el = $(elSelector);
    $el.html('');
    $el.append('<media-component :files="files"></media-component>');

    var path = '';
    if (curdir != '') {
        path = curdir + dir;
    }
    else {
        path = '/';
    }

    soyut.browser.mp_ls({volume: volume, path: path}, function(err, files) {
        vmc = new Vue({
            el: elSelector,
            data: {
                files: files
            }
        });
    });
};

soyut.browser.initMedia = function (volume) {
    soyut.browser.initMediaContainer('.media-browser', volume, '', '');
};