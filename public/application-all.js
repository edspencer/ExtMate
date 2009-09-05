/**
 * @class MyApp.App
 * @extends ExtMVC.App
 * The MyApp application.
 */
ExtMVC.App.define({
  name       : "MyApp",
  
  /**
   * Sets up the application's Viewport
   */
  launch: function() {
    Ext.QuickTips.init();
    
    this.menu = ExtMVC.buildView('layout', 'menu', {
      region   : 'west',
      width    : 240,
      listeners: {
        scope: this,
        click: function(node) {
          var attrs = node.attributes;
          
          if (attrs.controller != undefined) {
            ExtMVC.dispatch({controller: attrs.controller, action: attrs.action});
          }          
        }
      }
    });
    
    /**
     * @property main
     * @type Ext.Panel
     * A container into which views are rendered
     */
    this.main = new Ext.TabPanel({
      region: 'center',
      plain : true,
      cls   : 'mainPanel',
      
      enableTabScroll: true,
      listeners : {
        tabchange: function(tabPanel, tab){
          // Ext.History.add(tab.url);
        }
      }
    });
    
    this.viewport = new Ext.Viewport({
      layout: 'border',
      items:  [this.menu, this.main]
    });
    
    this.fireEvent('launched');
    
    ExtMVC.dispatch('index', 'index');
  }
});

/**
 * Defines all routes required for this application
 */
ExtMVC.router.Router.defineRoutes = function(map) {
  /**
   * Sets up REST-like urls for a given model or models:
   * 
   * map.resources('users');
   * 
   * Is equivalent to:
   * map.connect("users",           {controller: 'users', action: 'index'}); // #users
   * map.connect("users/new",       {controller: 'users', action: 'new'  }); // #users/new
   * map.connect("users/:id/edit/", {controller: 'users', action: 'edit' }); // #users/1/edit
   * map.connect("users/:id",       {controller: 'users', action: 'show' }); // #users/1
   * 
   * You can pass more than one model to a map.resources call, e.g.:
   *
   * map.resources('users', 'comments', 'pages', 'products');
   */
  
  //set up default routes
  map.connect(":controller/:action");
  map.connect(":controller/:action/:id");
  
  //if no url, should a default
  map.root({controller: 'index', action: 'index'});
};

/**
 * @class MyApp.controllers.ApplicationController
 * @extends ExtMVC.controller.CrudController
 * Shared application-wide controller. Place any application-specific code here that needs
 * to be shared amongst other application controllers, and make the other controllers in the
 * application extend this one
 */
ExtMVC.registerController("application", {
  extend: "controller"
});

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

ExtMVC.registerView('layout', 'menu', {
  xtype: 'panel',
  html : 'test'
});

/**
 * @class MyApp.views.index.Index
 * @extends Ext.Panel
 * Default Welcome to Ext MVC Panel - replace this with your own thing
 */
ExtMVC.registerView('index', 'index', {
  xtype: 'panel',
  
  initComponent: function() {
    Ext.applyIf(this, {
      title: "Welcome to Ext MVC",
      html:  "This is the default template, which is found in app/views/index/Index.js.  This is being displayed because your config/routes.js file has a map.root setting telling it to use the Index view of the IndexController"
    });
    
    Ext.Panel.prototype.initComponent.apply(this, arguments);
  }
});

