import { Component, inject } from '@angular/core';
import { UserPreferencesService } from './../../services/user-preferences.service';

@Component({
  selector: 'app-config-profile',
  imports: [],
  templateUrl: './config-profile.component.html',
  styleUrl: './config-profile.component.css',
})
export class ConfigProfileComponent {
  private preferenceService = inject(UserPreferencesService);

  userPreferences = this.preferenceService.getUserPreferences();

  clearPreferences() {
    if (confirm('Are you sure? This will delete all your movie ratings.')) {
      this.preferenceService.clearUserPreferences();
      alert('Preferences cleared successfully.');
    }
  }
}
