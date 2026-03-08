import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-achievement-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './achievement-list.component.html',
  styleUrl: './achievement-list.component.scss'
})
export class AchievementListComponent {
  @Input() unlockedList: string[] = [];

  readonly ALL_MILESTONES = [
    { id: 'm1', title: 'Primeiro Hábito', desc: 'Registrou sua primeira vitória.' },
    { id: 'm2', title: '7 Dias Focados', desc: 'Fechou uma semana sem falhas.' },
    { id: 'm3', title: 'Pilar Consistente', desc: '30 dias consecutivos mantidos.' },
    { id: 'm4', title: '100 Execuções', desc: 'Paciência rende resultados.' },
    { id: 'm5', title: 'Alta Performance', desc: 'Score acima de 90 / Nível Max.' }
  ];

  isUnlocked(id: string): boolean {
    return this.unlockedList.includes(id);
  }
}
