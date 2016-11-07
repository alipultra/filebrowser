var currentDir = getParam('currentDir');
var dir = getParam('dir');
//$(getInstanceID('page-title')).html(a);

$(getInstanceID("button-save")).click(function(event) {
    var name = $(getInstanceID("name-input")).val();

    var error="";

    if(name == "" || name == null){
        error = "* Name harus diisi";
    }
    if(error != ""){
        return false;
    }
    else {
        var targetdir = currentDir+"/"+name;
        fileSystem.mkdir(targetdir);
        var directory = {
            "currentDir" : currentDir,
            "dir": dir
        }

        var activity =  getActivityInstance();
        activity.context.invoke('folder_created',directory);
        activity.window.close();
    }

});