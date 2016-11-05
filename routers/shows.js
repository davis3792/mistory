module.exports = function(context) {

  var shows = context.controllers.shows;
  var app   = context.app;

  app.get('/api/v1/shows', shows.search);
  app.get('/api/v1/shows/:id', shows.findById);
  app.get('/api/v1/shows/:id/:season', shows.findByIdSeason);
  app.get('/api/v1/shows/:id/:season/:episode', shows.findByIdSeasonEpisode);

  return this;

};
