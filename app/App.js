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
    
    /**
     * @property scroller
     * @type Ext.Panel
     * The scroller proxy
     */
    this.scroller = ExtMVC.buildView("documents", "scroller", {
      region: 'east',
      layout: 'fit'
    });
    
    this.viewport = new Ext.Viewport({
      layout: 'fit',
      items : [
        {
          layout: 'border',
          items :  [this.menu, this.main, this.scroller],
          tbar  : ExtMVC.buildView('layout', 'toolbar')
        }
      ]
    });
    
    
    this.fireEvent('launched');
    
    ExtMVC.dispatch('index', 'index');
    
    Ext.get('loading').remove();  
    Ext.get('loading-mask').fadeOut({remove:true});
    
    // this.scroller.setScrollerHeight(2000);
  },
  
  /**
   * @property ctrlKeys
   * @type Object
   * Object mapping key to documents controller action when the ctrl key is held down
   */
  ctrlKeys: {
    'c': 'copy',
    'v': 'paste',
    'n': 'build',
    'a': 'selectAll'
  },
  
  initializeKeyMap: function(panel) {
    /**
     * @property keymap
     * @type Ext.KeyMap
     * The global KeyMap object
     */
    this.keymap = new Ext.KeyMap(document, []);
        
    Ext.iterate(this.ctrlKeys, function(key, action) {
      this.keymap.addBinding({
        key : key,
        ctrl: true,
        fn  : ExtMVC.dispatch.createDelegate(ExtMVC, ['documents', action]),
        stopEvent: true
      });
    }, this);
  }
});