import DS from 'ember-data';
import Ember from 'ember';

const { attr, belongsTo, hasMany } = DS;
const { computed } = Ember;

export default DS.Model.extend({
  domain: attr(),
  name: attr(),
  needsSlackToken: attr(),
  images: attr(),
  isInTeam: attr(),
  slackId: attr(),
  slackScopes: attr(),

  accountUser: belongsTo('user', { async: true }),
  canvases: hasMany('canvas', { async: true }),
  channels: hasMany('slackChannel', { async: true }),

  insertedAt: attr('date'),
  updatedAt: attr('date'),

  hasChannelsRead: hasScope('channels:read'),
  hasChannelsHistory: hasScope('channels:history'),

  image88: computed('images.[]', function() {
    return this.get('images.image_88');
  }),

  isPersonal: computed('slackId', function() {
    return !this.get('slackId');
  }),

  isSlack: computed.not('isPersonal'),

  fetchTemplates() {
    return this.store.adapterFor('team').fetchTemplates(this);
  },

  getDomainError() {
    const errors = this.get('errors').errorsFor('domain');
    if (!errors.length) return null;
    return errors[0].message;
  }
});

function hasScope(scope) {
  return Ember.computed('slackScopes.[]', function() {
    return (this.get('slackScopes') || []).includes(scope);
  }):
}
