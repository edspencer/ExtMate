ExtMVC.registerView('layout', 'menu', {
  xtype      : 'treepanel',
  title      : 'Menu',
  collapsible: true,
  
  constructor: function(config) {
    config = config || {};
          
    Ext.applyIf(config, {
      root: {
        text    : 'Menu',
        id      : 'menu',
        nodeType: 'async',
        expanded: true,
        children: [
          
        ]
      }
    });
    
    Ext.tree.TreePanel.prototype.constructor.call(this, config);
  }
});