/**
 * @class MyApp.App
 * @extends ExtMVC.App
 * The MyApp application.
 */
ExtMVC.App.define({
  name       : "MyApp",
  
  /**
   * Sets up the application's Viewport
   */
  launch: function() {
    Ext.QuickTips.init();
    this.initializeKeyMap();
    
    this.menu = ExtMVC.buildView('layout', 'menu', {
      region   : 'west',
      width    : 215,
      split    : true,
      listeners: {
        scope: this,
        click: function(node) {          
          if (!node.hasChildNodes()) {
            var attrs = node.attributes;
            
            ExtMVC.dispatch('documents', 'edit', [attrs.id]);
          }
        }
      }
    });
    
    /**
     * @property main
     * @type Ext.Panel
     * A container into which views are rendered
     */
    this.main = new Ext.TabPanel({
      region: 'center',
      plain : true,
      cls   : 'mainPanel',
      
      enableTabScroll: true
    });
    
    this.viewport = new Ext.Viewport({
      layout: 'fit',
      items : [
        {
          layout: 'border',
          items :  [this.menu, this.main],
          tbar  : ExtMVC.buildView('layout', 'toolbar')
        }
      ]
    });
    
    
    this.fireEvent('launched');
    
    ExtMVC.dispatch('index', 'index');
    
    Ext.get('loading').remove();  
    Ext.get('loading-mask').fadeOut({remove:true});
  },
  
  /**
   * @property ctrlKeys
   * @type Object
   * Object mapping key to documents controller action when the ctrl key is held down
   */
  ctrlKeys: {
    'c': 'copy',
    'v': 'paste',
    'n': 'build',
    'a': 'selectAll'
  },
  
  initializeKeyMap: function(panel) {
    /**
     * @property keymap
     * @type Ext.KeyMap
     * The global KeyMap object
     */
    this.keymap = new Ext.KeyMap(document, []);
        
    Ext.iterate(this.ctrlKeys, function(key, action) {
      this.keymap.addBinding({
        key : key,
        ctrl: true,
        fn  : ExtMVC.dispatch.createDelegate(ExtMVC, ['documents', action]),
        stopEvent: true
      });
    }, this);
  }
});

/**
 * Defines all routes required for this application
 */
ExtMVC.router.Router.defineRoutes = function(map) {
  /**
   * Sets up REST-like urls for a given model or models:
   * 
   * map.resources('users');
   * 
   * Is equivalent to:
   * map.connect("users",           {controller: 'users', action: 'index'}); // #users
   * map.connect("users/new",       {controller: 'users', action: 'new'  }); // #users/new
   * map.connect("users/:id/edit/", {controller: 'users', action: 'edit' }); // #users/1/edit
   * map.connect("users/:id",       {controller: 'users', action: 'show' }); // #users/1
   * 
   * You can pass more than one model to a map.resources call, e.g.:
   *
   * map.resources('users', 'comments', 'pages', 'products');
   */
  
  //set up default routes
  map.connect(":controller/:action");
  map.connect(":controller/:action/:id");
  
  //if no url, should a default
  map.root({controller: 'index', action: 'index'});
};

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
  
  /**
   * Moves this cursor to the specified line and column, with bounds checking if bound to a document
   * @return {Object} Object containing the new line and column numbers
   */
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
    
    return {
      line  : this.get('line'),
      column: this.get('column')
    };
  },
  
  /**
   * Moves the cursor to the next whitespace to the right
   */
  moveNextRight: function() {
    if (this.doc == undefined) return;
    
    var location = this.doc.nextWhiteSpace(this.get('line'), this.get('column'));
    
    if (location.line && location.column) return this.moveTo(location.line, location.column);
  },
  
  /**
   * Moves the cursor to the next whitespace to the left
   */
  moveNextLeft: function() {
    if (this.doc == undefined) return;
    
    var location = this.doc.previousWord(this.get('line'), this.get('column'));
    
    if (location.line && location.column) return this.moveTo(location.line, location.column);
  },
  
  moveNextUp  : function() {},
  moveNextDown: function() {},
  
  /**
   * Moves the cursor as far to the left as possible
   */
  moveFarLeft: function() {
    return this.moveTo(this.get('line'), 1);
  },
  
  /**
   * Moves the cursor as far to the right as possible
   */
  moveFarRight: function() {
    if (this.doc == undefined) return;
    
    var lineLength = this.doc.getLine(this.get('line')).length;
    
    return this.moveTo(this.get('line'), lineLength + 1);
  },
  
  /**
   * Moves the cursor as far up as possible
   */
  moveFarUp: function() {
    return this.moveTo(1, this.get('column'));
  },
  
  /**
   * Moves the cursor as far down as possible
   */
  moveFarDown: function() {
    if (this.doc == undefined) return;
    
    return this.moveTo(this.doc.getLineCount(), this.get('column'));
  },
  
  moveLeft: function() {
    if (this.get('column') == 1) {
      var lineNum    = this.get('line') - 1,
          lineLength = this.doc.getLine(lineNum).length;
          
      return this.moveTo(lineNum, lineLength + 1);
    } else {
      return this.move('column', -1);
    }
  },
  
  moveRight: function() {
    var lineNum    = this.get('line'),
        lineLength = this.doc.getLine(lineNum).length;
        
    if (this.get('column') == lineLength + 1) {
      return this.moveTo(this.get('line') + 1, 1);
    } else {
      return this.move('column', 1);
    }
  },
  
  moveUp: function() {
    return this.move('line', -1);
  },
  
  moveDown: function() {
    return this.move('line', 1);
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
    
    return this.moveTo(line + dLine, column + dColumn);
  }
});

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

