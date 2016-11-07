
var browser_boot = function(browserService){

  browserService.getOrigin(null, function(err, origin){

    browserService.origin = origin;
    browserService.registerOrigin();

    $.ajax({
      url: 'https://'+origin+'/module_browser.json',
      type: "GET",
      crossDomain: true,
      dataType: "json",
      success: function (config) {
        var app = new soyut.Platform.Application(config);
        app.bindToService(browserService)


        config.activities.forEach(function (activityinfo) {

          console.warn(activityinfo)
          //we need to create new activity based on config
          var newActivity = new soyut.Platform.Activity(activityinfo)

          var myWindow = new soyut.ui.Window();
          newActivity.setWindow(myWindow)
          //attach content
          activityinfo.contents.forEach(function(content){
            console.log('https://'+origin+content.url)
            newActivity.addContent(content.name, 'https://'+origin+content.url)
          })

          activityinfo.styles.forEach(function(style){
            console.log('https://'+origin+style.url)
            newActivity.addStyle(style.name, 'https://'+origin+style.url)
          })

          //no compiling library
          activityinfo.libraryScript.forEach(function(content){
            console.log('https://'+origin+content.url)
            newActivity.addScript(content.name, 'https://'+origin+content.url, true)
          })

          //no compiling library
          activityinfo.instanceScript.forEach(function(content){
            console.log('https://'+origin+content.url)
            newActivity.addScript(content.name, 'https://'+origin+content.url)
          })

          //adding activity to application
          if(activityinfo.launcher)
            app.addActivity(newActivity, true)
          else
            app.addActivity(newActivity)
          console.log("module "+config.appName+" loaded")
        })
      },
      error: function (xhr, status) {
        console.log("error get module config ");
      }
    })
  });
}

soyut.Services.getInstance().subscribeOnAttachService("browserServer", function(browserService){
  browser_boot(browserService)
})






/**
 * Created by TESPOOL-02 on 5/18/16.
 */
