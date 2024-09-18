import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class UserActivityService {
  /*Tiempo límite de inactividad, se resetea cada que el usuario mueve el mouse, hace click
  o teclea sobre la página */
  private readonly INACTIVITY_LIMIT = 40 * 60 * 1000; // 40 minutos
  /*Tiempo de intervalo de refresco del token, cada 55 minutos se hace una petición
  al backend para renovar el token, este tiempo debe ser menor al tiempo establecido 
  en la clase (JwtUtils) del backend en el métido (createToken()), actualmente está
  establecido para vencer cada hora, por lo que la petición de refresco se realiza 5 min
  antes de vencer el token siempre y cuando el usuario se encuentre activo en la página,
  si no será redirigido a signin y deberá ingresar sus credenciales */
  private readonly TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000; // 55 minutos

  private activityTimeout: any;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.setupInactivityDetection();
    this.setupTokenRefresh();
  }

  private setupInactivityDetection() {
    this.resetInactivityTimer();
    window.addEventListener('mousemove', () => this.resetInactivityTimer()); //Movimiento de mouse
    window.addEventListener('keypress', () => this.resetInactivityTimer()); //Presión de tecla
    window.addEventListener('click', () => this.resetInactivityTimer()); //Click del mouse }
  }

  private resetInactivityTimer() {
    clearTimeout(this.activityTimeout);
    //console.log('User activity detected, resetting inactivity timer.');
    this.activityTimeout = setTimeout(() => this.handleInactivity(), this.INACTIVITY_LIMIT);
  }

  private handleInactivity() {
    //console.log('User inactive, logging out.');
    this.loginService.logout();
    this.router.navigate(['/auth/signin'], { queryParams: { sessionExpired: true } });
  }

  private setupTokenRefresh() {
    interval(this.TOKEN_REFRESH_INTERVAL)
      .pipe(switchMap(() => this.loginService.refreshToken()))
      .subscribe({
        error: (err) => {
          console.error('Error during token refresh:', err);
          this.loginService.logout();
          this.router.navigate(['/auth/signin'], { queryParams: { sessionExpired: true } });
        }
      });
  }
}
