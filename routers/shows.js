module.exports = function(app) {

  var shows = app.controllers.shows;

  app.get('/api/v1/shows', shows.search);
  app.get('/api/v1/shows/:id', shows.findById);
  app.get('/api/v1/shows/:id/:season', shows.findByIdSeason);
  app.get('/api/v1/shows/:id/:season/:episode', shows.findByIdSeasonEpisode);

  return this;

};
