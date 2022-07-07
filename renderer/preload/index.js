'use strict';

const { contextBridge } = require('electron');
const ipc = require('./ipc');
const component = require('./component');

/**
 * Documentation:
 * https://www.electronjs.org/fr/docs/latest/api/ipc-main
 * https://www.electronjs.org/fr/docs/latest/api/ipc-renderer
 */
contextBridge.exposeInMainWorld('process', {
  communication: ipc,
  component: component,
});
