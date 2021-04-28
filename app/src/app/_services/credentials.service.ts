import { Injectable } from "@angular/core";
import { AccessToken } from "@azure/identity";
import { BehaviorSubject, Observable } from "rxjs";
import { ElectronService } from "./electron.service";

@Injectable({
    providedIn: 'root'
})
export class CredentialsService {
    constructor(private _electronService: ElectronService){}

    private _authToken: {[key: string]: Promise<AccessToken|undefined> | undefined} = {};

    async getToken(scopes: string | string[]) {
        let key = '';
        if (typeof(scopes) === 'string') {
            key = scopes;
        } else {
            for (const scope of scopes) {
                key += scope;
            }
        }
        if (!this._authToken[key]) {
          this._authToken[key] = this.getTokenRequest(scopes);
        }
        const token = await this._authToken[key];
        if ((token?.expiresOnTimestamp || 0) <= Date.now()) {
            this._authToken[key] = this.getTokenRequest(scopes);
        }
        return await this._authToken[key];
    }

    private async getTokenRequest(scopes: string | string[]): Promise<AccessToken | undefined> {
        try {
            const ipc = this._electronService.ipcRenderer;
            const token = await new Promise<AccessToken>((resolve, reject) => {
              ipc?.once('get-token-reply', (_: any, args: AccessToken | {error:any}) => {
                if (this.isError(args)) {
                  reject(args.error);
                } else {
                  resolve(args);
                }
              });
              ipc?.send('get-token', scopes);
            });
            return token;
          } catch (error) {
            return undefined;
          }
    }

    private isError(obj: any|{error:any}): obj is {error:any} {
      return !!obj?.error;
    }
}