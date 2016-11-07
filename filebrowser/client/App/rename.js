var name = getParam('name');
var dir = getParam('dir');
$(getInstanceID('name-input')).val(name);

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
        fileSystem.mv(targetdir);

        var activity =  getActivityInstance();
        activity.context.invoke('browser_renamed',directory);
        activity.window.close();
    }

});