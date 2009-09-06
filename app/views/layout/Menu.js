ExtMVC.registerView('layout', 'menu', {
  xtype      : 'treepanel',
  collapsible: true,
  
  constructor: function(config) {
    config = config || {};
          
    Ext.applyIf(config, {
      root: {
        text    : 'Project',
        id      : 'menu',
        nodeType: 'async',
        expanded: true,
        children: [
          {
            text: 'app',
            expanded: true,
            children: [
              {
                text: 'App.js',
                leaf: true
              },
              {
                text: 'controllers',
                children: [
                  {text: 'ApplicationController.js', leaf: true},
                  {text: 'IndexController.js', leaf: true}
                ]
              },
              {
                text: 'models',
                children: [
                  
                ]
              },
              {
                text: 'views',
                children: [
                  {
                    text: 'index',
                    children: [{text: "Index.js", leaf: true}]
                  },
                  {
                    text: 'layout',
                    children: [{text: 'Menu.js', leaf: true}]
                  }
                ]
              }
            ]
          },
          {
            text: 'config',
            children: []
          },
          {
            text: 'lib',
            children: []
          },
          {
            text: 'public',
            children: []
          },
          {
            text: 'script',
            children: []
          },
          {
            text: 'spec',
            children: []
          },
          {
            text: 'vendor',
            children: []
          }
        ]
      },
      bbar: this.buildBottomToolbar()
    });
    
    Ext.tree.TreePanel.prototype.constructor.call(this, config);
  },
  
  /**
   * Builds the bottom toolbar
   * @return {Ext.Toolbar} The bottom toolbar
   */
  buildBottomToolbar: function() {
    /**
     * @property newFileButton
     * @type Ext.Button
     * Bottom toolbar button to create a new file
     */
    this.newFileButton = new Ext.Button({
      text    : '',
      iconCls : 'new-file',
      scope   : this,
      handler : this.onNewFile,
      tooltip : "Create a new file"
    });
    
    /**
     * @property newDirectoryButton
     * @type Ext.Button
     * Bottom toolbar button to create a new directory
     */
    this.newDirectoryButton = new Ext.Button({
      text    : '',
      iconCls : 'new-directory',
      scope   : this,
      handler : this.onNewDirectory,
      tooltip : "Create a new directory"
    });
    
    return new Ext.Toolbar({
      items: [
        this.newFileButton,
        '-',
        this.newDirectoryButton
      ]
    });
  },
  
  onNewFile: function() {
    
  },
  
  onNewDirectory: function() {
    
  }
});