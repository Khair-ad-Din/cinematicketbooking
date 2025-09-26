export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  isPublic: boolean;
  movieCount: number;
  favoriteGenres: string[];
  joinedDate: string;
  lastActive?: string;
}

export interface FriendRequest {
  id: string;
  fromUser: UserSummary;
  toUser: UserSummary;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface UserConnection {
  id: string;
  friend: UserSummary;
  status: 'ACCEPTED' | 'BLOCKED';
  createdAt: string;
}

export interface UserSummary {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

// DTO for API Calls
export interface SendFriendRequestDto {
  toUserId: string;
  message?: string;
}

export interface UpdateProfileDto {
  displayName?: string;
  bio?: string;
  isPublic?: boolean;
  favoriteGenres?: string[];
}

export interface UserSearchResult {
  users: UserSummary[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}
