'use strict';

const path = require('path');
const { app } = require('../deps/electron');
const isElectronDev = require('../deps/electron-is-dev');

const appPath = isElectronDev ? path.resolve(app.getAppPath(), 'src') : app.getAppPath();
const preloadPath = isElectronDev ? path.resolve(__dirname, '../renderer/preload/index.js') : path.resolve(appPath, 'node_modules/@focussly/electron-layer/renderer/preload/index.js');

module.exports = {
  appPath,
  preloadPath,
};
