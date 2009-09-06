ExtMVC.registerView('layout', 'toolbar', {
  xtype: 'toolbar',
  
  constructor: function(config) {
    config = config || {};
          
    Ext.applyIf(config, {
      items: [
        this.buildFileMenu(),
        this.buildEditMenu()
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
            iconCls: 'new-file',
            scope  : this,
            handler: ExtMVC.dispatch.createDelegate(ExtMVC, ['documents', 'build'])
          },
          {
            text   : "Open Recent",
            menu   : {
              items: [
                {iconCls: 'file', text: 'ApplicationController.js'},
                {iconCls: 'file', text: 'Document.js'}
              ]
            }
          },
          {
            text   : "Save",
            scope  : this,
            iconCls: 'save-file',
            handler: function() {
              console.log('save');
            }
          }
        ]
      }
    };
  },
  
  buildEditMenu: function() {
    return {
      text: "Edit",
      menu: {
        items: [
          {
            text   : "Find",
            scope  : this,
            iconCls: 'find',
            handler: function() {
              console.log('find');
            }
          }
        ]
      }
    };
  }
});