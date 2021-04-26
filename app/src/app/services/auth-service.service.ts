import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, ReplaySubject } from 'rxjs';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  private _authenticated = new ReplaySubject<string>(1);
  authenticated: Observable<string> = this._authenticated.asObservable();

  constructor(private _electronService: ElectronService, private _snackBar: MatSnackBar) { }

  async login() {
    try {
      const ipc = this._electronService.ipcRenderer;
      const user = await new Promise<string>((resolve, reject) => {
        ipc?.once('get-user-reply', (_: any, args: string | {error:any}) => {
          if (typeof(args) === 'string') {
            resolve(args);
          } else {
            reject(args.error);
          }
        });
        ipc?.send('get-user');
      });
      this._authenticated.next(user);
    } catch (error) {
      this._snackBar.open(`Error logging in to Azure: ${error}`);
      this._authenticated.next('');
    }
  }
}
