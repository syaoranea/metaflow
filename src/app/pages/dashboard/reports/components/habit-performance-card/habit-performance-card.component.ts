import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-habit-performance-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './habit-performance-card.component.html',
  styleUrl: './habit-performance-card.component.scss'
})
export class HabitPerformanceCardComponent {
  @Input() title: string = '';
  @Input() completionRate: number = 0;
  @Input() weeklyTrend: number[] = [];

  readonly Math = Math; // to use Math.round in template
}
