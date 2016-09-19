/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'canvas-web',
    environment: environment,
    rootURL: '/',
    locationType: 'auto',
    apiNamespace: process.env.NODE_ENV === 'production' ? 'api' : '',
    realtimeHost: process.env.REALTIME_HOST,
    slackClientID: process.env.SLACK_CLIENT_ID,
    slackRedirectURI: process.env.NODE_ENV === 'production' ? `${process.env.API_URL}oauth/slack/callback` : 'http://localhost:4000/oauth/slack/callback',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};
