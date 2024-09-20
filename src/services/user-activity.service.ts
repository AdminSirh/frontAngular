import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { LoginService } from './login.service';
import { MessageService } from 'primeng/api';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root'
})
export class UserActivityService {
  private readonly INACTIVITY_LIMIT = 40 * 60 * 1000; // Límite de inactividad (40 minutos)
  private readonly TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000; // Intervalo de refresco de token (55 minutos) (Backend clase JwtUtils configurado una hora)
  private readonly COUNTDOWN_START = 30 * 1000; // Duración del conteo regresivo (30 segundos)
  private activityTimeout: any; // Temporizador para la inactividad
  private countdownInterval: any; // Intervalo para el conteo regresivo
  private countdown = 30; // Valor inicial del conteo regresivo

  constructor(
    private loginService: LoginService,
    private router: Router,
    private messageService: MessageService,
    private modalService: NgbModal
  ) {
    this.setupInactivityDetection(); // Configura la detección de inactividad
    this.setupTokenRefresh(); // Configura el refresco del token
  }

  private setupInactivityDetection() {
    this.resetInactivityTimer(); // Reinicia el temporizador de inactividad
    // Añade eventos para detectar actividad del usuario
    window.addEventListener('mousemove', () => this.resetInactivityTimer());
    window.addEventListener('keypress', () => this.resetInactivityTimer());
    window.addEventListener('click', () => this.resetInactivityTimer());
  }

  private resetInactivityTimer() {
    clearTimeout(this.activityTimeout); // Cancela el temporizador anterior
    this.clearToastExpirationTime(); // Limpia el mensaje de expiración
    clearInterval(this.countdownInterval); // Detiene cualquier cuenta regresiva previa
    // console.log('User activity detected, resetting inactivity timer.');

    // Inicia el temporizador para la inactividad
    this.activityTimeout = setTimeout(() => {
      this.startCountdown(); // Llama al inicio del conteo regresivo
    }, this.INACTIVITY_LIMIT - this.COUNTDOWN_START); // Inicia 30 segundos antes del límite
  }

  private startCountdown() {
    this.countdown = 30; // Reinicia el conteo regresivo
    // console.log('Starting countdown to session expiration.');

    // Muestra el primer mensaje de advertencia sobre la expiración de sesión
    this.messageService.add({
      key: 'sessionExpiration',
      severity: 'warn',
      summary: 'Expiración de sesión',
      detail: `Tu sesión expirará en ${this.countdown} segundos.`,
      sticky: true // Mantiene el mensaje visible
    });

    // Inicia el intervalo para actualizar el mensaje cada segundo
    this.countdownInterval = setInterval(() => {
      this.countdown--; // Decrementa el contador

      // Actualiza el mensaje de expiración de sesión
      this.clearToastExpirationTime(); // Limpia el mensaje anterior
      this.messageService.add({
        key: 'sessionExpiration',
        severity: 'warn',
        summary: 'Expiración de sesión',
        detail: `Tu sesión expirará en ${this.countdown} segundos.`,
        sticky: true
      });

      if (this.countdown < 0) {
        clearInterval(this.countdownInterval); // Detiene el conteo al llegar a 0
        this.handleInactivity(); // Maneja la inactividad
      }
    }, 1000); // Actualiza cada segundo
  }

  private handleInactivity() {
    // console.log('User inactive, logging out.');
    // Cierra todos los modales abiertos
    this.modalService.dismissAll();
    // Limpia el mensaje de expiración de sesión
    this.clearToastExpirationTime();
    // Cierra sesión y redirige a la página de inicio de sesión
    this.loginService.logout();
    this.router.navigate(['/auth/signin'], { queryParams: { sessionExpired: true } });
  }

  private setupTokenRefresh() {
    // Inicia un intervalo para refrescar el token
    interval(this.TOKEN_REFRESH_INTERVAL)
      .pipe(switchMap(() => this.loginService.refreshToken())) // Llama al servicio de refresco
      .subscribe({
        error: (err) => {
          console.error('Error during token refresh:', err); // Maneja errores en el refresco
          this.loginService.logout(); // Cierra sesión en caso de error
          this.router.navigate(['/auth/signin'], { queryParams: { sessionExpired: true } });
        }
      });
  }

  private clearToastExpirationTime() {
    this.messageService.clear('sessionExpiration');
  }
}
