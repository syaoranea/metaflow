import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SettingsService, UserSettings } from '../../../services/settings.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  settingsForm: FormGroup;
  loaded = false;
  isSaving = false;
  isSavingProfile = false;

  // Estados do Modal de Feedback
  showFeedbackModal = signal(false);
  feedbackType = signal<'success' | 'error'>('success');
  feedbackMessage = signal('');

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

  async ngOnInit() {
    // 1. Puxar configurações genéricas (mock ou local)
    const settings = await this.settingsService.getUserSettings();
    this.settingsForm.patchValue(settings);

    // 2. Puxar dados REAIS do usuário vindos da API (AuthService)
    const user = await this.authService.getUser();
    if (user) {
      this.settingsForm.patchValue({
        name: user.name,
        email: user.email,
        profession: user.profession || settings.profession,
        plan: user.plan || settings.plan
      });
    }

    // Reset dirty state after initial load
    this.settingsForm.markAsPristine();
    this.loaded = true;
  }

  get isDirty(): boolean {
    return this.settingsForm.dirty;
  }

  async updateProfile() {
    const { name, profession } = this.settingsForm.value;
    this.isSavingProfile = true;
    try {
      const res = await this.authService.updateUser({ name, profession });
      if (res.success) {
        this.feedbackType.set('success');
        this.feedbackMessage.set('Perfil atualizado com sucesso! Seus dados foram salvos com segurança.');
        this.showFeedbackModal.set(true);
      } else {
        this.feedbackType.set('error');
        this.feedbackMessage.set(res.error || 'Não foi possível atualizar o perfil.');
        this.showFeedbackModal.set(true);
      }
    } catch (err) {
      this.feedbackType.set('error');
      this.feedbackMessage.set('Ocorreu um erro inesperado ao salvar os dados.');
      this.showFeedbackModal.set(true);
    } finally {
      this.isSavingProfile = false;
    }
  }

  closeFeedbackModal() {
    this.showFeedbackModal.set(false);
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

  async cancel() {
    this.loaded = false;
    const settings = await this.settingsService.getUserSettings();
    this.settingsForm.patchValue(settings);

    const user = await this.authService.getUser();
    if (user) {
      this.settingsForm.patchValue({
        name: user.name,
        email: user.email,
        profession: user.profession || settings.profession,
        plan: user.plan || settings.plan
      });
    }

    this.settingsForm.markAsPristine();
    this.loaded = true;
  }
}
