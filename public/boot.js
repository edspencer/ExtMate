/**
 * Boots up the Ext MVC application in the current environment. The environment defaults to 'production',
 * override by setting ?environment=someEnvironment to the end of the url. Default installed environments
 * are 'development' and 'test'
 */
(function() {
  /**
   * @private
   * Inspects document.location and returns an object containing all of the url params
   * @return {Object} The url params
   */
  var parseLocationParams = function() {
    var args   = window.location.search.split("?")[1],
        //set default params
        params = {
          environment: 'production'
        };
    
    /**
     * Read config data from url parameters
     */
    if (args != undefined) {
      var argPairs = args.split("&");
      
      for (var i=0; i < argPairs.length; i++) {
        var splits = argPairs[i].split("="),
            key    = splits[0],
            value  = splits[1];

        params[key] = value;
      };
    }
    
    return params;
  };
  
  var params      = parseLocationParams(),
      environment = params.environment;
      
  var fileOrders = {
    production : [
      'http://extjs.cachefly.net/ext-3.0.0/adapter/ext/ext-base.js',
      'http://extjs.cachefly.net/ext-3.0.0/ext-all.js',
      '../vendor/mvc/ext-mvc-all.js',
      'application-all.js'
    ],
    development: [
      'http://extjs.cachefly.net/ext-3.0.0/adapter/ext/ext-base.js',
      'http://extjs.cachefly.net/ext-3.0.0/ext-all-debug.js',
      // 'javascripts/ext-base-debug.js',
      // 'javascripts/ext-all-debug.js',
      '../vendor/mvc/ext-mvc-all.js'
    ],
    test       : [
      'http://extjs.cachefly.net/ext-3.0.0/adapter/ext/ext-base.js',
      'http://extjs.cachefly.net/ext-3.0.0/ext-all-debug.js',
      '../vendor/mvc/ext-mvc-all.js',
      'application-all.js',
      '../vendor/jspec/lib/jspec.js',
      '../spec/TestHelper.js'
    ]
  };
  
  var filesToLoad = fileOrders[environment];
  for (var i=0; i < filesToLoad.length; i++) {
    document.write('<script type="text/javascript" src="' + filesToLoad[i] + '"></script>');
  };
})();