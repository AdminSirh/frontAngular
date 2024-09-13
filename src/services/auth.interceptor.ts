import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoginService } from './login.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;
    const token = this.loginService.getToken();
    if (token) {
      authReq = authReq.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    /*Si el error es el 401 siginfica que el token del usuario ha expirado, se redirige a login
    El tiempo de expiración es de 30 min, en la clase JwtUtils del backend (crearToken())*/
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token inválido o expirado; cerrar sesión y redirigir al usuario al login
          this.loginService.logout();
          this.router.navigate(['/auth/signin']);
        }
        return throwError(error);
      })
    );
  }
}

export const authInterceptorProviders = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }
];
