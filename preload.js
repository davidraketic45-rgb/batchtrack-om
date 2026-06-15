const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronUpdater', {
  onUpdateAvailable: (cb) => ipcRenderer.on('update-available', (_, version) => cb(version)),
  onUpdateDownloaded: (cb) => ipcRenderer.on('update-downloaded', (_, version) => cb(version)),
  onUpdateError: (cb) => ipcRenderer.on('update-error', (_, msg) => cb(msg)),
  installUpdate: () => ipcRenderer.send('install-update'),
});
