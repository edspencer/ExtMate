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
    
    Ext.get('loading').remove();  
    Ext.get('loading-mask').fadeOut({remove:true});  
  }
});