import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerformanceService, PerformanceData } from '../../../services/performance.service';
import { LevelCardComponent } from './components/level-card/level-card.component';
import { AchievementListComponent } from './components/achievement-list/achievement-list.component';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, LevelCardComponent, AchievementListComponent],
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.scss'
})
export class PerformanceComponent implements OnInit {
  private perfService = inject(PerformanceService);

  periodFilter = signal('30days');
  isProMode = signal(false);
  data = signal<PerformanceData | null>(null);

  chartData = signal<number[]>([]);

  constructor() {
    effect(() => {
      const period = this.periodFilter();
      let days = 30;
      if (period === '7days') days = 7;
      if (period === '90days') days = 90;

      this.perfService.getPerformanceData(days).then(res => this.data.set(res));
      this.chartData.set(this.generateMockChartData(period));
    });
  }

  ngOnInit() { }

  setFilter(filter: string) {
    this.periodFilter.set(filter);
  }

  togglePro() {
    this.isProMode.set(!this.isProMode());
  }

  private generateMockChartData(period: string): number[] {
    const length = period === "7days" ? 7 : period === "90days" ? 90 : 30;
    return Array.from({ length }, (_, i) => {
      const wave = Math.sin(i / 5) * 10;
      const upward = i * (period === "90days" ? 0.3 : period === "7days" ? 2 : 0.8);
      const noise = (Math.random() - 0.5) * 8;
      return Math.min(100, Math.max(0, Math.round(60 + wave + upward + noise)));
    });
  }
}
