import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  // Current Settings
  private settings = signal({
    theme: 'light',
    notifications: true,
    language: 'es-ES',
  });

  updateSetting(key: string, value: any) {
    // TODO
  }
}
