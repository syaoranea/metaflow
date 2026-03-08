import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-line-trend-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './line-trend-chart.component.html',
  styleUrl: './line-trend-chart.component.scss'
})
export class LineTrendChartComponent {
  @Input() data: number[] = [];
  @Input() labels: string[] = [];

  readonly height = 180;
  readonly width = 1000;

  get showLabelsIndices(): number[] {
    const len = this.labels.length;
    if (len === 0) return [];
    return [
      0,
      Math.floor(len / 4),
      Math.floor(len / 2),
      Math.floor((len / 4) * 3),
      len - 1
    ];
  }

  get pathD(): string {
    if (this.data.length === 0) return '';
    const points = this.data.map((val, index) => {
      const x = (index / (this.data.length - 1)) * this.width;
      const y = this.height - (Math.min(100, Math.max(0, val)) / 100) * this.height;
      return `${x},${y}`;
    }).join(' L ');
    return `M ${points}`;
  }

  get fillPathD(): string {
    const pd = this.pathD;
    if (!pd) return '';
    return `${pd} L ${this.width},${this.height} L 0,${this.height} Z`;
  }

  shouldShowDataPoint(index: number): boolean {
    return index % 3 === 0 || index === this.data.length - 1 || index === 0;
  }

  getPointX(index: number): number {
    return (index / (this.data.length - 1)) * this.width;
  }

  getPointY(val: number): number {
    return this.height - (Math.min(100, Math.max(0, val)) / 100) * this.height;
  }
}
