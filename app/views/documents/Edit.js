ExtMVC.registerView('documents', 'edit', {
  xtype        : 'panel',
  registerXType: 'document',
  title        : "New Document",
  closable     : true,
  
  constructor: function(config) {
    config = config || {};
          
    Ext.applyIf(config, {
      bbar: this.buildBottomToolbar()
    });
    
    Ext.Panel.prototype.constructor.call(this, config);
  },
  
  buildBottomToolbar: function() {
    /**
     * @property lineNumber
     * @type Ext.Toolbar.TextItem
     * Displays the current line number
     */
    this.lineNumber = new Ext.Toolbar.TextItem({
      text: "Line: 24"
    });
    
    /**
     * @property columnNumber
     * @type Ext.Toolbar.TextItem
     * Displays the current column number
     */
    this.columnNumber = new Ext.Toolbar.TextItem({
      text: "Column 18"
    });
    
    /**
     * @property languageCombo
     * @type Ext.form.ComboBox
     * Allows the user to select which language the file is int
     */
    this.languageCombo = new Ext.form.ComboBox({
      name          : 'language',
      mode          : 'local',
      editable      : false,
      forceSelection: true,
      triggerAction : 'all',
      displayField  : 'name',
      valueField    : 'id',
      value         : 'JavaScript',
      
      store: new Ext.data.JsonStore({
        fields : ['name', 'id'],
        data   : [{
          name : 'JavaScript',
          id   : 'js'
        }]
      })
    });
    
    
    return new Ext.Toolbar({
      items: [
        this.lineNumber,
        ' ',
        this.columnNumber,
        '-',
        this.languageCombo
      ]
    });
  }
});