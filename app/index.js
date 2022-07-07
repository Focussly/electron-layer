'use strict';

const { app } = require('../deps/electron');
const { getCamelCaseToDashCase } = require('../helpers/text');

class AppCore {
  appEvents = [];
  renderers = {};

  constructor() {
    this.mountAppEvents();
  }

  mountAppEvents() {
    if (!this.appEvents.length) {
      const methods = Object.getOwnPropertyNames(this.__proto__).filter(methodName => methodName.includes('onApp') || methodName.includes('onceApp'));

      methods.forEach(methodName => {
        const methodEventName = methodName.replace('onApp', '').replace('onceApp', '');
        this.appEvents.push({
          name: getCamelCaseToDashCase(methodEventName),
          method: this[methodName].bind(this),
          isMounted: false,
          isOnce: methodName.includes('onceApp'),
        });
      });
    }

    this.appEvents.forEach(event => {
      if (event.isMounted) {
        return;
      }

      if (event.isOnce) {
        app.once(event.name, event.method);
      } else {
        app.on(event.name, event.method);
      }

      event.isMounted = true;
    });
  }

  unMountAppEvents() {
    this.appEvents.forEach(event => {
      if (!event.isMounted) {
        return;
      }

      app.off(event.name, event.method);

      event.isMounted = false;
    });
  }
}

module.exports = AppCore;
