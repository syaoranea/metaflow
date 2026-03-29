import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Goal } from '../../../../../services/goal.service';
import { GoalProgressService } from '../../../../../services/goal-progress.service';

@Component({
  selector: 'app-goal-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './goal-card.component.html',
  styleUrl: './goal-card.component.scss'
})
export class GoalCardComponent {
  @Input() goal!: Goal;
  @Input() generalConsistency: number = 0;
  @Output() onViewDetails = new EventEmitter<string>();
  @Output() onEdit = new EventEmitter<string>();

  private router = inject(Router);
  private goalProgressService = inject(GoalProgressService);

  readonly Math = Math;

  get calculatedProgress(): number {
    return this.goalProgressService.calculateProgress(this.goal, this.generalConsistency);
  }

  get isFinancesGoal() {
    return this.goal.title === 'Organizar minhas finanças';
  }

  viewDetails(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/dashboard/habits'], { queryParams: { goalId: this.goal.sk } });
    this.onViewDetails.emit(this.goal.sk);
  }

  openFinanceApp(event: Event) {
    event.stopPropagation();
    // Assuming a placeholder URL for now, will ask user for the real one
    window.open('https://financas-app.metasflow.com', '_blank');
  }
}
