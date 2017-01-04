import ENV from 'canvas-web/config/environment';
import Ember from 'ember';
import RealtimeCanvas from 'canvas-editor/lib/realtime-canvas';
import ReconnectingWebSocket from 'reconnecting-websocket';
import Raven from 'raven';
import ShareDB from 'sharedb';
import copyText from 'canvas-web/lib/copy-text';

const { computed, guidFor, inject, run } = Ember;
const MAX_RECONNECTS = 10;

export default Ember.Route.extend({
  desktopMenus: inject.service(),
  connected: false,
  flashMessages: Ember.inject.service(),
  segment: inject.service(),

  realtimeURL: computed(function() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = ENV.realtimeHost;
    return `${protocol}//${host}`;
  }),

  beforeModel() {
    const copyURL = this.copyURL.bind(this);

    this.get('desktopMenus').get('editMenu').pushObjects([
      { type: 'separator', boundFrom: guidFor(this) },
      { label: 'Copy Current URL', accelerator: 'CmdOrCtrl+Shift+C',
        boundFrom: guidFor(this), click: copyURL }
    ]);
  },

  copyURL() {
    copyText(this.modelFor('team.canvas').get('webURL'));
  },

  model() {
    return this.modelFor('team.canvas');
  },

  afterModel(canvas) {
    return this.shareDBConnect(this.modelFor('team'), canvas);
  },

  createSocket() {
    return new ReconnectingWebSocket(this.get('realtimeURL'), null, {
      debug: ENV.debugWebSockets,
      maxReconnectInterval: 2000,
      maxReconnectAttempts: MAX_RECONNECTS
    });
  },

  shareDBConnect(team, canvas) {
    const socket = this.set('socket', this.createSocket());
    const connection = new ShareDB.Connection(socket);
    const shareDBDoc = connection.get(team.get('id'), canvas.get('id'));

    canvas.set('shareDBDoc', shareDBDoc);
    shareDBDoc.on('warning',
      warning => Raven.captureException(warning, { level: 'warning' }));

    this.startPingInterval();

    return new Ember.RSVP.Promise((resolve, reject) => {
      let reconnects = 0;

      connection.on('connection error', _err => {
        run.join(_ => {
          reconnects += 1;

          if (reconnects >= MAX_RECONNECTS) {
            canvas.set('connected', false);
            connection.close();

            if (this.get('didConnect')) {
              this.get('flashMessages').add({
                destroyOnClick: false,
                emoji: '⚡️',
                message: `We're having a difficult time connecting to our \
                          server. Please check your internet settings and \
                          reload Canvas.`,
                sticky: true,
                type: 'danger'
              });
              throw new Error('Unable to sustain open realtime connection');
            } else {
              reject(new Error('Unable to open realtime connection'));
            }
          }
        });
      });

      shareDBDoc.subscribe(err => {
        if (err) return reject(err);

        canvas.set('blocks', shareDBDoc.data.map(block => {
          return RealtimeCanvas.createBlockFromJSON(block);
        }));

        this.set('didConnect', true);
        canvas.set('connected', true);

        return resolve(canvas);
      });
    });
  },

  deactivate() {
    this.set('connected', false);
    this.get('socket').close();
    const editItems =
      this.get('desktopMenus').get('editMenu')
          .filter(item => item.boundFrom === guidFor(this));
    this.get('desktopMenus.editMenu').removeObjects(editItems);
    clearInterval(this.get('pingInterval'));
  },

  ping() {
    const socket = this.get('socket');
    const ping = JSON.stringify({ ping: true });
    if (socket.readyState === WebSocket.OPEN) socket.send(ping);
  },

  startPingInterval() {
    this.set('pingInterval', setInterval(this.ping.bind(this), 30000));
  },

  actions: {
    createFromTemplate() {
      const canvas = this.get('controller.model');

      return this.get('store').createRecord('canvas', {
        slackChannelIds: canvas.get('slackChannelIds'),
        team: canvas.get('team'),
        template: canvas
      }).save().then(newCanvas => {
        this.get('segment').trackEvent('Instantiated Template',
                                  { source: 'template' });
        this.transitionTo('team.canvas.show', newCanvas);
      });
    },

    /**
     * Called when a user wishes to navigate to a canvas's history view.
     *
     * @method
     */
    navigateHistory() {
      const canvas = this.get('controller.model');

      this.transitionTo(
        'team.canvas.history',
        canvas.get('id'),
        { queryParams: { version: canvas.get('shareDBDoc.version') } });
    },

    updateCanvasChannels(channels) {
      const canvas = this.get('controller.model');
      const ids = channels.mapBy('id');
      canvas.set('slackChannelIds', ids);
      canvas.save();
    }
  }
});
