
var browser_boot = function(browserService){

  browserService.getOrigin(null, function(err, origin){

    browserService.origin = origin;
    browserService.registerOrigin();

    var builder = new soyut.Platform.AppBuilder();
    builder.setOrigin('https://' + origin);

    builder.setConfigURL('https://' + origin + '/module_browser.json', function(err, builder){
        if(!err)
            builder.build()
    });
  });
};

soyut.Services.getInstance().subscribeOnAttachService("browserServer", function(browserService){
  browser_boot(browserService)
});