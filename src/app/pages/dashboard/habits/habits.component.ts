import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { HabitService, Habit } from '../../../services/habit.service';
import { GoalService, Goal } from '../../../services/goal.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HabitCardComponent } from './components/habit-card/habit-card.component';
import { CreateHabitModalComponent } from './components/create-habit-modal/create-habit-modal.component';
import { SkeletonComponent } from '../../../shared/components/ui/skeleton/skeleton.component';
import { ConfirmationModalComponent } from '../../../shared/components/modal/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [CommonModule, HabitCardComponent, CreateHabitModalComponent, SkeletonComponent, ConfirmationModalComponent],
  templateUrl: './habits.component.html',
  styleUrl: './habits.component.scss'
})
export class HabitsComponent implements OnInit {
  private habitService = inject(HabitService);
  private goalService = inject(GoalService);
  private route = inject(ActivatedRoute);

  goalId = signal<string | null>(null);
  parentGoal = signal<Goal | null>(null);

  activeTab = signal('all');
  isModalOpen = signal(false);
  isSaving = signal(false);
  isLoadingHabits = signal(false);
  selectedHabit = signal<any | null>(null);

  isDeleteModalOpen = signal(false);
  habitToDeleteId = signal<string | null>(null);
  habitToDeletePk = signal<string | null>(null);

  allHabits = signal<any[]>([]);
  goalsOptions = signal<{ id: string, title: string }[]>([]);

  // Derived computations
  completedHabitsCookie = signal<string[]>([]);

  parsedHabits = computed(() => {
    return this.allHabits().map(h => {
      const todayStr = new Date().toISOString().split('T')[0];
      const lastCheckedStr = h._ultima_verificacao ? new Date(h._ultima_verificacao).toISOString().split('T')[0] : null;

      const id = h.sk || h.id;
      const isCompletedInCookie = this.completedHabitsCookie().includes(id);
      const isCompletedToday = todayStr === lastCheckedStr || isCompletedInCookie;
      const completionRate = h.successRate !== undefined ? h.successRate : (h._meta_total > 0 ? Math.min(100, Math.round((h._progresso_atual / h._meta_total) * 100)) : 0);

      return {
        ...h,
        id: id,
        title: h.title,
        goal: h.goal,
        frequencyStr: h.frequency === 7 ? "weekly" : (h.frequency === 1 ? "daily" : (h.frequency === 30 ? "monthly" : "custom")),
        completedToday: isCompletedToday as boolean,
        streak: h._progresso_atual as number,
        completionRate: completionRate as number,
        isAutomatic: (h._origem_meta === 1 || h.auto === true) as boolean,
      };
    });
  });

  filteredHabits = computed(() => {
    const habits = this.parsedHabits();
    const tab = this.activeTab();
    if (tab === 'completed') return habits.filter(h => h.completedToday);
    if (tab === 'pending') return habits.filter(h => !h.completedToday);
    return habits;
  });

  totalActive = computed(() => this.parsedHabits().length);
  totalCompletedToday = computed(() => {
    const fromServerAndCookie = this.parsedHabits().filter(h => h.completedToday).length;
    // Preencher o campo na sessão Consistência Geral, campo hoje com base no total (incluindo o cookie)
    return fromServerAndCookie;
  });

  averageExecution = computed(() => {
    const total = this.totalActive();
    if (total === 0) return 0;
    const sum = this.parsedHabits().reduce((acc, h) => acc + h.completionRate, 0);
    return Math.round(sum / total);
  });

  ngOnInit() {
    this.loadCompletedHabitsCookie();
    this.route.queryParams.subscribe(params => {
      const gid = params['goalId'];
      this.goalId.set(gid);
      if (gid) {
        this.loadSubgoals(gid);
      } else {
        this.loadAllHabits();
      }
    });

    this.goalService.goals$.subscribe(goals => {
      this.goalsOptions.set(goals.map(g => ({ id: g.sk, title: g.title })));
      if (this.goalId()) {
        const parent = goals.find(g => g.sk === this.goalId());
        if (parent) this.parentGoal.set(parent);
      }
    });
  }

  private async loadSubgoals(gid: string) {
    this.isLoadingHabits.set(true);
    try {
      const subgoals = await this.goalService.getSubgoals(gid);
      this.allHabits.set(subgoals);
    } finally {
      this.isLoadingHabits.set(false);
    }

    // Also try to find parent goal title if not already loaded
    if (!this.parentGoal()) {
      const goals = await this.goalService.getGoals();
      const parent = goals.find(g => g.sk === gid);
      if (parent) this.parentGoal.set(parent);
    }
  }

