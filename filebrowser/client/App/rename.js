var currentDir = getParam('currentDir');
var dir = getParam('dir');
var datatype = getParam('type');

$(getInstanceID('name-input')).val(dir);

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
        var srcdir = currentDir + dir;
        var targetdir = currentDir + name;

        //console.log("type "+datatype+" src "+srcdir+" tgt "+targetdir)

        fileSystem.mv(srcdir, targetdir, function(err, res) {
            console.log(err);
            var directory = {
                "currentDir": currentDir,
                "dir": dir
            };

            var activity = getActivityInstance();
            activity.context.invoke('browser_renamed', directory);
            activity.window.close();
        });
    }

});