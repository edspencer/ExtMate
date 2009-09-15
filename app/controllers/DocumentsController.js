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
      title: splits[splits.length - 1],
      listeners: {
        scope : this,
        scroll: this.updateScroller
      }
    });
  },
  
  /**
   * Tells the currently selected tab to select all text
   */
  selectAll: function() {
    this.withCurrentTab(function(tab) {
      tab.editor.selectAll();
    });
  },
  
  /**
   * Copies the currently selected text from the current document
   * @return {String} The currently selected text
   */
  copy: function() {
    this.withCurrentTab(function(tab) {
      this.setClipText(tab.editor.getSelectedText());
    });
  },
  
  /**
   * Pastes the given text into the current document at each current cursor
   * @param {String} text The text to print
   */
  paste: function(text) {
    this.withCurrentTab(function(tab) {
      tab.editor.paste(this.getClipText());
    });
  },
  
  /**
   * Runs the given function with a single argument of the current tab
   * @param {Function} fn The function to run
   * @param {Object} scope Optional scope object
   */
  withCurrentTab: function(fn, scope) {
    var tab = this.getCurrentDocumentTab();
    
    if (tab != undefined) fn.call(scope || this, tab);
  },
  
  /**
   * Updates the scroller proxy by resizing and moving it in line with the document currently in view
   * @param {Number} topLine The top line in view
   * @param {Number} totalLines The total number of lines
   * @param {Number} docHeight The height of the document <canvas>
   */
  updateScroller: function(topLine, totalLines, docHeight) {
    var scroller   = ExtMVC.app.scroller,
        sHeight    = scroller.getHeight(),
        lineHeight = docHeight / totalLines;
        
    scroller.setScrollerHeight(docHeight);
    scroller.scrollTo(topLine * lineHeight);
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