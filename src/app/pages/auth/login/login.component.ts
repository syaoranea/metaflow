import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ButtonComponent } from '../../../components/ui/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMessage = '';

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Preencha todos os campos corretamente.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    try {
      const { email } = this.loginForm.value;
      const res = await this.authService.login(email);

      if (res.success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = res.error || 'Erro no login.';
      }
    } catch (err) {
      this.errorMessage = 'Ocorreu um erro ao processar sua requisição.';
    } finally {
      this.isLoading = false;
    }
  }
}
