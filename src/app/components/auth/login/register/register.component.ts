import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Form Data
  name = signal<string>('');
  email = signal<string>('');
  password = signal<string>('');
  confirmPassword = signal<string>('');

  // UI State
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  onRegister() {
    // Basic Validation
    if (
      !this.name() ||
      !this.email() ||
      !this.password() ||
      !this.confirmPassword()
    ) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService
      .register(this.email(), this.password(), this.name())
      .subscribe({
        next: (response) => {
          this.authService.setAuthData(response);
          this.isLoading.set(false);
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.errorMessage.set('Registration failed. Please try again.');
          this.isLoading.set(false);
        },
      });
  }
}
