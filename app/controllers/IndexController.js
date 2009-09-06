/**
 * @class MyApp.controllers.IndexController
 * @extends MyApp.controllers.ApplicationController
 * Default root controller
 */
ExtMVC.registerController("index", {
  index: function() {
    //open up a couple of dummy files
    Ext.each(['IndexController.js'], function(file) {
      this.render('documents', 'edit', {
        title: file
      });
    }, this);
  }
});