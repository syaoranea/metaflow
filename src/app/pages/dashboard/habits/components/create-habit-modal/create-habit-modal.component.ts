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
  @Output() onSave = new EventEmitter<{ id?: string, title: string; description?: string; goalId: string; frequency: number }>();
  @Output() onDelete = new EventEmitter<string>();

  @Input() habitToEdit: any = null;

  private fb = inject(FormBuilder);

  habitForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    goalId: ['', Validators.required],
    frequency: [1]
  });

  isLoading = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']?.currentValue === true) {
      if (this.habitToEdit) {
        this.habitForm.patchValue({
          title: this.habitToEdit.title,
          description: this.habitToEdit.description || '',
          goalId: this.habitToEdit.pk || this.habitToEdit.goalId || '',
          frequency: this.habitToEdit.frequency
        });
      } else {
        this.habitForm.reset({
          title: '',
          description: '',
          goalId: this.goalsOptions[0]?.id || '',
          frequency: 1
        });
      }
      this.isLoading = false;
    }
  }

  submit() {
    if (this.habitForm.invalid) return;

    this.isLoading = true;
    const formValue = this.habitForm.value;
    this.onSave.emit({
      id: this.habitToEdit?.sk || this.habitToEdit?.id,
      ...formValue,
      frequency: Number(formValue.frequency)
    });
    // Loading state will be handled by parent or reset in ngOnChanges next time
  }

  delete() {
    if (!this.habitToEdit) return;
    const habitId = this.habitToEdit.sk || this.habitToEdit.id;
    if (habitId) {
      this.onDelete.emit(habitId);
    }
  }

  close() {
    this.closeModal.emit();
  }
}
