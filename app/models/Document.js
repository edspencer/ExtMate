ExtMVC.registerModel("Document", {
  fields: [
    {name: 'id',   type: 'int'},
    
    {name: 'name', type: 'string'},
    {name: 'body', type: 'string'}
  ],
  
  /**
   * Inserts a string at the given line/column point
   * @param {Object} config An object containing line, column and text
   */
  insert: function(config) {
    config = config || {};
    
    Ext.applyIf(config, {
      line  : 1,
      column: 1
    });
    
    var line    = this.getLine(config.line),
        pre     = line.substr(0, config.column - 1),
        post    = line.substr(config.column - 1),
        updated = String.format("{0}{1}{2}", pre, config.text, post);
        
    this.setLine(config.line, updated);
  },
  
  /**
   * Deletes the specified number of characters from the point immediately before the given line/column
   * @param {Number} lineNumber the line number
   * @param {Number} column the column number
   * @param {Number} num The number of characters to remove
   */
  remove: function(lineNumber, column, num) {
    num = num || 1;
    
    var line = this.getLine(lineNumber),
        pre  = line.substr(0, column - (1 + num)),
        post = line.substr(column - 1);
    
    this.setLine(lineNumber, pre + post);
  },
  
  /**
   * Overwrites a specific line number with new text
   * @param {Number} num The line number
   * @param {String} text The text to set the line to
   */
  setLine: function(num, text) {
    var body  = this.get('body'),
        lines = body.split("\n");
        
    lines[num - 1] = text;
    this.set('body', lines.join("\n"));
  },
  
  /**
   * Gets the text for a given line
   * @param {Number} num The line number to get
   * @return {String} The line
   */
  getLine: function(num) {
    var body  = this.get('body'),
        lines = body.split("\n");
        
    return lines[num - 1];
  }
});