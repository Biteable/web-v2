import Ember from 'ember';
import preload from 'canvas-web/lib/preload';

export default Ember.Route.extend({
  currentAccount: Ember.inject.service(),
  teamQuery: Ember.inject.service(),

  model({ domain }) {
    return this.get('teamQuery').findByDomain(domain);
  },

  afterModel(model) {
    this.set('currentAccount.currentUser', model.get('user'));
    return preload(model, 'canvases');
  },

  actions: {
    didCreateCanvas(canvas) {
      this.transitionTo('team.canvases.show',
        canvas.get('team.domain'), canvas.get('id'));
    }
  }
});
