import { Injectable } from '@angular/core';

export interface UserSettings {
  name: string;
  email: string;
  profession?: string;
  mainFocus: string;
  defaultHabitFrequency: string;
  yearlyTarget: number;
  showProgressAs: 'percentage' | 'points';
  notifications: {
    dailyReminder: boolean;
    weeklySummary: boolean;
    delayedGoalAlert: boolean;
  };
  twoFactorEnabled: boolean;
  plan: 'free' | 'pro';
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor() { }

  async getUserSettings(): Promise<UserSettings> {
    return {
      name: "Eduardo",
      email: "eduardo@example.com",
      profession: "Desenvolvedor",
      mainFocus: "Saúde e Finanças",
      defaultHabitFrequency: "daily",
      yearlyTarget: 12,
      showProgressAs: "percentage",
      notifications: {
        dailyReminder: true,
        weeklySummary: true,
        delayedGoalAlert: false
      },
      twoFactorEnabled: false,
      plan: "free"
    };
  }

  async updateUserSettings(data: Partial<UserSettings>): Promise<boolean> {
    // Simulate delay
    return new Promise(resolve => setTimeout(() => resolve(true), 800));
  }
}
