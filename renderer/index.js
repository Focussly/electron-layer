'use strict';

const { BrowserWindow, ipcMain } = require('electron');
const ComponentCore = require('./component');
const { getCamelCaseToDashCase } = require('../helpers/text');

class RendererCore extends ComponentCore {
  app = null;
  window = null;
  windowConfig = {
    width: 800,
    height: 600,
    x: 0,
    y: 0,
    show: true,
    fullscreen: false,
    backgroundColor: '#FFFFFF',
    webPreferences: {
      webSecurity: true,
      nodeIntegration: false,
    },
  };
  windowLoadFile = '';
  windowLoadURL = '';
  windowEvents = [];

  constructor(app) {
    super();

    if (!app) {
      return this;
    }

    this.app = app;
  }

  mount() {
    super.mount();

    if (!this.windowLoadFile && !this.windowLoadURL) {
      return this;
    }

    this.window = new BrowserWindow(this.windowConfig);

    if (this.windowLoadFile) {
      this.window.loadFile(this.windowLoadFile);
    } else if (this.windowLoadURL) {
      this.window.loadURL(this.windowLoadURL);
    }

    this.mountWindowEvents();

    this.mountComponent = this.mountComponent.bind(this);
    this.unMountComponent = this.unMountComponent.bind(this);
    ipcMain.handle('renderer-mount-component', this.mountComponent);
    ipcMain.handle('renderer-unmount-component', this.unMountComponent);

    return this;
  }

  mountWindowEvents() {
    if (!this.windowEvents.length) {
      const methods = Object.getOwnPropertyNames(this.__proto__).filter(methodName => methodName.includes('onWindow') || methodName.includes('onceWindow'));

      methods.forEach(methodName => {
        const methodEventName = methodName.replace('onWindow', '').replace('onceWindow', '');
        this.windowEvents.push({
          name: getCamelCaseToDashCase(methodEventName),
          method: this[methodName].bind(this),
          isMounted: false,
          isOnce: methodName.includes('onceWindow'),
        });
      });
    }

    this.windowEvents.forEach(event => {
      if (event.isMounted) {
        return;
      }

      if (event.isOnce) {
        this.window.once(event.name, event.method);
      } else {
        this.window.on(event.name, event.method);
      }

      event.isMounted = true;
    });
  }

  unMountWindowEvents() {
    this.windowEvents.forEach(event => {
      if (!event.isMounted) {
        return;
      }

      this.window.off(event.name, event.method);

      event.isMounted = false;
    });
  }

  mountComponent(event, name, props, ...args) {
    if (!this.components[name]) {
      throw Error('Unable to find the Component');
    }

    const component = new this.components[name](props, ...args);
    component.mount();

    this.children.push(component);

    return component.uuid;
  }

  unMountComponent(event, uuid) {
    this.children = this.children.filter((component) => {
      if (component.uuid !== uuid) {
        return true;
      }
      component.unMount();
      return false;
    });

    return true;
  }
}

module.exports = RendererCore
