import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SettingsService, UserSettings } from '../../../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private fb = inject(FormBuilder);

  settingsForm: FormGroup;
  loaded = false;
  isSaving = false;

  constructor() {
    this.settingsForm = this.fb.group({
      name: [''],
      email: [''],
      profession: [''],
      mainFocus: [''],
      defaultHabitFrequency: [''],
      yearlyTarget: [12],
      showProgressAs: ['percentage'],
      notifications: this.fb.group({
        dailyReminder: [false],
        weeklySummary: [false],
        delayedGoalAlert: [false]
      }),
      twoFactorEnabled: [false],
      plan: ['free']
    });
  }

  ngOnInit() {
    this.settingsService.getUserSettings().then(settings => {
      this.settingsForm.patchValue(settings);
      // Reset dirty state after initial load
      this.settingsForm.markAsPristine();
      this.loaded = true;
    });
  }

  get isDirty(): boolean {
    return this.settingsForm.dirty;
  }

  get currentPlan(): string {
    return this.settingsForm.get('plan')?.value || 'free';
  }

  get userName(): string {
    const rawName = this.settingsForm.get('name')?.value || '';
    return rawName.split(' ')[0] || 'Usuário';
  }

  save() {
    if (!this.isDirty) return;

    this.isSaving = true;
    this.settingsService.updateUserSettings(this.settingsForm.value).then(() => {
      this.isSaving = false;
      this.settingsForm.markAsPristine();
    }).catch(err => {
      this.isSaving = false;
      alert("Erro ao salvar: " + err);
    });
  }

  cancel() {
    this.loaded = false;
    this.settingsService.getUserSettings().then(settings => {
      this.settingsForm.patchValue(settings);
      this.settingsForm.markAsPristine();
      this.loaded = true;
    });
  }
}
