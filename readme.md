# Electron Layer

A Javascript overlay for clearer `process` management of the `electron` package.

## Example

```js
// src/app.js
const { app } = require('electron');
const AppCore = require('@@focussly/electron-layer/app');
const MainRenderer = require('./main-renderer.js');

// App class
class App extends AppCore {
  renderers = {
    main: new MainRenderer,
  }

  onAppReady() {
    this.renderers.main.mount();
  }

  onAppWindowAllClosed() {
    app.quit();
  }
}

new App();
```

```js
// src/main-renderer.js
const path = require('path');
const url = require('url');
const RendererCore = require('@@focussly/electron-layer/renderer');
const { appPath, preloadPath } = require('@@focussly/electron-layer/helpers/path');

/**
 * MainRenderer
 */
class MainRenderer extends RendererCore {
  windowConfig = {
    width: 1440,
    height: 1024,
    x: 0,
    y: 0,
    show: true,
    backgroundColor: '#FFFFFF',
    webPreferences: {
      webSecurity: true,
      nodeIntegration: true,
      contextIsolation: true,
      preload: preloadPath,
    },
  };

  /**
   * Constructor
   *
   * @param {AppCore} appCore
   */
  constructor(appCore) {
    super(appCore);

    this.windowLoadFile = url.pathToFileURL(path.resolve(appPath, '/index.html')).pathname;
  }

  onWindowReadyToShow() {
    this.window.toggleDevTools();
  }

  onWindowClose() {
    this.unMountWindowEvents();
    this.unMountIPCEvents();
  }

  /**
   * IPC Events from this renderer
   */
  handleIPCSendMessage(event, arg) {
    console.log(arg) // echo "ping"
    return 'pong';
  }

  onIPCSendSyncMessage(event, arg) {
    console.log(arg) // echo "sync ping"
    event.returnValue = 'sync pong';
  }
}

module.exports = MainRenderer;
```

```html
<!-- src/index.html -->
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Electron Atom</title>
    <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0">
  </head>
  <body>
    <div>
      Hello world!
    </div>
    <script>
        /**
         * IPC Events
         *
         * Documentation:
         * https://www.electronjs.org/fr/docs/latest/api/ipc-main
         * https://www.electronjs.org/fr/docs/latest/api/ipc-renderer
         */
        process.communication.invoke('send-message', 'ping').then(response => {
            console.log(response); // echo "pong"
        }).catch(error => {
            console.error(error);
        });

        try {
            const syncResponse = process.communication.sendSync('send-sync-message', 'sync ping');
            console.log(syncResponse); // echo "sync pong"
        } catch (error) {
            console.error(error);
        }
    </script>
  </body>
</html>
```
