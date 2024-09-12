// angular import
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/services/login.service';

@Component({
  selector: 'app-nav-right',
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent implements OnInit {
  isLoggedIn = false;
  user: any = null;

  constructor(
    public login: LoginService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.updateLoginStatus();
    this.login.loginStatusSubjec.asObservable().subscribe(() => {
      this.updateLoginStatus();
    });
  }

  private updateLoginStatus(): void {
    this.isLoggedIn = this.login.isLoggedIn();
    this.user = this.isLoggedIn ? this.login.getUser() : null;
  }

  public logout(): void {
    this.login.logout();
    this.updateLoginStatus();
    this.router.navigate(['/auth/signin']);
  }
}
