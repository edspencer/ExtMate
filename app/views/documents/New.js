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