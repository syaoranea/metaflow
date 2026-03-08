import { Component, inject, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { CommonModule } from '@angular/common';

enum Step {
  NAME = 0,
  EMAIL = 1,
  PASSWORD = 2,
  GOAL = 3,
  CONFIRM = 4,
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  StepEnum = Step;
  currentStep: Step = Step.NAME;

  registerForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    goal: ['', Validators.required]
  });

  goalSuggestions = [
    "Melhorar minha saúde",
    "Organizar minhas finanças",
    "Criar rotina consistente",
    "Evoluir profissionalmente",
  ];

  isLoading = false;
  errorMessage = '';

  @ViewChild('stepInput') stepInput!: ElementRef<HTMLInputElement>;

  // Focus trick after step changes
  ngAfterViewChecked() {
    if (this.stepInput && this.currentStep !== Step.CONFIRM) {
      if (document.activeElement !== this.stepInput.nativeElement) {
        this.stepInput.nativeElement.focus();
      }
    }
  }

  get passwordStrength() {
    const p = this.registerForm.get('password')?.value || '';
    if (!p) return { label: "", color: "bg-slate-200", level: 0 };
    if (p.length < 6) return { label: "Fraca", color: "bg-red-400", level: 1 };
    if (p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p)) {
      return { label: "Forte", color: "bg-emerald-500", level: 3 };
    }
    return { label: "Média", color: "bg-amber-400", level: 2 };
  }

  setGoal(g: string) {
    this.registerForm.patchValue({ goal: g });
  }

  handleNext() {
    this.errorMessage = '';

    // Step validation manually before advancing
    if (this.currentStep === Step.NAME && this.registerForm.get('name')?.invalid) {
      this.errorMessage = "Por favor, insira seu nome."; return;
    }
    if (this.currentStep === Step.EMAIL && this.registerForm.get('email')?.invalid) {
      this.errorMessage = "Email inválido."; return;
    }
    if (this.currentStep === Step.PASSWORD && this.registerForm.get('password')?.invalid) {
      this.errorMessage = "A senha deve ter pelo menos 6 caracteres."; return;
    }
    if (this.currentStep === Step.GOAL && this.registerForm.get('goal')?.invalid) {
      this.errorMessage = "Escolha ou digite uma meta inicial."; return;
    }

    if (this.currentStep < Step.CONFIRM) {
      this.currentStep++;
    } else {
      this.handleFinalSubmit();
    }
  }

  handleBack() {
    if (this.currentStep > Step.NAME) {
      this.currentStep--;
      this.errorMessage = '';
    }
  }

  async handleFinalSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const { name, email, goal } = this.registerForm.value;
      const res = await this.authService.register({ name, email, goal });

      setTimeout(() => {
        this.isLoading = false;
        if (res.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = res.error || "Erro no servidor.";
        }
      }, 1000); // UI Delight Delay
    } catch (err) {
      this.errorMessage = "Erro inesperado ao criar conta.";
      this.isLoading = false;
    }
  }
}
