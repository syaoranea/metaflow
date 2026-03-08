import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalService, Goal } from '../../../services/goal.service';
import { GoalCardComponent } from './components/goal-card/goal-card.component';
import { CreateGoalModalComponent } from './components/create-goal-modal/create-goal-modal.component';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, GoalCardComponent, CreateGoalModalComponent],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss'
})
export class GoalsComponent implements OnInit {
  private goalService = inject(GoalService);

  isModalOpen = signal(false);
  allGoals = signal<Goal[]>([]);

  sortedGoals = computed(() => {
    return [...this.allGoals()].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  });

  ngOnInit() {
    this.goalService.goals$.subscribe(goals => {
      this.allGoals.set(goals);
    });
  }

  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  handleCreateGoal(newGoal: any) {
    this.goalService.createGoal(newGoal).then(() => {
      this.closeModal();
    }).catch(err => {
      alert("Erro ao criar meta: " + err);
    });
  }

  handleViewDetails(id: string) {
    // Navigate to details (not implemented yet)
    console.log("Navigating to goal details", id);
  }
}
