const { contextBridge, ipcRenderer, webFrame } = require('electron');
contextBridge.exposeInMainWorld('ia', p => ipcRenderer.invoke('ia', p));
contextBridge.exposeInMainWorld('sair', () => ipcRenderer.send('sair'));
contextBridge.exposeInMainWorld('app', {
  esconder: () => ipcRenderer.send('win:esconder'),
  tamanho: f => ipcRenderer.invoke('win:tamanho', f),
  zoomUI: f => webFrame.setZoomFactor(f),
  arrasta: inicio => ipcRenderer.send('win:arrasta', !!inicio),
  estado: () => ipcRenderer.invoke('win:estado'),
  topo: v => ipcRenderer.send('win:topo', v),
  barra: v => ipcRenderer.send('win:barra', v),
  iaInfo: () => ipcRenderer.invoke('ia:info'),
  iaBaixar: id => ipcRenderer.invoke('ia:baixar', id),
  chat: p => ipcRenderer.invoke('ia:chat', p),
  aoChunk: f => ipcRenderer.on('ia:chunk', (_e, d) => f(d)),
  iaCancelar: () => ipcRenderer.send('ia:cancelar'),
  iaUsar: id => ipcRenderer.invoke('ia:usar', id),
  iaRemover: id => ipcRenderer.invoke('ia:remover', id),
  aoProgresso: f => ipcRenderer.on('ia:prog', (_e, d) => f(d)),
});
