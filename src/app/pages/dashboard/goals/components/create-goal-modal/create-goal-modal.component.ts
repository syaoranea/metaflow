import { Component, EventEmitter, Input, Output, inject, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../../components/ui/button/button.component';

@Component({
  selector: 'app-create-goal-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './create-goal-modal.component.html',
  styleUrl: './create-goal-modal.component.scss'
})
export class CreateGoalModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;

  @Output() closeModal = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<{ title: string; description: string; deadline?: string; isPrimary: boolean }>();

  private fb = inject(FormBuilder);

  goalForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    deadline: [''],
    isPrimary: [false]
  });

  isLoading = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']?.currentValue === true) {
      this.goalForm.reset({
        title: '',
        description: '',
        deadline: '',
        isPrimary: false
      });
      this.isLoading = false;
    }
  }

  submit() {
    if (this.goalForm.invalid) return;

    this.isLoading = true;
    setTimeout(() => {
      this.onSave.emit(this.goalForm.value);
      this.isLoading = false;
      this.closeModal.emit();
    }, 600);
  }

  close() {
    this.closeModal.emit();
  }
}
