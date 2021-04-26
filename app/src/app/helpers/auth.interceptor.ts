import { HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { CredentialsService } from '../services/credentials.service';
import { switchMap } from 'rxjs/operators';

const TOKEN_HEADER_KEY = 'Authorization';
const BEARER_KEY = 'Bearer';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private _credentialsService: CredentialsService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;
    console.log(`AuthInterceptor Checking ${authReq.url}`);
    if (authReq.url.indexOf('https://management.azure.com') == 0) {
        console.log(`AuthInterceptor Intercepting ${authReq.url}`);
        return from(this._credentialsService.getToken('https://management.azure.com'))
            .pipe(switchMap(token => {
                if (token?.token != null) {
                    console.log('AuthInterceptor Adding Auth');
                    return next.handle(req.clone({ headers: req.headers.set(TOKEN_HEADER_KEY, `${BEARER_KEY} ${token.token}`) }));
                }
                console.error('AuthInterceptor Failed to get token');
                return next.handle(req);
            }));
        }
    return next.handle(authReq);
  }
}