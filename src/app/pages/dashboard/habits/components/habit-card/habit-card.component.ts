import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../../components/ui/button/button.component';

@Component({
  selector: 'app-habit-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './habit-card.component.html',
  styleUrl: './habit-card.component.scss'
})
export class HabitCardComponent {
  @Input() habit!: any; // Expecting the parsed habit from HabitsComponent
  @Output() onRecord = new EventEmitter<string>();

  get frequencyLabel() {
    switch (this.habit?.frequencyStr) {
      case 'daily': return 'Diário';
      case 'weekly': return 'Semanal';
      default: return 'Personalizado';
    }
  }

  record() {
    if (!this.habit?.completedToday) {
      this.onRecord.emit(this.habit?.id);
    }
  }
}
