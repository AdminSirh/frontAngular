// angular import
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { LoginService } from 'src/services/login.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-nav-right',
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent implements OnInit {
  //Modales
  @ViewChild('cambiarcontrasenaModal') cambiarcontrasenaModal!: TemplateRef<any>;
  //Variables
  isLoggedIn = false;
  user: any = null;
  private modalRef?: NgbModalRef;

  constructor(
    public login: LoginService,
    public router: Router,
    private modalService: NgbModal
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

  public openPasswordModal(): void {
    this.modalRef = this.modalService.open(this.cambiarcontrasenaModal);
  }

  public closeModal(): void {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }
}
