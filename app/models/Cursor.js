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
    column = Math.max(column || this.get('column'), 1);
    
    //constrain to document
    if (this.doc != undefined) {
      line   = Math.min(line, this.doc.getLineCount());
      column = Math.min(column, this.doc.getLine(line).length + 1);
    }
    
    this.set('line',   line);
    this.set('column', column);
  },
  
  /**
   * Moves the cursor to the next whitespace to the right
   */
  moveNextRight: function() {
    if (this.doc == undefined) return;
    
    var location = this.doc.nextWhiteSpace(this.get('line'), this.get('column'));
    
    if (location.line && location.column) this.moveTo(location.line, location.column);
  },
  
  /**
   * Moves the cursor to the next whitespace to the left
   */
  moveNextLeft: function() {
    if (this.doc == undefined) return;
    
    var location = this.doc.previousWhiteSpace(this.get('line'), this.get('column'));
    
    if (location.line && location.column) this.moveTo(location.line, location.column);
  },
  
  moveNextUp  : function() {},
  moveNextDown: function() {},
  
  /**
   * Moves the cursor as far to the left as possible
   */
  moveFarLeft: function() {
    this.moveTo(this.get('line'), 1);
  },
  
  /**
   * Moves the cursor as far to the right as possible
   */
  moveFarRight: function() {
    if (this.doc == undefined) return;
    
    var lineLength = this.doc.getLine(this.get('line')).length;
    
    this.moveTo(this.get('line'), lineLength + 1);
  },
  
  /**
   * Moves the cursor as far up as possible
   */
  moveFarUp: function() {
    this.moveTo(1, this.get('column'));
  },
  
  /**
   * Moves the cursor as far down as possible
   */
  moveFarDown: function() {
    if (this.doc == undefined) return;
    
    this.moveTo(this.doc.getLineCount(), this.get('column'));
  },
  
  moveLeft: function() {
    if (this.get('column') == 1) {
      var lineNum    = this.get('line') - 1,
          lineLength = this.doc.getLine(lineNum).length;
          
      this.moveTo(lineNum, lineLength + 1);
    } else {
      this.move('column', -1);
    }
  },
  
  moveRight: function() {
    var lineNum    = this.get('line'),
        lineLength = this.doc.getLine(lineNum).length;
        
    if (this.get('column') == lineLength + 1) {
      this.moveTo(this.get('line') + 1, 1);
    } else {
      this.move('column', 1);
    }
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