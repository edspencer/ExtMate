ExtMVC.registerController("documents", {
  // model: ExtMVC.getModel("Document")
  
  build: function() {
    this.render('new');
  },
  
  initListeners: function() {
    
  },
  
  edit: function(id) {
    var splits = id.split("-");
    
    return this.render("edit", {
      title: splits[splits.length - 1]
    });
  },
  
  /**
   * Copies the currently selected text from the current document
   * @return {String} The currently selected text
   */
  copy: function() {
    var tab = this.getCurrentDocumentTab();
    
    if (tab != undefined) this.setClipText(tab.editor.getSelectedText());
  },
  
  /**
   * Pastes the given text into the current document at each current cursor
   * @param {String} text The text to print
   */
  paste: function(text) {
    var tab = this.getCurrentDocumentTab();
    
    if (tab != undefined) tab.editor.paste(this.getClipText());
  },
  
  /**
   * Returns the Document model bound to the currently active tab
   * @return {ExtMate.models.Document} The document in the currently active tab
   */
  getCurrentDocument: function() {
    return this.getCurrentDocumentTab().editor.instance;
  },
  
  /**
   * Returns the currently active document tab
   * @return {Ext.Panel} The tab which is currently active
   */
  getCurrentDocumentTab: function() {
    return ExtMVC.app.main.getActiveTab();
  },
  
  /**
   * @property clipText
   * @type String
   * The current contents of the clipboard
   */
  clipText: "",
  
  /**
   * Sets the clipboard text to the string supplied
   * @param {String} text The text to set
   */
  setClipText: function(text) {
    this.clipText = text;
  },
  
  /**
   * Returns the text currently on the clip board
   * @return {String} The clip text
   */
  getClipText: function() {
    return this.clipText;
  }
});