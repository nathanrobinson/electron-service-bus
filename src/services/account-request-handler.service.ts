import { AccessToken } from '@azure/identity';
import { CredentialsService } from "./credentials.service";
import jwt_decode from 'jwt-decode';
import { IpcMainEvent } from "electron/main";

export class AccountRequestHandlerService {
    constructor (private _credentials: CredentialsService) { }

    private _authToken: {[key: string]: AccessToken | null} = {};

    async getToken(scopes: string | string[]) {
        let key = '';
        if (typeof(scopes) === 'string') {
            key = scopes;
        } else {
            for (const scope of scopes) {
                key += scope;
            }
        }
        if ((this._authToken[key]?.expiresOnTimestamp || 0) <= Date.now()) {
            this._authToken[key] = await this._credentials.getCredentials().getToken(scopes);
        }
        return this._authToken[key];
    }

    async getUserInfo() {
        const token = await this.getToken('https://management.azure.com');
        if (!!token?.token) {
            var decoded = jwt_decode(token.token);
            return (<any>decoded)?.unique_name;
        }
        return '';
    }

    getUserRequestHandler() {
        return async (event: IpcMainEvent) => {
            try {
              const userInfo = await this.getUserInfo();
              event.reply('get-user-reply', userInfo);
            } catch (error: any) {
              console.error(error);
              event.reply('get-user-reply', {error});
            }
          };
    }

    getTokenRequestHandler() {
        return async (event: IpcMainEvent, args: string | string[]) => {
            try {
              const token = await this.getToken(args);
              event.reply('get-token-reply', token);
            } catch (error: any) {
              console.error(error);
              event.reply('get-token-reply', {error});
            }
          };
    }
}