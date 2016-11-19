module.exports = function(context) {

  var epilogs = context.controllers.epilogs;
  var app   = context.app;

  app.post(  '/api/v1/epilogs',     epilogs.create);
  app.get(   '/api/v1/epilogs/:id', epilogs.findById);
  app.get(   '/api/v1/epilogs',	    epilogs.find);
  app.delete('/api/v1/epilogs/:id', epilogs.delete);
  app.put(   '/api/v1/epilogs/:id', epilogs.update);

  return this;

};
