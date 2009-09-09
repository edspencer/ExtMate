ExtMVC.registerView('documents', 'editor', {
  xtype: 'panel',
  autoEl: {
    tag: 'canvas'
  },
  
  constructor: function(config) {
    config = config || {};
          
    Ext.applyIf(config, {
      /**
       * @property gutterWidth
       * @type Number
       * The current width of the line numbering gutter (set with setGutterWidth)
       */
      gutterWidth: 0,
      
      /**
       * @property gutterMargin
       * @type Number
       * Number of pixels of whitespace to leave to the right of the gutter before printing text (defaults to 5)
       */
      gutterMargin: 5,
      
      /**
       * @property gutterPadding
       * @type Number
       * Number of pixels between the leftmost edge of the gutter and the line numbers (defaults to 10)
       */
      gutterPadding: 10,
      
      /**
       * @property lineHeight
       * @type Number
       * The height of each line (read only)
       */
      lineHeight: 14,
      
      /**
       * @property fontSize
       * @type Number
       * The font size to use (defaults to 12). Set using setFontSize
       */
      fontSize: 12,
      
      /**
       * @property gutterColor
       * @type String
       * Hex color string to fill the gutter width
       */
      gutterColor: "#DEDEDE",
      
      /**
       * @property gutterTextColor
       * @type String
       * Hex color string to color the gutter text with
       */
      gutterTextColor: "#000000",
      
      /**
       * @property font
       * @type String
       * The font to use (defaults to monaco)
       */
      font: 'monaco',
      
      /**
       * @property firstLineNumber
       * @type Number
       * The number of the first line visible at the top of the canvas
       */
      firstLineNumber: 1,
      
      /**
       * @property cursorWidth
       * @type Number
       * The width in pixels to draw each cursor (defaults to 1)
       */
      cursorWidth: 1,
      
      /**
       * @property cursorColor
       * @type String
       * Hex color code for the cursor (defaults to '#000000')
       */
      cursorColor: "#000000",
      
      /**
       * @property cursors
       * @type Array
       * Array containing all of the cursors for this canvas. There is always at least 1 cursor
       */
      cursors: [],
      
      /**
       * @property selections
       * @type Array
       * Array containing all Selections currently made on this canvas's document
       */
      selections: [],
      
      /**
       * @property isSelecting
       * @type Boolean
       * True if the user is currently dragging out a selection
       */
      isSelecting: false,
      
      /**
       * @property selectionColor
       * @type String
       * Hex value of the selection highlight
       */
      selectionColor: "#E1EEFF"
    });
    
    Ext.Panel.prototype.constructor.call(this, config);
    
    this.addDefaultCursor();
    
    this.addEvents(
      /**
       * @event cursor-moved
       * Fires when the main cursor has moved
       * @param {ExtMate.models.Cursor} cursor The cursor that moved
       */
      'cursor-moved',
      
      /**
       * @event paste
       * Fires when text has been copied in
       * @param {String} text The text that has been copied in
       */
      'paste'
    );
    
    this.on('render', this.initCanvas, this);
  },
  
  /**
   * Adds a default cursor to the cursors array
   */
  addDefaultCursor: function() {
    var cursor = ExtMVC.buildModel("Cursor", {
      line  : 1,
      column: 1
    });
    
    this.addCursor(cursor);
  },
  
  /**
   * Called on render - initializes references to the canvas and listens to events the canvas element fires
   */
  initCanvas: function() {
    var el  = this.el,
        dom = el.dom;
    
    dom.height = this.ownerCt.getHeight() - 48;
    dom.width  = this.ownerCt.getWidth();
    
    /**
     * @property context
     * @type Context
     * The editor's internal canvas context
     */
    this.context = this.el.dom.getContext('2d');
    
    this.setFont(this.font, false);
    
    el.on({
      scope    : this,
      click    : this.onClick,
      mousedown: this.startSelection
      // mouseup  : this.endSelection
    });
    
    Ext.get(document).on('keypress', this.onKeyPress, this);
  },
  
  /**
   * Binds a Document instance to this editor, updates the editor whenever the Document is updated
   * @param {GetIt.models.Document} instance The document instance
   */
  bind: function(instance) {
    /**
     * @property instance
     * @type ExtMate.models.Document
     * The Document instance currently bound to this editor
     */
    this.instance = instance;
    
    this.eachCursor(function(cursor) {
      cursor.constrainTo(instance);
    });
    
    if (this.rendered) {
      this.draw();
    } else {
      this.on('render', this.draw, this, {single: true});
    }
  },
  
  /**
   * Draws the currently visibly section of the document
   */
  draw: function() {
    this.clear();
    
    var instance    = this.instance,
        body        = instance.get('body'),
        rawLines    = body.split("\n"),
        
        lineCount   = rawLines.length,
        lines       = [],
        gutterWidth = 15 + lineCount.toString().length * 10;
    
    //set gutter width based on the number of lines in the Document
    this.setGutterWidth(gutterWidth, false);
    
    for (var i=0; i < rawLines.length; i++) {
      lines.push({
        number: i + 1,
        text  : rawLines[i]
      });
    };
    
    this.drawGutter();
    this.drawSelections();
    this.drawLines(lines);
    this.drawCursors();
  },
  
  /**
   * @private
   * Attached to mousedown event, records line/column of selection start
   */
  startSelection: function(e) {
    this.isSelecting = true;
    this.selectionStart = this.cursorPositionForEvent(e);
  },
  
  /**
   * @private
   * Attached to mouseup event, records line/column of selection end and creates a selection if appropriate
   * @param {Ext.EventObject} e The mouseup event
   * @return {Boolean} True if a selection was made, false if the user just clicked
   */
  endSelection: function(e) {
    this.isSelecting = false;
    
    var coords   = this.cursorPositionForEvent(e),
        selStart = this.selectionStart;
    
    //don't create a selection if mousedown location is same as mouseup location
    if (coords.column == selStart.column && coords.line == selStart.line) return false;
    
    var selection = ExtMVC.buildModel("Selection", {
      start: selStart,
      end  : coords
    });
    
    if (!e.ctrlKey) this.clearSelections(false);
    this.addSelection(selection);
    
    return true;
  },
  
  /**
   * Adds a selection to the array
   * @param {ExtMate.models.Selection} selection The selection to add
   * @param {Boolean} redraw True to automatically redraw (defaults to true)
   */
  addSelection: function(selection, redraw) {
    this.selections.push(selection);
    
    if (redraw !== false) this.draw();
  },
  
  /**
   * Clears all current selections
   * @param {Boolean} redraw True to automatically redraw (defaults to true)
   */
  clearSelections: function(redraw) {
    this.selections = [];
    
    if (redraw !== false) this.draw();
  },
  
  /**
   * Returns the width of the gutter
   * @return {Number} Width (in pixels) of the document gutter
   */
  getGutterWidth: function() {
    return this.gutterWidth;
  },
  
  /**
   * Sets the gutter width and redraws
   * @param {Number} width The width to set the gutter to
   * @param {Boolean} redraw True to redraw after gutter resize (defaults to true)
   */
  setGutterWidth: function(width, autoRedraw) {
    this.gutterWidth = width;
    if (autoRedraw !== false) this.draw();
  },
  
  /**
   * Draws the gutter
   */
  drawGutter: function() {
    var c = this.getContext();
    c.fillStyle = this.gutterColor;
    c.fillRect(0, 0, this.gutterWidth, this.el.getHeight());
  },
  
  /**
   * Draws an array of lines to the canvas
   * @param {Array} lines The array of lines to draw
   */
  drawLines: function(lines) {
    var c = this.getContext();
    c.save();
    
    for (var i=0; i < lines.length; i++) {
      var line = lines[i];
      
      //move drawing cursor down a line
      c.translate(0, this.lineHeight);
      
      //draw line number
      c.fillStyle = this.gutterTextColor;
      c.fillText(line.number, this.gutterPadding, 0);
      
      //draw line
      c.fillText(line.text, this.getLineStartX(), 0);
    };
    
    c.restore();
  },
  
  /**
   * Draws each cursor in the cursors array
   */
  drawCursors: function() {
    var c = this.getContext();
    
    Ext.each(this.cursors, function(cursor) {
      c.save();
      c.fillStyle = this.cursorColor;
      
      c.translate(
        this.xForColumnNumber(cursor.get('column')),
        this.yForLineNumber(cursor.get('line')) + 3
      );
      
      c.fillRect(0, 0, -this.cursorWidth, -this.lineHeight);
      
      c.restore();
    }, this);
  },
  
  /**
   * Draws each selection in turn
   */
  drawSelections: function() {
    var c = this.getContext();
    
    Ext.each(this.selections, function(selection) {
      c.save();
      c.fillStyle = this.selectionColor;
      var start = selection.get('start'),
          end   = selection.get('end');
      
      if (start.line == end.line) {
        var selWidth = Math.round(this.getColumnWidth() * (end.column - start.column));
        
        c.translate(
          this.getLineStartX() + ((start.column - 1) * this.getColumnWidth()), 
          this.lineHeight * (start.line - this.firstLineNumber)
        );
        
        c.fillRect(0, 0, selWidth, this.lineHeight);
      }
      
      c.restore();
    }, this);
  },
  
  /**
   * Clears the canvas
   */
  clear: function() {
    this.getContext().clearRect(0, 0, this.el.getWidth(), this.el.getHeight());
  },
  
  /**
   * Attached to keypress event - updates document at each cursor
   * @param {Ext.EventObject} e the Event object
   */
  onKeyPress: function(e) {
    e.stopEvent();
    
    var actionTaken = false;
    
    switch (e.getKey()) {        
      case e.ENTER:
        this.insertAtEachCursor("\n", false);
        this.eachCursor('moveDown');
        this.eachCursor("moveFarLeft");
        
        actionTaken = true;
        break;
      case e.ESC:
      
        actionTaken = true;
        break;
      // case e.DELETE:
      //   // console.log('delete');
      //   this.eachCursor(function(cursor) {
      //     this.instance.remove(cursor.get('line'), cursor.get('column') + 1);
      //   });
      //   
      //   actionTaken = true;
      //   break;
      case e.BACKSPACE:
        this.eachCursor(function(cursor) {
          var line   = cursor.get('line'),
              column = cursor.get('column'),
              coords = e.ctrlKey
                     ? {column: 1}
                     : e.altKey ? this.instance.previousWord(line, column) : {column: column - 1},
              amount = column - coords.column;
              
          this.instance.remove(line, column, amount);
          cursor.moveLeft();
        });
        
        actionTaken = true;
        break;
    }
    
    if (!actionTaken) {
      if (e.isNavKeyPress()) {
        this.eachCursor(function(cursor) {
          //map key codes to arrow directions
          var directions = {
            37: "Left",
            38: "Up",
            39: "Right",
            40: "Down"
          };
          
          var modifier = '';
          if (e.ctrlKey) modifier = 'Far';
          if (e.altKey)  modifier = 'Next';
          
          var fnName = String.format("move{0}{1}", modifier, directions[e.getKey()]);
          cursor[fnName]();
        });

        this.fireEvent('cursor-moved', this.cursors[0]);
      } else if (e.isSpecialKey()) {
        // console.log('special');
        // console.log(e);
        // console.log(e.getKey());
      } else {
        var letter = String.fromCharCode(e.getKey());
        this.insertAtEachCursor(letter);
      }      
    }
    
    this.draw();
  },
  
  /**
   * Returns all currently selected text
   * @return {String} The currently selected text
   */
  getSelectedText: function() {
    var text = "";
    
    Ext.each(this.selections, function(selection) {
      text = this.instance.getTextForSelection(selection);
    }, this);
    
    return text;
  },
  
  /**
   * Pastes the given text into the document
   * @param {String} text The text to paste
   */
  paste: function(text) {
    this.eachCursor(function(cursor) {
      var line   = cursor.get('line'),
          column = cursor.get('column');
      
      var obj = {
        line  : line,
        column: column,
        text  : text
      };
      
      this.instance.insert(obj);
      cursor.moveTo(line, column + text.length);
    });
    
    if (this.fireEvent('paste', text) !== false) this.draw();
  },
  
  /**
   * Calls the given function with each cursor
   * @param {Function} fn The function to call
   * @param {Object} scope Optional scope
   */
  eachCursor: function(fn, scope) {
    scope = scope || this;
    
    if (Ext.isString(fn)) {
      Ext.each(this.cursors, function(cursor) { cursor[fn](); }, scope);
    } else {
      Ext.each(this.cursors, fn, scope);
    }
  },
  
  /**
   * Inserts a string at each cursor
   * @param {String} str The string to insert
   * @param {Boolean} moveRight True to automatically move the cursor 1 to the right (defaults to true)
   */
  insertAtEachCursor: function(str, moveRight) {
    this.eachCursor(function(cursor) {
      this.instance.insert({
        line  : cursor.get('line'),
        column: cursor.get('column'),
        text  : str
      });

      if (moveRight !== false) cursor.moveRight();
    });
  },
  
  /**
   * Attached to the canvas' click event. Normalises click co-ordinates
   * @param {Ext.EventObject} e The event object
   */
  onClick: function(e) {
    var madeSelection = this.endSelection(e);
    
    //normalise click XY data to make it relative to the canvas element instead of the page
    var coords = this.cursorPositionForEvent(e);
    
    if (e.ctrlKey) {
      var cursor = ExtMVC.buildModel("Cursor", {
        line  : coords.line,
        column: coords.column
      });
      
      this.addCursor(cursor);
      cursor.moveTo(cursor.get('line'), cursor.get('column'));
    } else {
      this.removeCursors();
      if (!madeSelection) this.clearSelections(false);
      
      var cursor = this.cursors[0];
      cursor.moveTo(coords.line, coords.column);
      
      this.fireEvent('cursor-moved', cursor);
    }

    this.draw();
  },
  
  /**
   * Adds a cursor to the collection
   * @param {ExtMate.models.Cursor} cursor The cursor to add
   * @param {Boolean} constrain True to constrain the cursor to the document (defaults to true)
   */
  addCursor: function(cursor, constrain) {
    this.cursors.push(cursor);
    
    if (constrain !== false) cursor.constrainTo(this.instance);
  },
  
  /**
   * Removes all but the default cursor
   */
  removeCursors: function() {
    this.cursors = [this.cursors[0]];
  },
  
  /**
   * Returns the normalised line/column numbers for a click event
   * @param {Ext.EventObject} e The event object
   */
  cursorPositionForEvent: function(e) {
    var elXY = this.el.getXY(),
        elX  = elXY[0],
        elY  = elXY[1],
        xy   = e.getXY(),
        x    = xy[0] - elX,
        y    = xy[1] - elY;
        
    return this.cursorPositionForCoords(x, y);
  },
  
  /**
   * Utility method to turn a click event's co-ordinates into a line and column number
   * @param {Number} x The x co-ordinate of the click event
   * @param {Number} y The y co-ordinate of the click event
   * @return {Object} Object containing line and column numbers
   */
  cursorPositionForCoords: function(x, y) {
    var xOffset = this.getLineStartX();
    
    if (x < xOffset) {
      //user has clicked in the gutter
      
    } else {
      var pageX = x - xOffset,
          pageY = y;
      
      return {
        line  : this.lineForY(pageY),
        column: this.columnForX(pageX)
      };
    }
  },
  
  /**
   * Returns the y co-ordinate for a given line number
   * @param {Number} line The line number
   * @return {Number} The y co-ordinate
   */
  yForLineNumber: function(line) {
    return Math.floor((line - (this.firstLineNumber - 1)) * this.lineHeight);
  },
  
  /**
   * Returns the x co-ordinate for a given column number
   * @param {Number} column The column number
   * @return {Number} The x co-ordinate
   */
  xForColumnNumber: function(column) {
    return Math.floor(this.getLineStartX() + (this.getColumnWidth() * (column - 1)));
  },
  
  /**
   * Returns the line number for a given y co-ordinate
   * @param {Number} y The y co-ordinate
   * @return {Number} The line number
   */
  lineForY: function(y) {
    return Math.round(y / this.lineHeight + (this.firstLineNumber - 1));
  },
  
  /**
   * Returns the column number for a given x co-ordinate
   * @param {Number} x The x co-ordinate
   * @return {Number} The column number
   */
  columnForX: function(x) {
    return Math.round(x / this.getColumnWidth() + 1);
  },
  
  /**
   * Returns the width in pixels of each column
   * @return {Number} The width in pixels of each column
   */
  getColumnWidth: function() {
    return this.fontSize * 0.6;
  },
  
  /**
   * Sets a new font size and triggers a redraw
   * @param {Number} fontSize The new font size
   */
  setFontSize: function(fontSize) {
    this.fontSize   = fontSize;
    this.lineHeight = fontSize + 2;
    this.draw();
  },
  
  /**
   * Sets a new font and redraws the canvas
   * @param {String} fontName The new font to user
   * @param {Boolean} redraw True to redraw the canvas (defaults to true)
   */
  setFont: function(fontName, redraw) {
    this.font = fontName;
    this.getContext().font = String.format("{0}px monaco", this.fontSize);
    
    if (redraw !== false) this.draw();
  },
  
  /**
   * Returns the internal Canvas's 2d context
   * @return {Context} The context object
   */
  getContext: function() {
    return this.context;
  },
  
  /**
   * Returns the x co-ordinate of the start of each line (gutter width + gutter margin)
   * @return {Number} The x co-ordinate of the start of each line
   */
  getLineStartX: function() {
    return this.gutterWidth + this.gutterMargin;
  }
});