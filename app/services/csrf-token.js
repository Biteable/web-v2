import Cookies from 'cookies';
import Ember from 'ember';
import ENV from 'canvas-web/config/environment';

const requireNode = window;
const storage = requireNode('electron-json-storage');
const { computed } = Ember;
let token;
storage.get('csrf', (_, data) => {
  token = data;
});

export default Ember.Service.extend({
  token: computed(function() {
    return ENV.isElectron ? token : Cookies.get('csrf_token');
  }).volatile()
});
