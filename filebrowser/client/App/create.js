var currentDir = getParam('currentDir');
var dir = getParam('dir');

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
        //fileSystem.mkdir(targetdir);
        fileSystem.mkdir(targetdir, function(err, res) {
            console.log(err, res);
            var directory = {
                "currentDir": currentDir,
                "dir": dir
            };

            var activity = getActivityInstance();
            activity.context.invoke('folder_created', directory);
            activity.window.close();
        })
    }

});