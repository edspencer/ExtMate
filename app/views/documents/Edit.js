ExtMVC.registerView('documents', 'edit', {
  xtype        : 'panel',
  registerXType: 'document',
  title        : "New Document",
  closable     : true,
  autoScroll   : true,
  
  constructor: function(config) {
    config = config || {};
    
    /**
     * @property editor
     * @type Ext.Panel
     * The canvas editor bound to this panel
     */
    this.editor =  ExtMVC.buildView("documents", "editor", {
      
    });
          
    Ext.applyIf(config, {
      bbar  : this.buildBottomToolbar(),
      layout: 'fit',
      items : [
        this.editor
      ]
    });
    
    Ext.Panel.prototype.constructor.call(this, config);
    
    this.on('render', this.loadFakeRecord, this);
  },
  
  /**
   * Loads a document into this panel
   * @param {ExtMate.models.Document} instance The document to load
   */
  loadRecord: function(instance) {
    /**
     * @property instance
     * @type ExtMate.models.Document
     * The currently loaded document
     */
    this.instance = instance;
    
    this.editor.bind(instance);
  },
  
  loadFakeRecord: function() {
    var doc = ExtMVC.buildModel("Document", {
      body: "hmm\n  This is a test\nrah!"
    });
    
    this.loadRecord(doc);
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
        data   : [
          {
            name : 'JavaScript',
            id   : 'js'
          },
          {
            name : 'HTML',
            id   : 'html'
          },
          {
            name : 'CSS',
            id   : 'css'
          }
        ]
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