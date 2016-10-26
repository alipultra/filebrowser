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
        copy_url: function (b) {
            var c = D(b);
            bootbox.alert('URL:<br/><div class="input-append" style="width:100%"><input id="url_text' + B + '" type="text" style="width:80%; height:30px;" value="' + encodeURL(c) + '" /><button id="copy-button' + B + '" class="btn btn-inverse copy-button" style="width:20%; height:30px;" data-clipboard-target="url_text' + B + '" data-clipboard-text="Copy Me!" title="copy"></button></div>'),
                a("#copy-button" + B).html('<i class="icon icon-white icon-share"></i> ' + a("#lang_copy").val());
            var d = new ZeroClipboard(a("#copy-button" + B));
            d.on("ready", function (b) {
                d.on("wrongFlash noFlash", function () {
                    ZeroClipboard.destroy();
                }), d.on("aftercopy", function (b) {
                    a("#copy-button" + B).html('<i class="icon icon-ok"></i> ' + a("#ok").val()), a("#copy-button" + B).attr("class", "btn disabled"),
                        B++;
                }), d.on("error", function (a) {
                });
            });
        },
        unzip: function (b) {
            var c = a("#sub_folder").val() + a("#fldr_value").val() + b.find("a.link").attr("data-file");
            a.ajax({
                type: "POST",
                url: "ajax_calls.php?action=extract",
                data: {
                    path: c
                }
            }).done(function (b) {
                "" != b ? bootbox.alert(b) : window.location.href = a("#refresh").attr("href") + "&" + new Date().getTime();
            });
        },
        edit_img: function (b) {
            var c = b.attr("data-name"), d = a("#base_url").val() + a("#cur_dir").val() + c, e = a("#aviary_img");
            e.attr("data-name", c), show_animation(), e.attr("src", d).load(x(e.attr("id"), d));
        },
        duplicate: function (b) {
            var c = b.find("h4").text().trim();
            bootbox.prompt(a("#lang_duplicate").val(), a("#cancel").val(), a("#ok").val(), function (a) {
                if (null !== a && (a = u(a), a != c)) {
                    var d = b.find(".rename-file");
                    v("duplicate_file", d.attr("data-path"), a, d, "apply_file_duplicate");
                }
            }, c);
        },
        select: function (b) {
            // var c, d = D(b), e = a("#field_id").val(), f = a("#return_relative_url").val();
            // if (1 == f && (d = d.replace(a("#base_url").val(), "")), c = 1 == a("#popup").val() ? window.opener : window.parent,
            //     "" != e) if (1 == a("#crossdomain").val()) c.postMessage({
            //     sender: "responsivefilemanager",
            //     url: d,
            //     field_id: e
            // }, "*"); else {
            //     var g = a("#" + e, c.document);
            //     g.val(d).trigger("change"), "function" == typeof c.responsive_filemanager_callback && c.responsive_filemanager_callback(e),
            //         s();
            // } else apply_any(d);
            console.log("select " + b);
        },
        copy: function (a) {
            console.log("copy yah");
            l(a, "copy");
        },
        cut: function (a) {
            l(a, "cut");
        },
        paste: function () {
            m();
        },
        chmod: function (a) {
            h(a);
        },
        edit_text_file: function (a) {
            f(a);
        }
    }
    /*
     $.contextMenu({
     selector: "figure:not(.back-directory), .list-view2 figure:not(.back-directory)",
     autoHide: !0,
     build: function (d) {
     d.addClass("selected");
     var e = {
     callback: function (a, c) {
     contextActions[a](d);
     },
     items: {}
     };
     return (d.find(".img-precontainer-mini .filetype").hasClass("png") || d.find(".img-precontainer-mini .filetype").hasClass("jpg") || d.find(".img-precontainer-mini .filetype").hasClass("jpeg")) && (e.items.edit_img = {
     name: "Edit Image",
     icon: "edit_img",
     disabled: !1
     }), d.hasClass("directory") && 0 != $("#type_param").val() && (e.items.select = {
     name: "Select",
     icon: "",
     disabled: !1
     }), e.items.copy_url = {
     name: "Show URL",
     icon: "url",
     disabled: !1
     }, (d.find(".img-precontainer-mini .filetype").hasClass("zip") || d.find(".img-precontainer-mini .filetype").hasClass("tar") || d.find(".img-precontainer-mini .filetype").hasClass("gz")) && (e.items.unzip = {
     name: "Extract here",
     icon: "extract",
     disabled: !1
     }), d.find(".img-precontainer-mini .filetype").hasClass("edit-text-file-allowed") && (e.items.edit_text_file = {
     name: "Edit file's content",
     icon: "edit",
     disabled: !1
     }), d.hasClass("directory") || 1 != $("#duplicate").val() || (e.items.duplicate = {
     name: "Duplicate",
     icon: "duplicate",
     disabled: !1
     }), d.hasClass("directory") || 1 != $("#copy_cut_files_allowed").val() ? d.hasClass("directory") && 1 == $("#copy_cut_dirs_allowed").val() && (e.items.copy = {
     name: "Copy",
     icon: "copy",
     disabled: !1
     }, e.items.cut = {
     name: "Cut",
     icon: "cut",
     disabled: !1
     }) : (e.items.copy = {
     name: "Copy",
     icon: "copy",
     disabled: !1
     }, e.items.cut = {
     name: "Cut",
     icon: "cut",
     disabled: !1
     }), 0 == $("#clipboard").val() || d.hasClass("directory") || (e.items.paste = {
     name: "Paste to this directory",
     icon: "clipboard-apply",
     disabled: !1
     }), d.hasClass("directory") || 1 != $("#chmod_files_allowed").val() ? d.hasClass("directory") && 1 == $("#chmod_dirs_allowed").val() && (e.items.chmod = {
     name: "File permission",
     icon: "key",
     disabled: !1
     }) : e.items.chmod = {
     name: "File permission",
     icon: "key",
     disabled: !1
     }, e.items.sep = "----", e.items.info = {
     name: "File Info",
     disabled: !0
     }, e.items.name = {
     name: d.attr("data-name"),
     icon: "label",
     disabled: !0
     }, "img" == d.attr("data-type") && (e.items.dimension = {
     name: d.find(".img-dimension").html(),
     icon: "dimension",
     disabled: !0
     }), ("true" === $("#show_folder_size").val() || "true" === $("#show_folder_size").val()) && (e.items.size = d.hasClass("directory") ? {
     name: d.find(".file-size").html() + " - " + d.find(".nfiles").val() + " " + $("#lang_files").val() + " - " + d.find(".nfolders").val() + " " + $("#lang_folders").val(),
     icon: "size",
     disabled: !0
     } : {
     name: d.find(".file-size").html(),
     icon: "size",
     disabled: !0
     }), e.items.date = {
     name: d.find(".file-date").html(),
     icon: "date",
     disabled: !0
     }, e;
     },
     events: {
     hide: function () {
     $("figure").removeClass("selected");
     }
     }
     });
     */
    $.contextMenu({
        selector: "figure:not(.back-directory), .list-view2 figure:not(.back-directory)",
        autoHide: !0,
        build: function (d) {
            d.addClass("selected");
            var e = {
                callback: function (a, c) {
                    contextActions[a](d);
                },
                items: {}
            };
            return (d.find(".img-precontainer-mini .filetype").hasClass("png") || d.find(".img-precontainer-mini .filetype").hasClass("jpg") || d.find(".img-precontainer-mini .filetype").hasClass("jpeg")) && (e.items.edit_img = {
                name: "Edit Image",
                icon: "edit_img",
                disabled: !1
            }), d.hasClass("directory") && 0 != $("#type_param").val() && (e.items.select = {
                name: "Select",
                icon: "",
                disabled: !1
            }), e.items.rename = {
                name: "Rename",
                icon: "url",
                disabled: !1
            },  e.items.copy = {
                name: "Copy",
                icon: "copy",
                disabled: !1
            },  e.items.copy_url = {
                name: "Show URL",
                icon: "url",
                disabled: !1
            }, (d.find(".img-precontainer-mini .filetype").hasClass("zip") || d.find(".img-precontainer-mini .filetype").hasClass("tar") || d.find(".img-precontainer-mini .filetype").hasClass("gz")) && (e.items.unzip = {
                name: "Extract here",
                icon: "extract",
                disabled: !1
            }), d.find(".img-precontainer-mini .filetype").hasClass("edit-text-file-allowed") && (e.items.edit_text_file = {
                name: "Edit file's content",
                icon: "edit",
                disabled: !1
            }), d.hasClass("directory") || 1 != $("#duplicate").val() || (e.items.duplicate = {
                name: "Duplicate",
                icon: "duplicate",
                disabled: !1
            }), d.hasClass("directory") || 1 != $("#copy_cut_files_allowed").val() ? d.hasClass("directory") && 1 == $("#copy_cut_dirs_allowed").val() && (e.items.copy = {
                name: "Copy",
                icon: "copy",
                disabled: !1
            }, e.items.cut = {
                name: "Cut",
                icon: "cut",
                disabled: !1
            }) : (e.items.copy = {
                name: "Copy",
                icon: "copy",
                disabled: !1
            }, e.items.cut = {
                name: "Cut",
                icon: "cut",
                disabled: !1
            }), 0 == $("#clipboard").val() || d.hasClass("directory") || (e.items.paste = {
                name: "Paste to this directory",
                icon: "clipboard-apply",
                disabled: !1
            }), d.hasClass("directory") || 1 != $("#chmod_files_allowed").val() ? d.hasClass("directory") && 1 == $("#chmod_dirs_allowed").val() && (e.items.chmod = {
                name: "File permission",
                icon: "key",
                disabled: !1
            }) : e.items.chmod = {
                name: "File permission",
                icon: "key",
                disabled: !1
            }, e.items.sep = "----", e.items.info = {
                name: "File Info",
                disabled: !0
            }, e.items.name = {
                name: d.attr("data-name"),
                icon: "label",
                disabled: !0
            }, "img" == d.attr("data-type") && (e.items.dimension = {
                name: d.find(".img-dimension").html(),
                icon: "dimension",
                disabled: !0
            }), ("true" === $("#show_folder_size").val() || "true" === $("#show_folder_size").val()) && (e.items.size = d.hasClass("directory") ? {
                name: d.find(".file-size").html() + " - " + d.find(".nfiles").val() + " " + $("#lang_files").val() + " - " + d.find(".nfolders").val() + " " + $("#lang_folders").val(),
                icon: "size",
                disabled: !0
            } : {
                name: d.find(".file-size").html(),
                icon: "size",
                disabled: !0
            }), e.items.date = {
                name: d.find(".file-date").html(),
                icon: "date",
                disabled: !0
            }, e;
        },
        events: {
            hide: function () {
                $("figure").removeClass("selected");
            }
        }
    });

    var app = new Vue({
        el: '#main-content',
        data: {
            files: '',
            curDir: '',
            folderPng: 'https://' + browserService.origin + '/img/ico/folder.png',
            txtPng: 'https://' + browserService.origin + '/img/ico/txt.jpg',
            pdfPng: 'https://' + browserService.origin + '/img/ico/pdf.jpg',
            mp4Png: 'https://' + browserService.origin + '/img/ico/mp4.jpg',
            mp3Png: 'https://' + browserService.origin + '/img/ico/mp3.jpg',
            docxPng: 'https://' + browserService.origin + '/img/ico/docx.jpg',
            xlsxPng: 'https://' + browserService.origin + '/img/ico/xlsx.jpg',
            pptxPng: 'https://' + browserService.origin + '/img/ico/pptx.jpg',
        },
        methods: {
            loadServer: function () {
                var _this = this;

                var files = fileSystem.ls('/');
                _this.$set(_this, 'curDir', '');
                _this.$set(_this, 'files', files);
            },
            LoadFolder: function (currentDir, i) {
                var _this = this;
                var dir = '';
                if (currentDir == '') {
                    dir = '/';
                }
                else {
                    dir = currentDir + '/';
                }

                var files = fileSystem.ls(dir + i);
                _this.$set(_this, 'curDir', dir + i);
                _this.$set(_this, 'files', files);

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
            LoadFolderForm: function () {
                $(getInstanceID('browser-form-container')).removeClass('disable');
                //console.log("new folder");
            }
        }
    });

    app.loadServer();
});