/**
 * @class MyApp.controllers.ApplicationController
 * @extends ExtMVC.controller.CrudController
 * Shared application-wide controller. Place any application-specific code here that needs
 * to be shared amongst other application controllers, and make the other controllers in the
 * application extend this one
 */
ExtMVC.registerController("application", {
  extend: "controller"
});

/**
 * @class MyApp.controllers.IndexController
 * @extends MyApp.controllers.ApplicationController
 * Default root controller
 */
ExtMVC.registerController("index", {
  index: function() {
    //open up a couple of dummy files
    Ext.each(['IndexController.js'], function(file) {
      this.render('documents', 'edit', {
        title: file
      });
    }, this);
  }
});

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

ExtMVC.registerView('layout', 'menu', {
  xtype      : 'treepanel',
  collapsible: true,
  
  constructor: function(config) {
    config = config || {};
          
    Ext.applyIf(config, {
      cls: 'file-menu',
      root: {
        text    : 'extmate',
        id      : 'menu',
        nodeType: 'async',
        expanded: true,
        children: [
          {
            text: 'app',
            expanded: true,
            children: [
              {
                text: 'App.js',
                leaf: true,
                id  : 'app-App.js'
              },
              {
                text: 'controllers',
                children: [
                  {text: 'ApplicationController.js', leaf: true, id: 'app-controllers-ApplicationController.js'},
                  {text: 'IndexController.js',       leaf: true, id: 'app-controllers-IndexController.js'}
                ]
              },
              {
                text: 'models',
                children: [
                  {text: "Document.js", leaf: true, id: 'app-models-Document.js'}
                ]
              },
              {
                text: 'views',
                children: [
                  {
                    text: 'index',
                    children: [{text: "Index.js", leaf: true}]
                  },
                  {
                    text: 'layout',
                    children: [
                      {text: 'Menu.js', leaf: true},
                      {text: 'Toolbar.js', leaf: true}
                    ]
                  }
                ]
              }
            ]
          },
          {
            text: 'config',
            children: []
          },
          {
            text: 'lib',
            children: []
          },
          {
            text: 'public',
            children: []
          },
          {
            text: 'script',
            children: []
          },
          {
            text: 'spec',
            children: []
          },
          {
            text: 'vendor',
            children: []
          }
        ]
      },
      bbar: this.buildBottomToolbar(),
      autoScroll: true
    });
    
    Ext.tree.TreePanel.prototype.constructor.call(this, config);
  },
  
  /**
   * Builds the bottom toolbar
   * @return {Ext.Toolbar} The bottom toolbar
   */
  buildBottomToolbar: function() {
    /**
     * @property newFileButton
     * @type Ext.Button
     * Bottom toolbar button to create a new file
     */
    this.newFileButton = new Ext.Button({
      text    : '',
      iconCls : 'new-file',
      scope   : this,
      handler : ExtMVC.dispatch.createDelegate(ExtMVC, ['documents', 'build']),
      tooltip : "Create a new file"
    });
    
    /**
     * @property newDirectoryButton
     * @type Ext.Button
     * Bottom toolbar button to create a new directory
     */
    this.newDirectoryButton = new Ext.Button({
      text    : '',
      iconCls : 'new-directory',
      scope   : this,
      handler : this.onNewDirectory,
      tooltip : "Create a new directory"
    });
    
    return new Ext.Toolbar({
      items: [
        this.newFileButton,
        '-',
        this.newDirectoryButton
      ]
    });
  }
});

