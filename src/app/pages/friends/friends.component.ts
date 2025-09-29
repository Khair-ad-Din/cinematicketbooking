import { UserProfileService } from './../../services/user-profile.service';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FriendsService } from '../../services/friends.service';
import { CommonModule } from '@angular/common';
import { UserSummary } from '../../interfaces/social';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class FriendsComponent {
  activeTab = signal<'friends' | 'requests'>('friends');
  friendsService = inject(FriendsService);
  userProfileService = inject(UserProfileService);
  router = inject(Router);

  friends = this.friendsService.friendsList;
  receivedRequests = this.friendsService.receivedRequests;
  sentRequests = this.friendsService.sentRequests;

  searchQuery = signal<string>('');
  searchResults = signal<UserSummary[]>([]);
  isSearching = signal<boolean>(false);

  searchUsers() {
    const query = this.searchQuery().trim();
    if (!query) {
      this.searchResults.set([]);
      return;
    }

    this.isSearching.set(true);
    this.userProfileService.searchUsers(query).subscribe({
      next: (result) => {
        this.searchResults.set(result.users);
        this.isSearching.set(false);
      },
      error: () => this.isSearching.set(false),
    });
  }

  sendFriendRequest(userId: string) {
    this.friendsService.sendFriendRequest(userId);
  }

  viewFriendProfile(friendId: string) {
    this.router.navigate(['/friend-profile', friendId]);
  }
}
