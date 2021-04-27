import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { AuthServiceService } from './_services/auth-service.service';

@Component({
  selector: 'esb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Service Bus Manager';
  username$ = this._authService.authenticated;
  loggedIn$ = this._authService.authenticated.pipe(map(u => !!u));
  darkMode: boolean = true;

  constructor(private _authService: AuthServiceService) { }

  ngOnInit(): void {
    this._authService.login();
  }

  login(event: any) {
    return this._authService.login();
  }
}
