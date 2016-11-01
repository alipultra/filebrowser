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
            return (e.items.select = {
                name: "Select",
                icon: "url",
                disabled: !1
            }),  e;
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

                var path = dir + i;
                var files = fileSystem.stats(path);

                var activity =  getActivityInstance();
                activity.context.invoke('loadfile_selected',files);
                activity.window.close();
            },
            LoadFolderForm: function () {
                $(getInstanceID('browser-form-container')).removeClass('disable');
                //console.log("new folder");
            }
        }
    });

    app.loadServer();
});

