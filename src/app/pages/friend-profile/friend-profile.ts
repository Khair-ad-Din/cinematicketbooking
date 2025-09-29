import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProfileService } from '../../services/user-profile.service';
import { FriendsService } from '../../services/friends.service';
import { UserProfile } from '../../interfaces/social';

@Component({
  selector: 'app-friend-profile',
  imports: [CommonModule],
  templateUrl: './friend-profile.html',
  styleUrl: './friend-profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FriendProfile {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userProfileService = inject(UserProfileService);
  private friendsService = inject(FriendsService);

  friendId = signal<string>('');
  friendProfile = signal<UserProfile | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Computed friendship status
  friendshipStatus = computed(() => {
    const id = this.friendId();
    if (!id) return 'none';
    return this.friendsService.getFriendshipStatus(id);
  });

  constructor() {
    // Get friend ID from route parameter
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.friendId.set(id);
        this.loadFriendProfile(id);
      }
    });
  }

  private loadFriendProfile(friendId: string) {
    this.isLoading.set(true);
    this.error.set(null);

    // Use the UserProfileService to fetch friend profile (includes proper auth)
    this.userProfileService.getUserProfile(friendId).subscribe({
      next: (profile) => {
        if (profile) {
          this.friendProfile.set(profile);
        } else {
          this.error.set('Failed to load friend profile');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading friend profile:', error);
        this.error.set('Failed to load friend profile');
        this.isLoading.set(false);
      }
    });
  }

  viewSharedMovies() {
    const friendId = this.friendId();
    if (friendId) {
      this.router.navigate(['/shared-movies', friendId]);
    }
  }

  goBack() {
    this.router.navigate(['/friends']);
  }

  removeFriend() {
    const friendId = this.friendId();
    if (friendId) {
      this.friendsService.removeFriend(friendId).subscribe(() => {
        this.router.navigate(['/friends']);
      });
    }
  }

  sendFriendRequest() {
    const friendId = this.friendId();
    if (friendId) {
      this.friendsService.sendFriendRequest(friendId);
    }
  }
}
