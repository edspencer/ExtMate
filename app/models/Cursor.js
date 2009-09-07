ExtMVC.registerModel("Cursor", {
  fields: [
    {name: 'id',     type: 'int'},
    {name: 'line',   type: 'int'},
    {name: 'column', type: 'int'}
  ],
  
  /**
   * Constrains the cursor to the specified document. Attempting to move the cursor outside
   * the bounds of this document will cause it to move as close as possible to the new location
   * @param {ExtMate.models.Document} doc The document to constrain to
   */
  constrainTo: function(doc) {
    /**
     * @property doc
     * @type ExtMate.models.Document
     * The document instance this cursor is currently constrained to
     */
    this.doc = doc;
  },
  
  moveTo: function(line, column) {
    //constrain to top lef
    line   = Math.max(line, 1);
    column = Math.max(column, 1);
    
    //constrain to document
    if (this.doc != undefined) {
      line   = Math.min(line, this.doc.getLineCount());
      column = Math.min(column, this.doc.getLine(line).length + 1);
    }
    
    this.set('line',   line);
    this.set('column', column);
  },
  
  moveLeft: function() {
    this.move('column', -1);
  },
  
  moveRight: function() {
    this.move('column', 1);
  },
  
  moveUp: function() {
    this.move('line', -1);
  },
  
  moveDown: function() {
    this.move('line', 1);
  },
  
  /**
   * @private
   * Moves the cursor along one of the axes
   * @param {String} axis 'line' or 'column'
   * @param {Number} delta amount to move by
   */
  move: function(axis, delta) {
    var line    = this.get('line'),
        column  = this.get('column'),
        dLine   = axis == 'line' ? delta : 0,
        dColumn = axis == 'column' ? delta : 0;
    
    this.moveTo(line + dLine, column + dColumn);
  }
});