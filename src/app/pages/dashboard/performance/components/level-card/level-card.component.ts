import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

const LEVEL_TITLES: Record<number, string> = {
  1: "Início",
  2: "Consistente",
  3: "Estruturado",
  4: "Disciplinado",
  5: "Alta Performance"
};

@Component({
  selector: 'app-level-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './level-card.component.html',
  styleUrl: './level-card.component.scss'
})
export class LevelCardComponent {
  @Input() level: number = 1;
  @Input() score: number = 0;

  get progressToNext(): number {
    return (this.score % 20) * 5;
  }

  get title(): string {
    return LEVEL_TITLES[this.level] || "Desconhecido";
  }

  get nextLevel(): number {
    return Math.min(5, this.level + 1);
  }
}
