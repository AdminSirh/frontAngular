import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router'; // Importa RouterModule
import { LoginService } from '../../../../../services/login.service';

@Component({
  selector: 'app-auth-signin',
  standalone: true,
  imports: [FormsModule, HttpClientModule, RouterModule], // Añade RouterModule
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss']
})
export default class AuthSigninComponent {
  // Datos del formulario de inicio de sesión
  loginData = {
    username: '',
    password: ''
  };

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  // Método para manejar el inicio de sesión
  login() {
    if (this.loginData.username.trim() === '' || this.loginData.password.trim() === '') {
      alert('Username and password are required'); // Cambia 'Email' a 'Username'
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
          this.router.navigate(['/dashboard']); // Redirige al dashboard
        });
      },
      (error) => {
        console.error('Error during login', error);
        alert('Invalid credentials, please try again');
      }
    );
  }
}
