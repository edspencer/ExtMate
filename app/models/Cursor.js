ExtMVC.registerModel("Cursor", {
  fields: [
    {name: 'id',     type: 'int'},
    {name: 'line',   type: 'int'},
    {name: 'column', type: 'int'}
  ],
  
  moveLeft: function() {
    this.move('column', -1);
  },
  
  moveRight: function() {
    this.move('column', 1);
  },
  
  moveUp: function() {
    this.move('line', -1);
  },
  
  moveDown: function() {
    this.move('line', 1);
  },
  
  /**
   * @private
   * Moves the cursor along one of the axes
   * @param {String} axis 'line' or 'column'
   * @param {Number} delta amount to move by
   */
  move: function(axis, delta) {
    this.set(axis, this.get(axis) + delta);
  }
});