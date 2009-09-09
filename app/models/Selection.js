ExtMVC.registerModel("Selection", {
  fields: [
    {name: 'start'},
    {name: 'end'},
    {name: 'document'}
  ],
  
  /**
   * Returns the selected text from the current document
   * @return {String} The selected text
   */
  getSelectedText: function() {
    return this.get('document').getTextForSelection(this);
  }
});