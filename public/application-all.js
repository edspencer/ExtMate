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
  
  initializeKeyMap: function(panel) {
    /**
     * @property keymap
     * @type Ext.KeyMap
     * The global KeyMap object
     */
    this.keymap = new Ext.KeyMap(document, [
      {
        key : 'n',
        ctrl: true,
        fn  : ExtMVC.dispatch.createDelegate(ExtMVC, ['documents', 'build']),
        stopEvent: true
      }
    ]);
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
  ]
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
    Ext.each(['IndexController.js', 'ExtMate.css'], function(file) {
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
  
  edit: function(id) {
    var splits = id.split("-");
    
    this.render("edit", {
      title: splits[splits.length - 1]
    });
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
  
  constructor: function(config) {
    config = config || {};
          
    Ext.applyIf(config, {
      bbar: this.buildBottomToolbar()
    });
    
    Ext.Panel.prototype.constructor.call(this, config);
  },
  
  buildBottomToolbar: function() {
    /**
     * @property lineNumber
     * @type Ext.Toolbar.TextItem
     * Displays the current line number
     */
    this.lineNumber = new Ext.Toolbar.TextItem({
      text: "Line: 24"
    });
    
    /**
     * @property columnNumber
     * @type Ext.Toolbar.TextItem
     * Displays the current column number
     */
    this.columnNumber = new Ext.Toolbar.TextItem({
      text: "Column 18"
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

