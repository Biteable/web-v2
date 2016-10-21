import Ember from 'ember';
import Qs from 'qs';

const { computed } = Ember;

export default Ember.Component.extend({
  tagName: '',

  parsedURL: computed('url', function() {
    const link = document.createElement('a');
    link.href = this.get('url');
    return link;
  }),

  id: computed('parsedURL', function() {
    return this.get('parsedURL.pathname')
               .split('/')
               .reject(part => !part)
               .get('lastObject');
  }),

  blockID: computed.oneWay('query.block'),
  filter: computed.oneWay('query.filter'),

  query: computed('parsedURL', function() {
    return Qs.parse(this.get('parsedURL.search').slice(1));
  })
});
