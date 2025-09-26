import { UserProfileService } from './../../services/user-profile.service';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { UserPreferencesService } from './../../services/user-preferences.service';
import { UpdateProfileDto } from '../../interfaces/social';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-config-profile',
  templateUrl: './config-profile.component.html',
  styleUrl: './config-profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class ConfigProfileComponent {
  private userProfileService = inject(UserProfileService);
  private preferenceService = inject(UserPreferencesService);

  userPreferences = computed(() => this.preferenceService.getUserPreferences());

  // Profile data signals
  currentProfile = this.userProfileService.userProfile;
  isLoading = this.userProfileService.loading;
  error = this.userProfileService.profileError;

  // Edit Form Signals
  isEditing = signal<boolean>(false);
  editForm = signal<UpdateProfileDto>({});

  // Avabile genres for selection
  availableGenres = [
    'Action',
    'Adventure',
    'Animation',
    'Comedy',
    'Crime',
    'Documentary',
    'Drama',
    'Family',
    'Fantasy',
    'History',
    'Terror',
    'Musical',
    'Mistery',
    'Romance',
    'Science Fiction',
    'TV Movie',
    'Thriller',
    'War',
    'Western',
  ];

  // Form Methods
  startEditing() {
    const profile = this.currentProfile();
    if (profile) {
      this.editForm.set({
        displayName: profile.displayName,
        bio: profile.bio || '',
        isPublic: profile.isPublic,
        favoriteGenres: [...(profile.favoriteGenres || [])],
      });
      this.isEditing.set(true);
    }
  }
  saveProfile() {
    const formData = this.editForm();
    console.log('Saving profile with data:', formData);

    this.userProfileService.updateProfile(formData).subscribe({
      next: (updatedProfile) => {
        console.log('Update response:', updatedProfile);
        if (updatedProfile) {
          this.isEditing.set(false);
          alert('Profile updated successfully!');
        } else {
          console.log('Updated profile is null or falsy');
        }
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
      },
    });
  }
  cancelEditing() {
    this.isEditing.set(false);
    this.editForm.set({});
  }

  // Statistics Computed
  profileStats = computed(() => {
    const profile = this.currentProfile();
    const preferences = this.userPreferences();

    if (!profile) return null;

    return {
      movieCount: profile.movieCount,
      friendsCount: 0, //TODO: Get from friends service
      joinedDaysAgo: this.calculateDaysAgo(profile.joinedDate),
      favoriteGenresCount: profile.favoriteGenres?.length || 0,
      ratingsCount: preferences?.preferences?.length || 0,
    };
  });

  private calculateDaysAgo(dateString: string): number {
    const joinDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());

    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  clearPreferences() {
    if (confirm('Are you sure? This will delete all your movie ratings.')) {
      this.preferenceService.clearUserPreferences();
      alert('Preferences cleared successfully.');
    }
  }

  updateFormField(field: keyof UpdateProfileDto, event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const value =
      target.type === 'checkbox'
        ? (target as HTMLInputElement).checked
        : target.value;

    this.editForm.update((form) => ({
      ...form,
      [field]: value,
    }));
  }

  toggleGenre(genre: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;

    this.editForm.update((form) => {
      const currentGenres = form.favoriteGenres || [];
      const newGenres = isChecked
        ? [...currentGenres, genre]
        : currentGenres.filter((g) => g !== genre);

      return {
        ...form,
        favoriteGenres: newGenres,
      };
    });
  }
}
