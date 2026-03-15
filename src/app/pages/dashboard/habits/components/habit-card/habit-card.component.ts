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
  @Output() onClick = new EventEmitter<string>();

  isRecording = false;

  get frequencyLabel() {
    switch (this.habit?.frequency) {
      case 1: return 'Diário';
      case 2: return 'Semanal';
      case 3: return 'Mensal';
      case 4: return 'Personalizado';
      default: return 'Personalizado';
    }
  }

  record() {
    console.log('HabitCard: record() called for', this.habit?.id);
    if (this.isRecording || this.habit?.completedToday) {
      console.log('HabitCard: already recording or completed, skipping');
      return;
    }

    this.isRecording = true;
    console.log('HabitCard: emitting onRecord for', this.habit?.id);
    this.onRecord.emit(this.habit?.id);
  }
}
