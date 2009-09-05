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