ExtMVC.registerView('layout', 'toolbar', {
  xtype: 'toolbar',
  
  constructor: function(config) {
    config = config || {};
          
    Ext.applyIf(config, {
      items: [
        this.buildFileMenu(),
        this.buildEditMenu()
      ]
    });
    
    Ext.Toolbar.prototype.constructor.call(this, config);    
  },
  
  buildFileMenu: function() {
    return {
      text : "File",
      menu : {
        items: [
          {
            text   : "New File",
            iconCls: 'new-file',
            scope  : this,
            handler: ExtMVC.dispatch.createDelegate(ExtMVC, ['documents', 'build'])
          },
          {
            text   : "Open Recent",
            menu   : {
              items: [
                {iconCls: 'file', text: 'ApplicationController.js'},
                {iconCls: 'file', text: 'Document.js'}
              ]
            }
          },
          {
            text   : "Save",
            scope  : this,
            iconCls: 'save-file',
            handler: function() {
              console.log('save');
            }
          }
        ]
      }
    };
  },
  
  buildEditMenu: function() {
    return {
      text: "Edit",
      menu: {
        items: [
          {
            text   : "Find",
            scope  : this,
            iconCls: 'find',
            handler: function() {
              console.log('find');
            }
          }
        ]
      }
    };
  }
});

/**
 * @class MyApp.views.index.Index
 * @extends Ext.Panel
 * Default Welcome to Ext MVC Panel - replace this with your own thing
 */
ExtMVC.registerView('index', 'index', {
  xtype: 'panel',
  
  initComponent: function() {
    Ext.applyIf(this, {
      title: "Welcome to Ext MVC",
      html:  "This is the default template, which is found in app/views/index/Index.js.  This is being displayed because your config/routes.js file has a map.root setting telling it to use the Index view of the IndexController"
    });
    
    Ext.Panel.prototype.initComponent.apply(this, arguments);
  }
});

