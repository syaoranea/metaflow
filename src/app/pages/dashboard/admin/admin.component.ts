import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GoalService, Goal } from '../../../services/goal.service';
import { ButtonComponent } from '../../../components/ui/button/button.component';

import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
    private goalService = inject(GoalService);
    private authService = inject(AuthService);
    private fb = inject(FormBuilder);

    goals = signal<Goal[]>([]);
    isLoading = signal(false);
    isModalOpen = signal(false);
    editingGoalSk = signal<string | null>(null);

    goalForm: FormGroup;

    constructor() {
        this.goalForm = this.fb.group({
            title: ['', [Validators.required]],
            description: [''],
            targetValue: [0, [Validators.required, Validators.min(1)]],
            status: ['ACTIVE']
        });
    }

    ngOnInit() {
        this.loadGoals();
    }

    async loadGoals() {
        this.isLoading.set(true);
        const gls = await this.goalService.getGoals();
        this.goals.set(gls);
        this.isLoading.set(false);
    }

    openModal(goal?: Goal) {
        if (goal) {
            this.editingGoalSk.set(goal.sk); // Usar SK como identificador
            this.goalForm.patchValue({
                title: goal.title,
                description: goal.description,
                targetValue: goal.targetValue,
                status: goal.status
            });
        } else {
            this.editingGoalSk.set(null);
            this.goalForm.reset({ status: 'ACTIVE', targetValue: 0 });
        }
        this.isModalOpen.set(true);
    }

    closeModal() {
        this.isModalOpen.set(false);
        this.editingGoalSk.set(null);
        this.goalForm.reset();
    }

    async onSubmit() {
        if (this.goalForm.invalid) return;

        this.isLoading.set(true);
        const formValue = this.goalForm.value;

        let result;
        if (this.editingGoalSk()) {
            // Se for edição, precisamos enviar o SK no payload também se o BFF exigir no corpo
            const dataWithSk = { ...formValue, sk: this.editingGoalSk() };
            result = await this.goalService.updateGoal(this.editingGoalSk()!, dataWithSk);
        } else {
            // Pegar o e-mail do usuário logado
            const user = await this.authService.getUser();
            const dataWithEmail = { ...formValue, email: user?.email };
            result = await this.goalService.createGoal(dataWithEmail);
        }

        if (result.success) {
            await this.loadGoals();
            this.closeModal();
        }
        this.isLoading.set(false);
    }

    async deleteGoal(sk: string) {
        if (confirm('Tem certeza que deseja excluir esta meta?')) {
            this.isLoading.set(true);
            const res = await this.goalService.deleteGoal(sk);
            if (res.success) {
                await this.loadGoals();
            }
            this.isLoading.set(false);
        }
    }
}
