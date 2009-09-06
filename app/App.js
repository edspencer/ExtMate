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
    this.initializeKeyMap();
    
    this.menu = ExtMVC.buildView('layout', 'menu', {
      region   : 'west',
      width    : 215,
      split    : true,
      listeners: {
        scope: this,
        click: function(node) {          
          if (!node.hasChildNodes()) {
            var attrs = node.attributes;
            
            ExtMVC.dispatch('documents', 'edit', [attrs.id]);
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
      
      enableTabScroll: true
    });
    
    this.viewport = new Ext.Viewport({
      layout: 'fit',
      items : [
        {
          layout: 'border',
          items :  [this.menu, this.main],
          tbar  : ExtMVC.buildView('layout', 'toolbar')
        }
      ]
    });
    
    
    this.fireEvent('launched');
    
    ExtMVC.dispatch('index', 'index');
    
    Ext.get('loading').remove();  
    Ext.get('loading-mask').fadeOut({remove:true});
  },
  
  initializeKeyMap: function(panel) {
    /**
     * @property keymap
     * @type Ext.KeyMap
     * The global KeyMap object
     */
    this.keymap = new Ext.KeyMap(document, [
      {
        key : 'n',
        ctrl: true,
        fn  : ExtMVC.dispatch.createDelegate(ExtMVC, ['documents', 'build']),
        stopEvent: true
      }
    ]);
  }
});