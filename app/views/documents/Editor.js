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
      firstLineNumber: 1
    });
    
    Ext.Panel.prototype.constructor.call(this, config);
    
    this.on('render', this.initCanvas, this);
  },
  
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
    
    console.log(coords);
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
      var columnWidth = this.fontSize * 0.625,
          pageX       = x - xOffset,
          pageY       = y;
      
      return {
        line  : Math.round(pageY / this.lineHeight + (this.firstLineNumber - 1)),
        column: Math.round(pageX / columnWidth + 1)
      };
    }
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