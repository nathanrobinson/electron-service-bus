import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { CredentialsService } from './services/credentials.service';
import { AccountRequestHandlerService } from './services/account-request-handler.service';
import { ServiceBusRequestHandlerService } from './services/service-bus-request-handler.service';
import { ServiceBusClientService } from './services/service-bus-client.service';

app.on('ready', () => {
  const credentials = new CredentialsService();
  var accountRequestHandler = new AccountRequestHandlerService(credentials);
  var serviceBusRequestHandler = new ServiceBusRequestHandlerService(new ServiceBusClientService(credentials));

  ipcMain.on('get-user', accountRequestHandler.getUserRequestHandler());
  ipcMain.on('get-token', accountRequestHandler.getTokenRequestHandler());
  ipcMain.on('peek-queue', serviceBusRequestHandler.peekQueueRequestHandler());
  ipcMain.on('peek-subscription', serviceBusRequestHandler.peekSubscriptionRequestHandler());

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