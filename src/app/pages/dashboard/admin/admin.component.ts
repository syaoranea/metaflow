import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Goal } from '../../../services/goal.service';
import { SuggestionService } from '../../../services/suggestion.service';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { ConfirmationModalComponent } from '../../../shared/components/modal/confirmation-modal/confirmation-modal.component';

import { AuthService, User } from '../../../services/auth.service';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonComponent, ConfirmationModalComponent],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
    private suggestionService = inject(SuggestionService);
    private authService = inject(AuthService);
    private fb = inject(FormBuilder);

    goals = signal<Goal[]>([]);
    isLoading = signal(false);
    isModalOpen = signal(false);
    isDeleteModalOpen = signal(false);
    editingGoalSk = signal<string | null>(null);
    goalToDeleteSk = signal<string | null>(null);
    currentUser = signal<User | null>(null);

    isLimitReached = computed(() => {
        const user = this.currentUser();
        if (!user) return false;
        return user.plan === 'FREE' && this.goals().length >= 2;
    });

    goalForm: FormGroup;

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

    constructor() {
        this.goalForm = this.fb.group({
            title: ['', [Validators.required]],
            description: [''],
            category: ['Finanças', [Validators.required]],
            deadline: [''],
            status: ['ACTIVE'],
            progress: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
        });
    }

    async ngOnInit() {
        this.authService.currentUser$.subscribe(u => this.currentUser.set(u));
        if (!this.currentUser()) {
            await this.authService.getUser();
        }
        this.loadGoals();
    }

    async loadGoals() {
        this.isLoading.set(true);
        const gls = await this.suggestionService.getSuggestions();
        this.goals.set(gls);
        this.isLoading.set(false);
    }

    openModal(goal?: Goal) {
        if (goal) {
            this.editingGoalSk.set(goal.sk); // Usar SK como identificador
            this.goalForm.patchValue({
                title: goal.title,
                description: goal.description || '',
                category: goal.category || 'Finanças',
                deadline: goal.deadline || '',
                status: goal.status || 'ACTIVE',
                progress: goal.progress
            });
        } else {
            this.editingGoalSk.set(null);
            this.goalForm.reset({
                title: '',
                description: '',
                category: 'Finanças',
                deadline: '',
                status: 'ACTIVE',
                progress: 0
            });
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
            result = await this.suggestionService.updateSuggestion(this.editingGoalSk()!, dataWithSk);
        } else {
            // Pegar o e-mail do usuário logado
            const user = await this.authService.getUser();
            const dataWithEmail = { ...formValue, email: user?.email };
            result = await this.suggestionService.createSuggestion(dataWithEmail);
        }

        if (result.success) {
            await this.loadGoals();
            this.closeModal();
        }
        this.isLoading.set(false);
    }

    deleteGoal(sk: string) {
        this.goalToDeleteSk.set(sk);
        this.isDeleteModalOpen.set(true);
    }

    async onConfirmDelete() {
        const sk = this.goalToDeleteSk();
        if (!sk) return;

        this.isLoading.set(true);
        try {
            const res = await this.suggestionService.deleteSuggestion(sk);
            if (res.success) {
                await this.loadGoals();
                this.isDeleteModalOpen.set(false);
                this.goalToDeleteSk.set(null);
            }
        } catch (err) {
            alert("Erro ao excluir meta: " + err);
        } finally {
            this.isLoading.set(false);
        }
    }

    onCancelDelete() {
        this.isDeleteModalOpen.set(false);
        this.goalToDeleteSk.set(null);
    }
}
