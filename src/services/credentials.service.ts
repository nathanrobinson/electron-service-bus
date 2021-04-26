import { DefaultAzureCredential, TokenCredential } from '@azure/identity';

export class CredentialsService {
  constructor() { }

  private _credentials: TokenCredential | undefined;

  getCredentials(): TokenCredential {
    if (!this._credentials) {
      this._credentials = new DefaultAzureCredential();
    }
    return this._credentials;
  }
}
