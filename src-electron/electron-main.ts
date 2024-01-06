import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import os from 'os';
import { printOrder, testPrinter } from 'src/utils/printUtilsJS';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

let mainWindow: BrowserWindow | undefined;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1080,
    height: 1920,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  });

  mainWindow.loadURL(process.env.APP_URL);

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow();
  }
});

ipcMain.on('print-order', (event, deviceId, order) => {
  try {
    printOrder(deviceId, order);
  } catch (e) {
    console.error('Print Error:', e);
    // Optionally, send a response back to renderer process
    event.reply('print-order-response', 'failed');
  }
});

ipcMain.on('print-test', (event, deviceId) => {
  try {
    testPrinter(deviceId);
  } catch (e) {
    console.error('Print Test:', e);
    // Optionally, send a response back to renderer process
    event.reply('print-test-response', 'failed');
  }
});
