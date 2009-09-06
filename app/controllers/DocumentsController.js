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