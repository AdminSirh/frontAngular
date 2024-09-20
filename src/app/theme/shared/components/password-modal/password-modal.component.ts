import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { CrudService } from 'src/services/crud.service';

@Component({
  selector: 'app-password-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ToastModule, CommonModule], // Agrega CommonModule aquí
  templateUrl: './password-modal.component.html',
  styleUrls: ['./password-modal.component.scss']
})
export class PasswordModalComponent {
  modifyPassword: FormGroup;
  @Output() submitSuccess = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private crudService: CrudService,
    private messageService: MessageService
  ) {
    this.modifyPassword = this.fb.group({
      password_Actual: ['', [Validators.required, Validators.minLength(8)]],
      password_Nuevo: ['', [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}')]],
      password_Confirmar: ['', [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}')]]
    });
  }

  updatePassword(): void {
    if (this.modifyPassword.valid) {
      const { password_Actual, password_Nuevo, ...datos } = this.modifyPassword.value;

      // Verifica la contraseña actual antes de proceder
      this.crudService.verificarPassword(password_Actual).subscribe({
        next: (response) => {
          if (response.data) {
            // Si la contraseña actual es válida, actualiza la contraseña
            this.crudService.cambiarContrasena(password_Nuevo, datos).subscribe({
              next: () => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Contraseña Actualizada',
                  detail: 'La contraseña ha sido actualizada exitosamente.',
                  life: 3000
                });
                //Timeout para el emit del evento 
                setTimeout(() => {
                  this.submitSuccess.emit();
                  this.resetForm();
                }, 1000);
              },
              error: (error) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'No se pudo actualizar la contraseña. Intente de nuevo más tarde.',
                  life: 3000
                });
              }
            });
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La contraseña actual no es correcta.', life: 3000 });
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo verificar la contraseña actual. Intente de nuevo más tarde.',
            life: 3000
          });
        }
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Por favor, corrija los errores en el formulario.'
      });
    }
  }

  private resetForm(): void {
    this.modifyPassword.reset();
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: `${message}: ${error.message || error}`
    });
  }
}
