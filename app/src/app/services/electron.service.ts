import { Injectable } from '@angular/core';
// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer /*, webFrame*/ } from 'electron';
// import * as childProcess from 'child_process';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer | undefined;
//  webFrame: typeof webFrame | undefined;
//  childProcess: typeof childProcess | undefined;

  get isElectron(): boolean {
    return !!(window && !!(window as any).ipcRenderer);
  }

  constructor() {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = (window as any).ipcRenderer;
      //this.webFrame = window.require('electron').webFrame;
      //this.childProcess = window.require('child_process');
    }
  }
}
