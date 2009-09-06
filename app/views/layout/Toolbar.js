ExtMVC.registerView('layout', 'toolbar', {
  xtype: 'toolbar',
  
  constructor: function(config) {
    config = config || {};
          
    Ext.applyIf(config, {
      items: [
        this.buildFileMenu()
      ]
    });
    
    Ext.Toolbar.prototype.constructor.call(this, config);    
  },
  
  buildFileMenu: function() {
    return {
      text : "File",
      menu : {
        items: [
          {
            text   : "New File",
            scope  : this,
            handler: this.onNewFile
          }
        ]
      }
    };
  },
  
  onNewFile: function() {
    
  }
});