import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserStateService } from '../../services/user-state.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
})
export class NavigationComponent {
  private authService = inject(AuthService);
  private userStateService = inject(UserStateService);
  private router = inject(Router);

  isAuthenticated = computed(() => this.authService.authenticated());

  currentUserName = computed(() => {
    const user = this.authService.user();
    return user?.name;
  });

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
