/**
 * @class MyApp.controllers.IndexController
 * @extends MyApp.controllers.ApplicationController
 * Default root controller
 */
ExtMVC.registerController("index", {
  index: function() {
    this.render('index');
  }
});