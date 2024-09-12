import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login.service';

export const authGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  // Verificar si el usuario está loggeado
  if (loginService.isLoggedIn()) {
    return true; // Permitir el acceso si está autenticado
  }

  // Redirigir al login si no está autenticado
  router.navigate(['/auth/signin'], {
    queryParams: { returnUrl: state.url }, // Guarda la URL que intentaba acceder
  });
  
  return false;
};
