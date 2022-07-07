'use strict';

const { ipcRenderer } = require('electron');

const ipc = {
  ...ipcRenderer,

  /**
   * On events
   *
   * @param {String} channel The ipcMain channel name
   * @param {Function} listener The event function
   */
  on: (channel, listener) => {
    return ipcRenderer.on(channel, listener);
  },

  /**
   * Once events
   *
   * @param {String} channel The ipcMain channel name
   * @param {Function} listener The event function
   */
  once: (channel, listener) => {
    return ipcRenderer.once(channel, listener);
  },

  /**
   * Off events
   *
   * @param {String} channel The ipcMain channel name
   * @param {Function} listener The event function
   */
  off: (channel, listener) => {
    if (listener) {
      return ipcRenderer.removeListener(channel, listener);
    } else if (channel) {
      return ipcRenderer.removeAllListeners(channel);
    }
  },
}

module.exports = ipc;
