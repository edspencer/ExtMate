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
      gutterColor: "#dddddd",
      
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
      cursorColor: "#000000"
    });
    
    Ext.Panel.prototype.constructor.call(this, config);
    
    /**
     * @property cursors
     * @type Array
     * Array containing all of the cursors for this canvas. There is always at least 1 cursor
     */
    this.cursors = [];
    this.addDefaultCursor();
    
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
    
    this.cursors.push(cursor);
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
      scope: this,
      click: this.onClick,
      keypress: function(e) {
        console.log('key');
        console.log(arguments);
      }
    });
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
    this.drawLines(lines);
    this.drawCursors();
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
   * Clears the canvas
   */
  clear: function() {
    this.getContext().clearRect(0, 0, this.el.getWidth(), this.el.getHeight());
  },
  
  /**
   * Attached to the canvas' click event. Normalises click co-ordinates
   * @param {Ext.EventObject} e The event object
   */
  onClick: function(e) {
    //normalise click XY data to make it relative to the canvas element instead of the page
    var elXY = this.el.getXY(),
        elX  = elXY[0],
        elY  = elXY[1],
        xy   = e.getXY(),
        x    = xy[0] - elX,
        y    = xy[1] - elY;
    
    var coords = this.cursorPositionForCoords(x, y);
    
    var cursor = this.cursors[0];
    cursor.set('line', coords.line);
    cursor.set('column', coords.column);
    this.draw();
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
    return this.fontSize * 0.72;
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