  private loadAllHabits() {
    this.isLoadingHabits.set(true);
    this.habitService.habits$.subscribe(habits => {
      this.allHabits.set(habits);
      this.isLoadingHabits.set(false);
    });
  }

  async handleRecordHabit(habitId: string) {
    console.log('HabitsComponent: handleRecordHabit received id:', habitId);
    const habit = this.allHabits().find(h => (h.sk || h.id) === habitId);

    if (!habit) {
      console.warn('HabitsComponent: habit not found in allHabits() for id:', habitId);
      return;
    }

    const parentSk = habit.pk || habit.goalId;
    console.log('HabitsComponent: parentSk found:', parentSk);

    if (!parentSk) {
      alert("Este hábito não está vinculado a uma meta.");
      return;
    }

    this.saveCompletedHabitsCookie(habitId);

    console.log('HabitsComponent: calling goalService.registerProgress...');
    this.isLoadingHabits.set(true);
    const res = await this.goalService.registerProgress(parentSk, habitId, 10);
    console.log('HabitsComponent: registerProgress response:', res);

    if (res.success) {
      if (this.goalId()) {
        await this.loadSubgoals(this.goalId()!);
      } else {
        await this.habitService.getHabits();
      }
    } else {
      alert("Erro ao registrar progresso: " + res.error);
      this.isLoadingHabits.set(false);
    }
  }

  async handleCreateHabit(data: any) {
    this.isSaving.set(true);
    try {
      const parentSk = data.goalId || this.goalId();
      if (!parentSk) {
        alert("Selecione uma meta para vincular o hábito.");
        return;
      }

      let res: { success: boolean, goal?: Goal };

      if (data.id) {
        // Update existing habit
        res = await this.goalService.updateSubgoal(data.id, {
          pk: parentSk,
          sk: data.id,
          title: data.title,
          frequency: data.frequency
        });
      } else {
        // Create new habit
        res = await this.goalService.createHabit(parentSk, {
          title: data.title,
          frequency: data.frequency
        });
      }

      if (res.success) {
        if (this.goalId()) {
          await this.loadSubgoals(this.goalId()!);
        } else {
          await this.habitService.getHabits();
        }
        this.closeModal();
      } else {
        alert("Erro ao " + (data.id ? "atualizar" : "criar") + " hábito.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao " + (data.id ? "processar" : "criar") + " hábito.");
    } finally {
      this.isSaving.set(false);
    }
  }

  async handleDeleteHabit(habitId: string) {
    const habit = this.allHabits().find(h => (h.sk || h.id) === habitId);
    if (!habit) return;

    this.habitToDeleteId.set(habitId);
    this.habitToDeletePk.set(habit.pk || habit.goalId || this.goalId());
    this.isDeleteModalOpen.set(true);
  }

  async onConfirmDelete() {
    const habitId = this.habitToDeleteId();
    const parentPk = this.habitToDeletePk();

    if (!habitId || !parentPk) return;

    this.isSaving.set(true);
    try {
      const res = await this.goalService.deleteSubgoal(habitId, parentPk);
      if (res.success) {
        if (this.goalId()) {
          await this.loadSubgoals(this.goalId()!);
        } else {
          await this.habitService.getHabits();
        }
        this.closeDeleteModal();
        this.closeModal(); // Close the edit modal if it was open
      } else {
        alert("Erro ao remover hábito: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao remover hábito.");
    } finally {
      this.isSaving.set(false);
    }
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.habitToDeleteId.set(null);
    this.habitToDeletePk.set(null);
  }

  handleCardClick(habitId: string) {
    const habit = this.allHabits().find(h => (h.sk || h.id) === habitId);
    if (habit) {
      this.openModal(habit);
    }
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  openModal(habit: any = null) {
    this.selectedHabit.set(habit);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedHabit.set(null);
  }

  loadCompletedHabitsCookie() {
    const todayStr = new Date().toISOString().split('T')[0];
    const cookieName = `completed_habits_${todayStr}`;
    const cookieValue = this.getCookie(cookieName);
    if (cookieValue) {
      try {
        this.completedHabitsCookie.set(JSON.parse(cookieValue));
      } catch (e) {
        this.completedHabitsCookie.set([]);
      }
    }
  }

  saveCompletedHabitsCookie(habitId: string) {
    const todayStr = new Date().toISOString().split('T')[0];
    const cookieName = `completed_habits_${todayStr}`;
    const current = new Set(this.completedHabitsCookie());
    current.add(habitId);
    const newArray = Array.from(current);
    this.completedHabitsCookie.set(newArray);
    this.setCookie(cookieName, JSON.stringify(newArray), 1);
  }

  private setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
      let date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    if (typeof document !== 'undefined') {
      document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }
  }

  private getCookie(name: string) {
    if (typeof document === 'undefined') return null;
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
}
