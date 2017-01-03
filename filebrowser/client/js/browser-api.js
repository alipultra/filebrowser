soyut.browser = soyut.browser || soyut.Services.getInstance().getService("browserServer");
var tmplTes = '<h1 class="text-center">\
                <small>Add Folder</small>\
                </h1>';


Vue.component('list-inbox', {
    props: [],
    template: tmplTes,
    methods: {
    }
});

soyut.browser.renderBrowser = function(elSelector, uuid) {
    console.log('asdasdasd')
    var $el = $(elSelector);
    $el.html('');
    $el.append('<list-inbox></list-inbox>');

    var vminbox = new Vue({
        el: elSelector,
        data: {
            inboxdata: ''
        },
        methods: {

        }
    });
};
//
// soyut.browser.uuid = null;
//
// soyut.forum.init = function(callback) {
//     var app =  getAppInstance();
//     var activitylistener = getActivityInstanceAsync();
//     activitylistener.then(function(activity) {
//         console.log(activity+" tes fdulu");
//     });
// };
//
// soyut.forum.init(function() {
//     console.info('browser module load');
// });