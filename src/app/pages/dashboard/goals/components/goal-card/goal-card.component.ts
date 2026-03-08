import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Goal } from '../../../../../services/goal.service';

@Component({
  selector: 'app-goal-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './goal-card.component.html',
  styleUrl: './goal-card.component.scss'
})
export class GoalCardComponent {
  @Input() goal!: Goal;
  @Output() onViewDetails = new EventEmitter<string>();

  readonly Math = Math;

  viewDetails() {
    this.onViewDetails.emit(this.goal.id);
  }
}
