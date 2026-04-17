import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalService, Goal } from '../../../services/goal.service';
import { GoalProgressService } from '../../../services/goal-progress.service';
import { GoalCardComponent } from './components/goal-card/goal-card.component';
import { CreateGoalModalComponent } from './components/create-goal-modal/create-goal-modal.component';
import { ConfirmationModalComponent } from '../../../shared/components/modal/confirmation-modal/confirmation-modal.component';
import { AuthService, User } from '../../../services/auth.service';

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

  private authService = inject(AuthService);

  isModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  selectedGoal = signal<Goal | null>(null);
  goalToDeleteSk = signal<string | null>(null);
  allGoals = signal<Goal[]>([]);

  currentUser = signal<User | null>(null);
  isLimitReached = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    return user.plan === 'FREE' && this.allGoals().filter(g => !g.sk.startsWith('SUBGOAL#')).length >= 2;
  });

  /** goalSk → computed progress (0-100). Populated from cache or freshly computed. */
  progressMap = signal<Record<string, number | undefined>>({});

  isLoading = signal(false);
  isPageLoading = signal(true);
  isMutating = signal(false);

  sortedGoals = computed(() => {
    return [...this.allGoals()].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  });

  /** Number of skeleton cards to show while mutating – matches current grid size. */
  skeletonCount = computed(() => {
    const count = this.allGoals().length;
    return Array.from({ length: count > 0 ? count : 4 }, (_, i) => i + 1);
  });

  private readonly CACHE_KEY = 'goals_page_cache';

  async ngOnInit() {
    // 0. Load current user info
    this.authService.currentUser$.subscribe(u => this.currentUser.set(u));
    if (!this.currentUser()) {
        await this.authService.getUser();
    }

    // 1. Restore from cache to show UI immediately
    const cachedGoalsRaw = localStorage.getItem(this.CACHE_KEY);
    if (cachedGoalsRaw) {
      try {
        const cachedGoals = JSON.parse(cachedGoalsRaw);
        if (Array.isArray(cachedGoals)) {
          this.allGoals.set(cachedGoals);
          // Also try to restore progress maps to have everything ready
          const cachedMap = this.goalProgressService.getCachedProgressMap();
          if (cachedMap) {
            this.progressMap.set(cachedMap);
          }
          // Turn off skeleton since we have cached data
          this.isPageLoading.set(false);
        }
      } catch (err) {
        console.warn('Failed to parse cached goals', err);
      }
    } else {
      // No cache, show skeleton
      this.isPageLoading.set(true);
    }

    // 2. Fetch fresh data in the background
    try {
      await this.reloadGoals();
    } finally {
      this.isPageLoading.set(false);
    }
  }

  private async reloadGoals() {
    // 1. Show cached progress immediately (today's cache)
    const cached = this.goalProgressService.getCachedProgressMap();
    if (cached) {
      this.progressMap.set(cached);
    }

    // 2. Load goals from API
    const goals = await this.goalService.getGoals();
    this.allGoals.set(goals);
    
    // Save to cache
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(goals));
    } catch {
      // ignore storage full
    }

    // 3. Load all subgoals to compute average consistency
    const consistency = await this.loadAverageConsistency(goals);
    console.log('[GoalsComponent] Consistência geral dos hábitos:', consistency + '%');

    // 4. Compute progress for each goal and cache it too
    const map = this.goalProgressService.computeAndCacheAll(goals, consistency);
    this.progressMap.set(map);

    for (const goal of goals) {
      console.log(`  → "${goal.title}": progress=${map[goal.sk] ?? 0}% | created_at=${goal.created_at ?? 'N/A'} | deadline=${goal.deadline ?? 'SEM PRAZO'}`);
    }
  }

  /**
   * Fetches subgoals from all goals in parallel and computes
   * the average success rate (same formula as Dashboard "Consistência":
   * % of habits where progresso_atual >= meta_total OU feitos hoje).
   */
  private async loadAverageConsistency(goals: Goal[]): Promise<number> {
    if (!goals.length) return 0;
    try {
      const allSubgoalArrays = await Promise.all(
        goals.map(g => this.goalService.getSubgoals(g.sk).catch(() => []))
      );
      const allSubgoals = allSubgoalArrays.flat();
      if (!allSubgoals.length) return 0;
      
      const todayStr = new Date().toISOString().split('T')[0];

      const completedHabits = allSubgoals.filter((h: any) => {
        const lastCheckedStr = h._ultima_verificacao ? new Date(h._ultima_verificacao).toISOString().split('T')[0] : null;
        const mappedToday = todayStr === lastCheckedStr;
        return mappedToday || (Number(h._meta_total) > 0 && Number(h._progresso_atual) >= Number(h._meta_total));
      }).length;

      return Math.round((completedHabits / allSubgoals.length) * 100);
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

  async handleSaveGoal(data: any) {
    this.closeModal();
    this.isMutating.set(true);
    try {
      if (data.sk) {
        await this.goalService.updateGoal(data.sk, data);
      } else {
        await this.goalService.createGoal(data);
      }
      await this.reloadGoals();
    } catch (err) {
      alert('Erro ao salvar meta: ' + err);
    } finally {
      this.isMutating.set(false);
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
      this.isMutating.set(true);
      await this.reloadGoals();
    } catch (err) {
      alert('Erro ao deletar meta: ' + err);
    } finally {
      this.isLoading.set(false);
      this.isMutating.set(false);
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
