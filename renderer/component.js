'use strict';

const { ipcMain } = require('electron');
const { randomUUID } = require('crypto');
const { getCamelCaseToDashCase } = require('../helpers/text');

class ComponentCore {
  uuid = '';
  components = {};
  children = [];
  ipcEvents = [];

  constructor() {
    this.uuid = randomUUID();
  }

  mount() {
    this.mountIPCEvents();
    return this;
  }

  unMount() {
    this.unMountIPCEvents();
    return this;
  }

  mountIPCEvents() {
    if (!this.ipcEvents.length) {
      const methods = Object.getOwnPropertyNames(this.__proto__).filter(methodName => methodName.includes('onIPC') || methodName.includes('onceIPC') || methodName.includes('handleIPC') || methodName.includes('handleOnceIPC'));

      methods.forEach(methodName => {
        const methodEventName = methodName.replace('onIPC', '').replace('onceIPC', '').replace('handleIPC', '').replace('handleOnceIPC', '');
        this.ipcEvents.push({
          name: getCamelCaseToDashCase(methodEventName),
          method: this[methodName].bind(this),
          isMounted: false,
          isHandle: methodName.includes('handleIPC') || methodName.includes('handleOnceIPC'),
          isOnce: methodName.includes('onceIPC') || methodName.includes('handleOnceIPC'),
        });
      });
    }

    this.ipcEvents.forEach(event => {
      if (event.isMounted) {
        return;
      }

      if (!event.isOnce && !event.isHandle) {
        ipcMain.on(event.name, event.method);
      } else if (event.isOnce && !event.isHandle) {
        ipcMain.once(event.name, event.method);
      } else if (!event.isOnce && event.isHandle) {
        ipcMain.handle(event.name, event.method);
      } else if (event.isOnce && event.isHandle) {
        ipcMain.handleOnce(event.name, event.method);
      }

      event.isMounted = true;
    });
  }

  unMountIPCEvents() {
    this.ipcEvents.forEach(event => {
      if (!event.isMounted) {
        return;
      }

      if (!event.isHandle) {
        ipcMain.off(event.name, event.method);
      } else if (event.isHandle) {
        ipcMain.removeHandler(event.name);
      }

      event.isMounted = false;
    });
  }
}

module.exports = ComponentCore
