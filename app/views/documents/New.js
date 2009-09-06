ExtMVC.registerView('documents', 'new', {
  xtype : 'formwindow',
  title : 'New File',
  width : 200,
  height: 120,
  layout: 'fit',
  id    : 'new_file',
  constrain: true,
  
  buildForm: function() {
    return new Ext.form.FormPanel({
      bodyStyle: 'padding: 5px',
      items: [
        {
          fieldLabel: "Filename",
          xtype     : 'textfield',
          name      : 'filename',
          anchor    : "-20"
        }
      ]
    });
  }
});