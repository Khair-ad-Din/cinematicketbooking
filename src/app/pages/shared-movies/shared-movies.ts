import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProfileService } from '../../services/user-profile.service';
import { UserProfile } from '../../interfaces/social';

@Component({
  selector: 'app-shared-movies',
  imports: [CommonModule],
  templateUrl: './shared-movies.html',
  styleUrl: './shared-movies.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedMovies {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userProfileService = inject(UserProfileService);

  friendId = signal<string>('');
  friendProfile = signal<UserProfile | null>(null);
  isLoading = signal<boolean>(true);

  constructor() {
    // Get friend ID from route parameter
    effect(() => {
      const id = this.route.snapshot.paramMap.get('friendId');
      if (id) {
        this.friendId.set(id);
        this.loadFriendProfile(id);
      }
    });
  }

  private loadFriendProfile(friendId: string) {
    this.isLoading.set(true);

    // Use the UserProfileService to fetch friend profile (includes proper auth)
    this.userProfileService.getUserProfile(friendId).subscribe({
      next: (profile) => {
        if (profile) {
          this.friendProfile.set(profile);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading friend profile:', error);
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    const friendId = this.friendId();
    this.router.navigate(['/friend-profile', friendId]);
  }
}
