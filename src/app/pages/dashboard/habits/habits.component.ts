import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { HabitService, Habit } from '../../../services/habit.service';
import { GoalService } from '../../../services/goal.service';
import { CommonModule } from '@angular/common';
import { HabitCardComponent } from './components/habit-card/habit-card.component';
import { CreateHabitModalComponent } from './components/create-habit-modal/create-habit-modal.component';

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [CommonModule, HabitCardComponent, CreateHabitModalComponent],
  templateUrl: './habits.component.html',
  styleUrl: './habits.component.scss'
})
export class HabitsComponent implements OnInit {
  private habitService = inject(HabitService);
  private goalService = inject(GoalService);

  activeTab = signal('all');
  isModalOpen = signal(false);
  isSaving = signal(false);

  allHabits = signal<any[]>([]);
  goalsOptions = signal<{ id: string, title: string }[]>([]);

  // Derived computations
  parsedHabits = computed(() => {
    return this.allHabits().map(h => {
      const todayStr = new Date().toISOString().split('T')[0];
      const lastCheckedStr = h._ultima_verificacao ? new Date(h._ultima_verificacao).toISOString().split('T')[0] : null;

      const isCompletedToday = todayStr === lastCheckedStr;
      const completionRate = h._meta_total > 0 ? Math.min(100, Math.round((h._progresso_atual / h._meta_total) * 100)) : 0;

      return {
        ...h,
        id: h.id,
        title: h.title,
        goal: h.goal,
        frequencyStr: h.frequency === 7 ? "weekly" : (h.frequency === 1 ? "daily" : (h.frequency === 30 ? "monthly" : "custom")),
        completedToday: isCompletedToday as boolean,
        streak: h._progresso_atual as number,
        completionRate: completionRate as number,
        isAutomatic: (h._origem_meta === 1) as boolean,
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
  totalCompletedToday = computed(() => this.parsedHabits().filter(h => h.completedToday).length);
  averageExecution = computed(() => {
    const total = this.totalActive();
    if (total === 0) return 0;
    const sum = this.parsedHabits().reduce((acc, h) => acc + h.completionRate, 0);
    return Math.round(sum / total);
  });

  ngOnInit() {
    this.habitService.habits$.subscribe(habits => {
      this.allHabits.set(habits);
    });

    this.goalService.goals$.subscribe(goals => {
      this.goalsOptions.set(goals.map(g => ({ id: g.id, title: g.title })));
    });
  }

  async handleRecordHabit(habitId: string) {
    const todayStr = new Date().toISOString();
    await this.habitService.toggleHabitLog(habitId, todayStr);
  }

  handleCreateHabit(data: any) {
    console.log("Creating habit:", data);
    this.closeModal();
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }
}
