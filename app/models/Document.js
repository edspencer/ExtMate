ExtMVC.registerModel("Document", {
  fields: [
    {name: 'id',   type: 'int'},
    
    {name: 'name', type: 'string'},
    {name: 'body', type: 'string'}
  ],
  
  /**
   * Returns the lime + column numbers of the next whitespace after the given location
   * @param {Number} lineNumber The line number
   * @param {Number} columnNumber The column number
   * @return {Object} Object containing the column/line numbers of the next white space element
   */
  nextWhiteSpace: function(lineNumber, columnNumber) {
    var line = this.getLine(lineNumber),
        str  = line.substr(columnNumber - 1);
    
    var index = str.indexOf(" ");
    if (index == -1) index = str.length;
    
    return {
      line  : lineNumber,
      column: columnNumber + index + 1
    };
  },
  
  /**
   * Returns the lime + column numbers of the previos whitespace before the given location
   * @param {Number} lineNumber The line number
   * @param {Number} columnNumber The column number
   * @return {Object} Object containing the column/line numbers of the previous white space element
   */
  previousWord: function(lineNumber, columnNumber) {
    var line   = this.getLine(lineNumber),
        str    = line.substr(0, columnNumber),
        splits = str.split(" ");

    var index = Ext.sum(Ext.pluck(splits, 'length'));
    if (index == -1) index = 0;

    return {
      line  : lineNumber,
      column: index
    };
  },
  
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
    
    var line = this.getLine(lineNumber);
    
    if (line.length == 0) {
      this.removeLine(lineNumber);
    } else {
      var pre     = line.substr(0, column - (1 + num)),
          post    = line.substr(column - 1),
          updated = pre + post;
          
      this.setLine(lineNumber, updated);
    }
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
  },
  
  /**
   * Returns an array of lines starting at the start line and for the given total
   */
  getLines: function(startLine, total) {
    var currentLine = startLine,
        endLine     = Math.min(startLine + total, this.getLineCount()),
        lines       = [];
    
    while (currentLine <= endLine) {
      lines.push(this.getLine(currentLine));
      
      currentLine += 1;
    }
    
    return lines;
  },
  
  /**
   * Removes the given line by number
   * @param {Number} lineNumber The line to remove
   */
  removeLine: function(lineNumber) {
    var lines = this.get('body').split("\n");
    
    var newLines = lines.slice(0, lineNumber - 1);
    newLines = newLines.concat(lines.slice(lineNumber));
    
    this.set('body', newLines.join("\n"));
  },
  
  /**
   * Returns the number of lines in the document
   * @return {Number} The number of lines in the document
   */
  getLineCount: function() {
    return this.get('body').split("\n").length;
  },
  
  /**
   * Returns all text that should be selected according to a given Selection instance
   * @param {ExtMate.models.Selection} selection The selection to get text for
   * @return {String} The selected text
   */
  getTextForSelection: function(selection) {
    return this.getTextBetween(selection.get('start'), selection.get('end'));
  },
  
  /**
   * Returns the segment of this document between the two points
   * @param {Object} startCoords The line/column to retrieve from
   * @param {Object} endCoords The line/column to retrieve until
   * @return {String} The text segment
   */
  getTextBetween: function(startCoords, endCoords) {
    var startCol = startCoords.column,
        endCol   = endCoords.column;
        
    if (startCoords.line == endCoords.line) {
      //just getting text on 1 line
      var line = this.getLine(startCoords.line);
      
      return line.slice(startCol - 1, endCol - 1);
    } else {
      //multiline select
      var currentLine = startCoords.line,
          startLine   = startCoords.line,
          endLine     = endCoords.line,
          text        = "";
      
      while (currentLine <= endLine) {
        var line = this.getLine(currentLine);
        currentLine += 1;
        
        if (currentLine == startLine) {
          text += line.slice(startCol - 1);
        } else if (currentLine == endLine) {
          text += line.slice(0, endCol - 1);
        } else {
          text += line;
        }
      }
      
      return text;
    }
  }
});





