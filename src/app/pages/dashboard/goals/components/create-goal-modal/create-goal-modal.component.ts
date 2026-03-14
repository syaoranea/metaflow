import { Component, EventEmitter, Input, Output, inject, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../../components/ui/button/button.component';
import { Goal } from '../../../../../services/goal.service';

export interface GoalFormData {
  title: string;
  progress: number;
  category: string;
  deadline?: string;
  description?: string;
  sk?: string;
}

@Component({
  selector: 'app-create-goal-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './create-goal-modal.component.html',
  styleUrl: './create-goal-modal.component.scss'
})
export class CreateGoalModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() goalToEdit: Goal | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<GoalFormData>();
  @Output() onDelete = new EventEmitter<string>();

  private fb = inject(FormBuilder);

  categories = [
    'Finanças',
    'Saúde & Bem-estar',
    'Carreira & Profissional',
    'Educação & Estudos',
    'Relacionamentos',
    'Lazer & Viagens',
    'Desenvolvimento Pessoal',
    'Espiritualidade',
    'Projetos Criativos',
    'Contribuição & Social'
  ];

  goalForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    category: ['Finanças', Validators.required],
    deadline: [''],
    description: [''],
    progress: [0]
  });

  isLoading = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']?.currentValue === true) {
      if (this.goalToEdit) {
        this.goalForm.patchValue({
          title: this.goalToEdit.title,
          category: this.goalToEdit.category || 'Finanças',
          deadline: this.goalToEdit.deadline || '',
          description: this.goalToEdit.description || '',
          progress: this.goalToEdit.progress
        });
      } else {
        this.goalForm.reset({
          title: '',
          category: 'Finanças',
          deadline: '',
          description: '',
          progress: 0
        });
      }
      this.isLoading = false;
    }
  }

  submit() {
    if (this.goalForm.invalid) return;

    this.isLoading = true;
    const formData = { ...this.goalForm.value };
    if (this.goalToEdit) {
      formData.sk = this.goalToEdit.sk;
    }

    setTimeout(() => {
      this.onSave.emit(formData);
      this.isLoading = false;
      this.close();
    }, 600);
  }

  delete() {
    if (this.goalToEdit) {
      this.onDelete.emit(this.goalToEdit.sk);
      this.close();
    }
  }

  close() {
    this.closeModal.emit();
  }
}
