import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalService, Goal } from '../../../services/goal.service';
import { HabitService } from '../../../services/habit.service';
import { GoalCardComponent } from './components/goal-card/goal-card.component';
import { CreateGoalModalComponent } from './components/create-goal-modal/create-goal-modal.component';
import { ConfirmationModalComponent } from '../../../shared/components/modal/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, GoalCardComponent, CreateGoalModalComponent, ConfirmationModalComponent],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss'
})
export class GoalsComponent implements OnInit {
  private goalService = inject(GoalService);
  private habitService = inject(HabitService);

  isModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  selectedGoal = signal<Goal | null>(null);
  goalToDeleteSk = signal<string | null>(null);
  allGoals = signal<Goal[]>([]);
  allHabits = signal<any[]>([]);

  isLoading = signal(false);

  sortedGoals = computed(() => {
    return [...this.allGoals()].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  });

  averageConsistency = computed(() => {
    const habits = this.allHabits();
    if (!habits.length) return 0;
    const sum = habits.reduce((acc, h) => acc + (h.successRate ?? 0), 0);
    return Math.round(sum / habits.length);
  });

  ngOnInit() {
    this.goalService.getGoals();
    this.goalService.goals$.subscribe((goals: Goal[]) => {
      this.allGoals.set(goals);
    });
    this.habitService.getHabits();
    this.habitService.habits$.subscribe(habits => {
      this.allHabits.set(habits);
    });
  }

  openModal() {
    this.selectedGoal.set(null);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedGoal.set(null);
  }

  handleSaveGoal(data: any) {
    if (data.sk) {
      this.goalService.updateGoal(data.sk, data).then(() => {
        this.closeModal();
      }).catch(err => {
        alert("Erro ao atualizar meta: " + err);
      });
    } else {
      this.goalService.createGoal(data).then(() => {
        this.closeModal();
      }).catch(err => {
        alert("Erro ao criar meta: " + err);
      });
    }
  }

  handleDeleteGoal(sk: string) {
    this.goalToDeleteSk.set(sk);
    this.isDeleteModalOpen.set(true);
  }

  async onConfirmDelete() {
    const sk = this.goalToDeleteSk();
    if (!sk) return;

    this.isLoading.set(true);
    try {
      await this.goalService.deleteGoal(sk);
      this.isDeleteModalOpen.set(false);
      this.goalToDeleteSk.set(null);
    } catch (err) {
      alert("Erro ao deletar meta: " + err);
    } finally {
      this.isLoading.set(false);
    }
  }

  onCancelDelete() {
    this.isDeleteModalOpen.set(false);
    this.goalToDeleteSk.set(null);
  }

  handleViewDetails(sk: string) {
    const goal = this.allGoals().find(g => g.sk === sk);
    if (goal) {
      this.selectedGoal.set(goal);
      this.isModalOpen.set(true);
    }
  }
}
