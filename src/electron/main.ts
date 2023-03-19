import * as path from 'path';
import { app, BrowserWindow, Menu, MenuItem } from 'electron';
import i18n from './i18next.config';
import * as menuActionMap from './menu';
import { ipcMain } from 'electron/main';
import { startWebSocketRelay } from './lib/WebSocketRelay';

const isDev = process.env.IS_DEV == "true" ? true : false;

console.log('ELECTRON');
startWebSocketRelay();

function createMenu(): Menu | null {
  if (!isDev) return null;

  const menu = new Menu()
  menu.append(new MenuItem({
    label: i18n.t('Dev'),
    submenu: [
      {
        label: i18n.t('Toggle Developer Tools'),
        accelerator: 'ctrl+shift+i',
        click: menuActionMap['toggleDevTools']
      }, {
        label: i18n.t('Reload'),
        accelerator: 'f5',
        click: menuActionMap['reloadWebContent']
      },
      {
        label: i18n.t('Exit'),
        accelerator: 'esc',
        click: menuActionMap['closeApp']
      },
    ]
  }));

  return menu;
}

function createWindow() {

  // Create the browser window.
  const width = 900;
  const height = 700;
  const mainWindow = new BrowserWindow({
    width: isDev ? width + 400 : 0,
    height: height,
    minWidth: width,
    minHeight: height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  // win.loadFile("index.html");
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../src/index.html')}`
  );

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.whenReady().then(async () => {

  const mainWindow = createWindow();

  

  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.send('set-language', i18n.language);
  });

  app.on('activate', function () {
    //WARN: Might be sketchy with loading of settings and stuff?
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
});


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

//TODO: combine all settings into one object that can be saved in one go
ipcMain.handle('change-language', (_e, language: string) => {
  i18n.changeLanguage(language);
});

i18n.on('languageChanged', () => {
  const menu = createMenu();
  Menu.setApplicationMenu(menu);
})

ipcMain.handle('soft-reload', () => {
  BrowserWindow.getAllWindows().forEach(window => window.close());
  createWindow();
})

