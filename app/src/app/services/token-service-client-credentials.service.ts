import { Injectable } from '@angular/core';
import { AccessToken } from '@azure/identity';
import { ServiceClientCredentials, WebResourceLike } from '@azure/ms-rest-js';
import { CredentialsService } from './credentials.service';

@Injectable({
  providedIn: 'root'
})
export class TokenServiceClientCredentialsService implements ServiceClientCredentials {
  private _token: AccessToken | undefined;
  private _scopes = ['https://management.azure.com'];

  constructor(private _credentialsService: CredentialsService) { }

  async signRequest(webResource: WebResourceLike): Promise<WebResourceLike> {
    if (!webResource) {
      return webResource;
    }
    var token = await this.getToken();
    if (!token) {
      return webResource;
    }
    webResource.headers.set('Authorization', `Bearer ${token}`);
    return webResource;
  }

  private async getToken(): Promise<string|undefined> {
    if (!this._token || this._token.expiresOnTimestamp < Date.now()) {
      this._token = await this._credentialsService.getToken(this._scopes);
    }

    return this._token?.token;
  }
}
