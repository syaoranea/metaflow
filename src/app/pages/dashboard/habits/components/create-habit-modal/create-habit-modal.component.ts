import { Component, EventEmitter, Input, Output, inject, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../../components/ui/button/button.component';

@Component({
  selector: 'app-create-habit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './create-habit-modal.component.html',
  styleUrl: './create-habit-modal.component.scss'
})
export class CreateHabitModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() goalsOptions: { id: string, title: string }[] = [];

  @Output() closeModal = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<{ title: string; goalId: string; frequency: string }>();

  private fb = inject(FormBuilder);

  habitForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    goalId: ['', Validators.required],
    frequency: ['daily']
  });

  isLoading = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']?.currentValue === true) {
      this.habitForm.reset({
        title: '',
        goalId: this.goalsOptions[0]?.id || '',
        frequency: 'daily'
      });
      this.isLoading = false;
    }
  }

  submit() {
    if (this.habitForm.invalid) return;

    this.isLoading = true;
    setTimeout(() => {
      this.onSave.emit(this.habitForm.value);
      this.isLoading = false;
      this.closeModal.emit();
    }, 600);
  }

  close() {
    this.closeModal.emit();
  }
}
