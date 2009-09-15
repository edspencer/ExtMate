/**
 * A panel which exists solely to provide a scroller for the canvas
 */
ExtMVC.registerView('documents', 'scroller', {
  xtype: 'panel',
  width: 16,
  frame: false,
  border: false,
  plain : true,
  autoScroll: true,
  
  html : {
    cls   : 'scroller-proxy',
    style : 'overflow: auto; width: 16px;',
    html  : "<br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />"
  },
  
  /**
   * @property scrollerHeight
   * @type Number
   * The current height of the internal scroller div
   */
  scrollerHeight: 10,
  
  /**
   * Updates the internal scroller element
   * @param {Number} height The new height to set
   */
  setScrollerHeight: function(height) {
    // console.log('setting to ' + height);
    this.getScrollerProxy().setHeight(height);
  },
  
  /**
   * Scrolls the internal scroller proxy to the desired location
   * @param {Number} position The y position to scroll to
   */
  scrollTo: function(position) {
    // console.log('scroll: ' + position);
    // console.log(this.el);
    boo = this.el;
    // this.el.scrollTo('top', position);
    
    // boo.dom.scrollTop = 20;
    
    // console.log(this.getScrollerProxy().getHeight());
    
    // console.log(position);
    this.getScrollerProxy().dom.scrollTop = position;
    // console.log(this.getScrollerProxy().dom.scrollTop);      

  },
  
  getScrollerProxy: function() {
    return this.body.child('div.scroller-proxy');
  }
});