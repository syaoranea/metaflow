import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService, ReportsData } from '../../../services/report.service';
import { HabitPerformanceCardComponent } from './components/habit-performance-card/habit-performance-card.component';
import { LineTrendChartComponent } from './components/line-trend-chart/line-trend-chart.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, HabitPerformanceCardComponent, LineTrendChartComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);

  periodFilter = signal('30days');
  data = signal<ReportsData | null>(null);

  readonly Math = Math;

  constructor() {
    effect(() => {
      const period = this.periodFilter();
      let days = 30;
      if (period === '7days') days = 7;
      if (period === '90days') days = 90;
      if (period === 'this_year') days = 365;

      this.reportService.getReportsData(days).then(res => this.data.set(res));
    });
  }

  ngOnInit() { }

  setFilter(filter: string) {
    this.periodFilter.set(filter);
  }
}
