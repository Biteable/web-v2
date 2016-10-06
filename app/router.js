import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() { // eslint-disable-line array-callback-return
  this.route('post-auth');
  this.route('login');
  this.route('logout');
  this.route('team', { path: '/:domain' }, function() {
    this.route('slack', { path: '/slack' });
    this.route('canvases.show', { path: '/:id' });
  });


  // For rendering 500 in error handler
  this.route('error');

  // Catch all
  this.route('not-found', { path: '*path' });
});

export default Router;
