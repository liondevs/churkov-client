const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.sendSync('app-version'),
  openExternal: (url) => ipcRenderer.send('open-external', url),
});
