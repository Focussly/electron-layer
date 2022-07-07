'use strict';

const { ipcRenderer } = require('electron');

const Component = async (name, props, ...args) => {
  this.uuid = '';
  this.component = name || '';
  this.props = props || {};

  try {
    const componentUUID = await ipcRenderer.invoke('renderer-mount-component', this.component, this.props, ...args);
    this.uuid = componentUUID;
  } catch (error) {
    throw Error(error);
  }

  this.unMount = async () => {
    await ipcRenderer.invoke('renderer-unmount-component', this.uuid);
  }

  return this;
};

module.exports = Component;
