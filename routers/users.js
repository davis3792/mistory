module.exports = function(context) {

  var users = context.controllers.users;
  var app   = context.app;

  app.post(  '/api/v1/users',     users.create);
  app.get(   '/api/v1/users/:id', users.findById);
  app.put(   '/api/v1/users/:id', users.update);
  app.delete('/api/v1/users/:id', users.delete);
	/*
  app.get('/api/v1/shows/:id/:season', shows.findByIdSeason);
  app.get('/api/v1/shows/:id/:season/:episode', shows.findByIdSeasonEpisode);
	*/

  return this;

};
