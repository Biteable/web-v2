/* jshint node: true */
'use strict';

const electron             = require('electron');
const path                 = require('path');
const storage              = require('electron-json-storage');
const app                  = electron.app;
const BrowserWindow        = electron.BrowserWindow;
const dirname              = __dirname || path.resolve(path.dirname());
const emberAppLocation     = `file://${dirname}/dist/index.html`;

let mainWindow = null;

// Uncomment the lines below to enable Electron's crash reporter
// For more information, see http://electron.atom.io/docs/api/crash-reporter/

// electron.crashReporter.start({
//     productName: 'YourName',
//     companyName: 'YourCompany',
//     submitURL: 'https://your-domain.com/url-to-submit',
//     autoSubmit: true
// });

app.on('window-all-closed', function onWindowAllClosed() {
  if (process.platform !== 'darwin') {
      app.quit();
  }
});

app.on('ready', function onReady() {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    titleBarStyle: 'hidden-inset',
   'web-preferences': {
     'web-security': false
   }
  });

  delete mainWindow.module;

  // If you want to open up dev tools programmatically, call
  // mainWindow.openDevTools();

  // By default, we'll open the Ember App by directly going to the
  // file system.
  //
  // Please ensure that you have set the locationType option in the
  // config/environment.js file to 'hash'. For more information,
  // please consult the ember-electron readme.
  mainWindow.loadURL(emberAppLocation);

  // If a loading operation goes wrong, we'll send Electron back to
  // Ember App entry point
  mainWindow.webContents.on('did-fail-load', () => {
    mainWindow.loadURL(emberAppLocation);
  });

  mainWindow.webContents.on('crashed', () => {
    console.log('Your Ember app (or other code) in the main window has crashed.');
    console.log('This is a serious issue that needs to be handled and/or debugged.');
  });

  mainWindow.on('unresponsive', () => {
    console.log('Your Ember app (or other code) has made the window unresponsive.');
  });

  mainWindow.on('responsive', () => {
    console.log('The main window has become responsive again.');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Figure out better way to filter out the urls
  electron.session.defaultSession.webRequest.onHeadersReceived(
    { urls: ['http://localhost:4000/*', 'https://pro.usecanvas.com/*'] }, (details, cb) => {
    if (details.url.includes(`oauth/slack/callback`)) {
      const cookies = details.responseHeaders['set-cookie'][0].split('; ');
      const [, ...rest] = cookies[0].split('=');
      storage.set('csrf', rest.join('='));
    }
    cb({ cancel: false });
  });

  // Handle an unhandled error in the main thread
  //
  // Note that 'uncaughtException' is a crude mechanism for exception handling intended to
  // be used only as a last resort. The event should not be used as an equivalent to
  // "On Error Resume Next". Unhandled exceptions inherently mean that an application is in
  // an undefined state. Attempting to resume application code without properly recovering
  // from the exception can cause additional unforeseen and unpredictable issues.
  //
  // Attempting to resume normally after an uncaught exception can be similar to pulling out
  // of the power cord when upgrading a computer -- nine out of ten times nothing happens -
  // but the 10th time, the system becomes corrupted.
  //
  // The correct use of 'uncaughtException' is to perform synchronous cleanup of allocated
  // resources (e.g. file descriptors, handles, etc) before shutting down the process. It is
  // not safe to resume normal operation after 'uncaughtException'.
  process.on('uncaughtException', (err) => {
    console.log('An exception in the main thread was not handled.');
    console.log('This is a serious issue that needs to be handled and/or debugged.');
    console.log(`Exception: ${err}`);
  });
});
