const { app, BrowserWindow, shell, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;

// Configure updater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 800,
    minHeight: 600,
    title: 'BatchTrack — Om International',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png'),
  });

  mainWindow.loadFile('index.html');

  // Allow window.open for print windows
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('data:')) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 900,
          height: 700,
          autoHideMenuBar: true,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
          }
        }
      };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Check for updates 5 seconds after launch
  mainWindow.webContents.once('did-finish-load', () => {
    setTimeout(() => {
      autoUpdater.checkForUpdates();
    }, 5000);
  });
}

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info.version);
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Available',
    message: `BatchTrack v${info.version} is available and will download in the background.`,
    buttons: ['OK'],
  });
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Already on latest version:', info.version);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info.version);
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Ready',
    message: `BatchTrack v${info.version} is ready. Restart now to apply the update.`,
    buttons: ['Restart Now', 'Later'],
  }).then(result => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on('error', (err) => {
  console.error('Auto-updater error:', err.message);
  dialog.showMessageBox(mainWindow, {
    type: 'error',
    title: 'Update Error',
    message: 'Could not check for updates: ' + err.message,
    buttons: ['OK'],
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
