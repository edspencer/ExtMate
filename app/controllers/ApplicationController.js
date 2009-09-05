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
