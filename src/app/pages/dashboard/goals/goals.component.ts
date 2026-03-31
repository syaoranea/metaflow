import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalService, Goal } from '../../../services/goal.service';
import { GoalProgressService } from '../../../services/goal-progress.service';
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
  private goalProgressService = inject(GoalProgressService);

  isModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  selectedGoal = signal<Goal | null>(null);
  goalToDeleteSk = signal<string | null>(null);
  allGoals = signal<Goal[]>([]);

  /** goalSk → computed progress (0-100). Populated from cache or freshly computed. */
  progressMap = signal<Record<string, number>>({});

  isLoading = signal(false);

  sortedGoals = computed(() => {
    return [...this.allGoals()].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  });

  async ngOnInit() {
    // 1. Show cached progress immediately (today's cache)
    const cached = this.goalProgressService.getCachedProgressMap();
    if (cached) {
      this.progressMap.set(cached);
    }

    // 2. Load goals
    const goals = await this.goalService.getGoals();
    this.allGoals.set(goals);

    // 3. Load all subgoals to compute average consistency
    const consistency = await this.loadAverageConsistency(goals);
    console.log('[GoalsComponent] Consistência geral dos hábitos:', consistency + '%');

    // 4. Compute progress for each goal and cache
    const map = this.goalProgressService.computeAndCacheAll(goals, consistency);
    this.progressMap.set(map);

    for (const goal of goals) {
      console.log(`  → "${goal.title}": progress=${map[goal.sk] ?? 0}% | created_at=${goal.created_at ?? 'N/A'} | deadline=${goal.deadline ?? 'SEM PRAZO'}`);
    }
  }

  /**
   * Fetches subgoals from all goals in parallel and computes
   * the average successRate (0-100). Returns 0 if none found.
   */
  private async loadAverageConsistency(goals: Goal[]): Promise<number> {
    if (!goals.length) return 0;
    try {
      const allSubgoalArrays = await Promise.all(
        goals.map(g => this.goalService.getSubgoals(g.sk).catch(() => []))
      );
      const allSubgoals = allSubgoalArrays.flat();
      if (!allSubgoals.length) return 0;
      const withRate = allSubgoals.filter((s: any) => s.successRate != null && s.successRate > 0);
      if (!withRate.length) return 0;
      const sum = withRate.reduce((acc: number, s: any) => acc + s.successRate, 0);
      return Math.round(sum / withRate.length);
    } catch {
      return 0;
    }
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
