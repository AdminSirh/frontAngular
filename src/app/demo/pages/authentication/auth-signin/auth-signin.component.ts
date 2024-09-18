import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router'; // Importa RouterModule
import { LoginService } from '../../../../../services/login.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-auth-signin',
  standalone: true,
  imports: [FormsModule, HttpClientModule, RouterModule, ToastModule],
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss']
})
export default class AuthSigninComponent implements OnInit {
  // Datos del formulario de inicio de sesión
  loginData = {
    username: '',
    password: ''
  };

  constructor(
    private loginService: LoginService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    // Verifica si el parámetro "sessionExpired" está presente
    this.route.queryParams.subscribe((params) => {
      if (params['sessionExpired'] === 'true') {
        setTimeout(() => {
          this.messageService.add({
            severity: 'warn',
            summary: 'Sesión Expirada',
            detail: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
            sticky: true
          });
        }, 100);
      }
    });
  }

  // Método para manejar el inicio de sesión
  login() {
    if (this.loginData.username.trim() === '' || this.loginData.password.trim() === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El nombre de usuario y la contraseña son obligatorios'
      });
      return;
    }

    // Llamada al servicio para generar el token
    this.loginService.generateToken(this.loginData).subscribe(
      (response: any) => {
        // Guardamos el token en el localStorage
        this.loginService.loginUser(response.token);

        // Obtenemos el usuario actual
        this.loginService.getCurrentUser().subscribe((user) => {
          // Guardamos la información del usuario
          this.loginService.setUser(user);
          this.router.navigate(['/home']); // Redirige al home de la aplicación
        });
      },
      (error) => {
        console.error('Error during login', error);

        if (error.status === 0) {
          // Error de conexión o servidor no disponible
          this.messageService.add({
            severity: 'error',
            summary: 'Error de conexión',
            detail: 'El servidor no está disponible. Intente nuevamente más tarde.'
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al iniciar sesión: ' + (error.error || 'Error desconocido')
          });
        }
      }
    );
  }
}
