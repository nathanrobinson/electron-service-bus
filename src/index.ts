import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { CredentialsService } from './services/credentials.service';
import { AccountRequestHandlerService } from './services/account-request-handler.service';

app.on('ready', () => {
  const credentials = new CredentialsService();
  var accountRequestHandler = new AccountRequestHandlerService(credentials);

  ipcMain.on('get-user', accountRequestHandler.getUserRequestHandler());
  ipcMain.on('get-token', accountRequestHandler.getTokenRequestHandler());

  const win = new BrowserWindow({
    width: 1600,
    height: 1200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const indexHTML = path.join(__dirname, 'index.html');
  win.loadFile(indexHTML).then(() => {
    console.log('App is ready');
  });
});