ExtMVC.registerView('documents', 'edit', {
  xtype        : 'panel',
  registerXType: 'document',
  title        : "New Document",
  closable     : true,
  autoScroll   : true,
  
  constructor: function(config) {
    config = config || {};
    
    /**
     * @property editor
     * @type Ext.Panel
     * The canvas editor bound to this panel
     */
    this.editor =  ExtMVC.buildView("documents", "editor", {
      listeners: {
        scope         : this,
        'cursor-moved': this.updateCursorLocation
      }
    });
          
    Ext.applyIf(config, {
      bbar  : this.buildBottomToolbar(),
      layout: 'fit',
      items : [
        this.editor
      ]
    });
    
    Ext.Panel.prototype.constructor.call(this, config);
    
    this.on('render', this.loadFakeRecord, this);
    
    this.relayEvents(this.editor, ['copy', 'paste']);
  },
  
  /**
   * Loads a document into this panel
   * @param {ExtMate.models.Document} instance The document to load
   */
  loadRecord: function(instance) {
    /**
     * @property instance
     * @type ExtMate.models.Document
     * The currently loaded document
     */
    this.instance = instance;
    
    this.editor.bind(instance);
  },
  
  /**
   * Updates the cursor status text
   * @param {ExtMate.models.Cursor} cursor The cursor
   */
  updateCursorLocation: function(cursor) {
    this.lineNumber.setText("Line: " + cursor.get('line'));
    this.columnNumber.setText("Column: " + cursor.get('column'));
  },
  
  loadFakeRecord: function() {
    var doc = ExtMVC.buildModel("Document", {
      body: 
        "ExtJS Text Editor\n" +
        "About:\n" +
        "\n" +
        "* <canvas> based\n" +
        "* Uses ExtJS MVC\n" +
        "* Aims to emulate E (http://e-texteditor.com)\n" +
        "* < 1KLOC\n" +
        "\n" +
        "* Select + multiple select\n" +
        "* Multiple cursor support (ctrl + click)\n" +
        "* Copy/Paste + paste to multiple"
    });
    
    this.loadRecord(doc);
  },
  
  buildBottomToolbar: function() {
    /**
     * @property lineNumber
     * @type Ext.Toolbar.TextItem
     * Displays the current line number
     */
    this.lineNumber = new Ext.Toolbar.TextItem({
      text: "Line: 1"
    });
    
    /**
     * @property columnNumber
     * @type Ext.Toolbar.TextItem
     * Displays the current column number
     */
    this.columnNumber = new Ext.Toolbar.TextItem({
      text: "Column 1"
    });
    
    /**
     * @property languageCombo
     * @type Ext.form.ComboBox
     * Allows the user to select which language the file is int
     */
    this.languageCombo = new Ext.form.ComboBox({
      name          : 'language',
      mode          : 'local',
      editable      : false,
      forceSelection: true,
      triggerAction : 'all',
      displayField  : 'name',
      valueField    : 'id',
      value         : 'JavaScript',
      
      store: new Ext.data.JsonStore({
        fields : ['name', 'id'],
        data   : [
          {
            name : 'JavaScript',
            id   : 'js'
          },
          {
            name : 'HTML',
            id   : 'html'
          },
          {
            name : 'CSS',
            id   : 'css'
          }
        ]
      })
    });
    
    return new Ext.Toolbar({
      items: [
        this.lineNumber,
        ' ',
        this.columnNumber,
        '-',
        this.languageCombo
      ]
    });
  }
});

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
    
    el.on('DOMMouseScroll', function(e) {
      this.fireEvent('wheelscroll', e.getWheelDelta());
    }, this);
    
    this.addEvents(
      /**
       * @event wheelscroll
       * Fired when the user wishes to scroll up or down using the mouse wheel
       * @param {Number} amount The amount the user wants to scroll (negative amounts mean scroll down)
       */
      'wheelscroll'
    );
    
    this.on('wheelscroll', function(amount) {
      var delta = this.firstLineNumber - Math.round(amount * 3);
      this.scrollTo(delta);
    }, this);
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
        rawLines    = instance.getLines(this.firstLineNumber, this.getVisibleLineCount()),
        
        lineCount   = rawLines.length,
        lines       = [],
        gutterWidth = 15 + lineCount.toString().length * 10;
    
    //set gutter width based on the number of lines in the Document
    this.setGutterWidth(gutterWidth, false);
    
    for (var i=0; i < rawLines.length; i++) {
      lines.push({
        number: this.firstLineNumber + i,
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
    this.addSelection(selection, false);
    
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
    
    var numLines = this.getVisibleLineCount();
    
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
      
      var start       = selection.get('start'),
          end         = selection.get('end'),
          startLine   = start.line,
          endLine     = end.line,
          currentLine = start.line;
      
      //move the cursor to the end of the gutter
      c.translate(this.getLineStartX(), (startLine - this.firstLineNumber - 1) * this.lineHeight);
      
      if (currentLine == endLine) {
        //draw a single selected line
        var selWidth = Math.round(this.getColumnWidth() * (end.column - start.column));
        
        c.translate(
          (start.column - 1) * this.getColumnWidth(),
          this.lineHeight
        );

        c.fillRect(0, 0, selWidth, this.lineHeight);
        
      } else {
        //draw multiple selected lines
        while (currentLine <= endLine) {
          var line   = this.instance.getLine(currentLine),
              startX = 0;
              
          //move down 1 line
          c.translate(0, this.lineHeight);
        
          switch (currentLine) {
            case startLine: //fill from the start to the end of the line
              var selWidth = Math.round(this.getColumnWidth() * (this.getColumnCount() - start.column + 1)),
                  startX   = (start.column - 1) * this.getColumnWidth();
            
              break;
            case endLine: //fill in from the line start to the selection end point
              var desiredWidth  = Math.round(this.getColumnWidth() * end.column),
                  possibleWidth = Math.round(this.getColumnWidth() * this.instance.getLine(currentLine).length),
                  selWidth      = Math.min(desiredWidth, possibleWidth);
                              
              break;
            default: //fill in the whole line
              var selWidth = this.getColumnWidth() * this.getColumnCount();
          }
          
          c.save();
          c.fillRect(startX, 0, selWidth, this.lineHeight);
          c.restore();
          
          currentLine += 1;
        }        
      }
      
      c.restore();
    }, this);
  },
  
  /**
   * Returns the number of columns currently avaialable on the canvas
   * @return {Number} The number of available columns
   */
  getColumnCount: function() {
    var width = this.el.getWidth() - this.getLineStartX();
    
    return Math.floor(width / this.getColumnWidth());
  },
  
  /**
   * Returns the number of lines currently available on the canvas
   * @return {Number} The number of available lines
   */
  getLineCount: function() {
    return Math.floor(this.el.getHeight() / this.lineHeight);
  },
  
  /**
   * Clears the canvas
   */
  clear: function() {
    this.getContext().clearRect(0, 0, this.el.getWidth(), this.el.getHeight());
    // this.el.dom.height = this.el.dom.height;
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
        
        if (this.cursors.length == 1) {
          var cursor = this.cursors[0];
          
          this.scrollIntoView({
            line  : cursor.get('line'),
            column: cursor.get('column')
          });
        }
        
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
          
          var fnName    = String.format("move{0}{1}", modifier, directions[e.getKey()]),
              newCoords = cursor[fnName]();
          
          this.scrollIntoView(newCoords);
        });

        this.fireEvent('cursor-moved', this.cursors[0]);
      } else if (e.isSpecialKey()) {
        console.log('special');
        console.log(e);
        console.log(e.getKey());
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
      text += this.instance.getTextForSelection(selection);
    }, this);
    
    return text;
  },
  
  /**
   * Removes all current selections and adds a new one which encompasses the whole document
   * @return {ExtMate.models.Selection} The new selection instance
   */
  selectAll: function() {
    var lineCount = this.instance.getLineCount(),
        selection = ExtMVC.buildModel("Selection", {
      start: {
        line  : 1,
        column: 1
      },
      end: {
        line  : lineCount,
        column: this.instance.getLine(lineCount).length
      }
    });
    
    this.clearSelections(false);
    this.addSelection(selection);
    
    return selection;
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
  },
  
  /**
   * Returns the number of lines the canvas has room to render based on its current height. 
   * @return {Number} The number of lines (fractional - some functions should Math.ceil it)
   */
  getVisibleLineCount: function() {
    return Math.ceil(this.getEl().dom.height / this.lineHeight);
  },
  
  /**
   * Returns the last visible line number
   * @return {Number} The line number of the last visible line
   */
  getBottomVisibleLineNumber: function() {
    return Math.min(this.instance.getLineCount(), (this.firstLineNumber - 1) + this.getVisibleLineCount());
  },
  
  /**
   * Attempts to scroll the document so that the line number provided is the first one visible
   * @param {Number} lineNumber The line number to attempt to scroll to
   * @param {Boolean} redraw True to redraw (defaults to true)
   * @return {Number} lineNumber The new top line number. This will usually be the line number
   * provided, unless scrolling to the extremes of the document
   */
  scrollTo: function(lineNumber, redraw) {
    var minusLineCount = this.instance.getLineCount() - this.getVisibleLineCount(),
        maxPossible    = Math.max(minusLineCount, 1);
        
    if (lineNumber <= 0) lineNumber = 1;
    
    lineNumber = Math.min(lineNumber, maxPossible);
    
    // console.log('doc:' + this.instance.getLineCount());
    // console.log('minus: ' + minusLineCount);
    // console.log('max possible:' + maxPossible);
    // console.log('scroll to ' + lineNumber);
    this.firstLineNumber = lineNumber;
    if (redraw !== false) this.draw();
  },
  
  /**
   * If the given line/column combo are already in view, this does nothing. Otherwise, attempts to scroll so that
   * the line and column are both in the current canvas viewport
   * @param {Object} coords line and column co-ordinates
   */
  scrollIntoView: function(coords) {
    var aboveTop  = coords.line < this.firstLineNumber,
        belowBot  = coords.line > this.getBottomVisibleLineNumber();
    
    if (aboveTop) {
      this.scrollTo(coords.line);
    } else if (belowBot) {
      this.scrollTo(coords.line - this.getVisibleLineCount());
    }
  }
});

ExtMVC.registerView('documents', 'new', {
  xtype : 'formwindow',
  title : 'New File',
  width : 300,
  height: 110,
  layout: 'fit',
  id    : 'new_file',
  
  closeAction  : 'close',
  defaultButton: 'new-file-input',
  
  buildForm: function() {
    return new Ext.form.FormPanel({
      labelWidth: 80,
      bodyStyle : 'padding: 5px',
      items: [
        {
          fieldLabel: "Filename",
          xtype     : 'textfield',
          name      : 'filename',
          anchor    : "-20",
          id        : "new-file-input"
        }
      ]
    });
  }
});

