import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Form Data
  email = signal<string>('');
  password = signal<string>('');

  // UI State
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  onEmailPasswordLogin() {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.email(), this.password()).subscribe({
      next: (response) => {
        this.authService.setAuthData(response);
        this.isLoading.set(false);
        this.router.navigate(['/']); // Redirect to home
      },
      error: (error) => {
        this.errorMessage.set('Invalid email or password');
        this.isLoading.set(false);
      },
    });
  }

  // TODO: OAuth methods (placeholders)
  onGoogleLogin() {
    // TODO: Implement Google OAuth
    console.log('Google login - coming soon');
  }

  onFacebookLogin() {
    // TODO: Implement Facebook OAuth
    console.log('Facebook login - coming soon');
  }

  onTwitterLogin() {
    // TODO: Implement Twitter OAuth
    console.log('Twitter login - coming soon');
  }

  onInstagramLogin() {
    // TODO: Implement Instagram OAuth
    console.log('Instagram login - coming soon');
  }
}
