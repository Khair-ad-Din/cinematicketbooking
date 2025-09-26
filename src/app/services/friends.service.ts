import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, tap, map } from 'rxjs';
import {
  FriendRequest,
  UserConnection,
  SendFriendRequestDto,
  UserSummary,
} from '../interfaces/social';
import { UserStateService } from './user-state.service';

@Injectable({ providedIn: 'root' })
export class FriendsService {
  private http = inject(HttpClient);
  private userStateService = inject(UserStateService);

  private readonly API_BASE = `http://localhost:8080/api/friends`;

  // Signals for state management
  private friendRequests = signal<FriendRequest[]>([]);
  private friends = signal<UserConnection[]>([]);
  private isLoading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Public readonly signals
  public readonly requests = this.friendRequests.asReadonly();
  public readonly friendsList = this.friends.asReadonly();
  public readonly loading = this.isLoading.asReadonly();
  public readonly friendsError = this.error.asReadonly();

  // Computed values
  public readonly pendingRequests = computed(() =>
    this.friendRequests().filter((req) => req.status === 'PENDING')
  );

  public readonly sentRequests = computed(() => {
    const currentUserId = this.userStateService.getCurrentUserIdentifier();
    return this.friendRequests().filter(
      (req) => req.fromUser.id === currentUserId && req.status === 'PENDING'
    );
  });

  public readonly receivedRequests = computed(() => {
    const currentUserId = this.userStateService.getCurrentUserIdentifier();
    return this.friendRequests().filter(
      (req) => req.toUser.id === currentUserId && req.status === 'PENDING'
    );
  });

  public readonly friendsCount = computed(() => this.friends().length);

  public readonly onlineFriends = computed(
    () => this.friends().filter((conn) => conn.friend.isOnline).length
  );

  constructor() {
    this.initializeFriends();
  }

  private initializeFriends() {
    const currentUserId = this.userStateService.getCurrentUserIdentifier();
    if (currentUserId && currentUserId !== 'anonymous-user') {
      this.loadFriendRequests();
      this.loadFriends();
    }
  }

  // Friend Requests API
  loadFriendRequests(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http
      .get<FriendRequest[]>(`${this.API_BASE}/requests`)
      .pipe(
        catchError((error) => {
          console.error('Error loading friend requests:', error);
          this.error.set('Failed to load friend requests');
          return of([]);
        })
      )
      .subscribe((requests) => {
        this.friendRequests.set(requests);
        this.isLoading.set(false);
      });
  }

  sendFriendRequest(
    toUserId: string,
    message?: string
  ): Observable<FriendRequest | null> {
    this.isLoading.set(true);
    this.error.set(null);

    const requestDto: SendFriendRequestDto = { toUserId, message };

    const request = this.http
      .post<FriendRequest>(`${this.API_BASE}/requests`, requestDto)
      .pipe(
        tap((request) => {
          if (request) {
            this.friendRequests.update((requests) => [...requests, request]);
          }
          this.isLoading.set(false);
        }),
        catchError((error) => {
          console.error('Error sending friend request:', error);
          this.error.set('Failed to send friend request');
          this.isLoading.set(false);
          return of(null);
        })
      );

    // Subscribe to execute the request
    request.subscribe();

    return request;
  }

  acceptFriendRequest(requestId: string): Observable<UserConnection | null> {
    this.isLoading.set(true);
    this.error.set(null);

    const request = this.http
      .put<UserConnection>(`${this.API_BASE}/requests/${requestId}/accept`, {})
      .pipe(
        tap((connection) => {
          if (connection) {
            // Update request status
            this.friendRequests.update((requests) =>
              requests.map((req) =>
                req.id === requestId
                  ? { ...req, status: 'ACCEPTED' as const }
                  : req
              )
            );
            // Add to friends list
            this.friends.update((friends) => [...friends, connection]);
          }
          this.isLoading.set(false);
        }),
        catchError((error) => {
          console.error('Error accepting friend request:', error);
          this.error.set('Failed to accept friend request');
          this.isLoading.set(false);
          return of(null);
        })
      );

    // Subscribe to execute the request
    request.subscribe();

    return request;
  }

  rejectFriendRequest(requestId: string): Observable<boolean> {
    this.isLoading.set(true);
    this.error.set(null);

    const request = this.http
      .put<void>(`${this.API_BASE}/requests/${requestId}/reject`, {})
      .pipe(
        map(() => true), // Transform response to boolean
        tap(() => {
          // Update request status
          this.friendRequests.update((requests) =>
            requests.map((req) =>
              req.id === requestId
                ? { ...req, status: 'REJECTED' as const }
                : req
            )
          );
          this.isLoading.set(false);
        }),
        catchError((error) => {
          console.error('Error rejecting friend request:', error);
          this.error.set('Failed to reject friend request');
          this.isLoading.set(false);
          return of(false);
        })
      );

    // Subscribe to execute the request
    request.subscribe();

    return request;
  }

  // Friends API
  loadFriends(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http
      .get<UserConnection[]>(`${this.API_BASE}`)
      .pipe(
        catchError((error) => {
          console.error('Error loading friends:', error);
          this.error.set('Failed to load friends');
          return of([]);
        })
      )
      .subscribe((friends) => {
        this.friends.set(friends);
        this.isLoading.set(false);
      });
  }

  removeFriend(friendId: string): Observable<boolean> {
    this.isLoading.set(true);
    this.error.set(null);

    const request = this.http
      .delete<void>(`${this.API_BASE}/${friendId}`)
      .pipe(
        map(() => true), // Transform response to boolean
        tap(() => {
          // Remove from friends list
          this.friends.update((friends) =>
            friends.filter((conn) => conn.friend.id !== friendId)
          );
          this.isLoading.set(false);
        }),
        catchError((error) => {
          console.error('Error removing friend:', error);
          this.error.set('Failed to remove friend');
          this.isLoading.set(false);
          return of(false);
        })
      );

    // Subscribe to execute the request
    request.subscribe();

    return request;
  }

  // Utility methods
  isFriend(userId: string): boolean {
    return this.friends().some((conn) => conn.friend.id === userId);
  }

  hasPendingRequest(userId: string): boolean {
    const currentUserId = this.userStateService.getCurrentUserIdentifier();
    return this.friendRequests().some(
      (req) =>
        (req.fromUser.id === currentUserId &&
          req.toUser.id === userId &&
          req.status === 'PENDING') ||
        (req.toUser.id === currentUserId &&
          req.fromUser.id === userId &&
          req.status === 'PENDING')
    );
  }

  getFriendshipStatus(userId: string): 'none' | 'pending' | 'friends' {
    if (this.isFriend(userId)) return 'friends';
    if (this.hasPendingRequest(userId)) return 'pending';
    return 'none';
  }

  // Clear friends data (for logout)
  clearFriends() {
    this.friendRequests.set([]);
    this.friends.set([]);
    this.error.set(null);
  }
}
