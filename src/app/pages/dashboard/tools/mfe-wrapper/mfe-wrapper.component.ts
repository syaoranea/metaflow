import { Component, ElementRef, OnInit, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { AuthService } from '../../../../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-mfe-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: `<div #mfeContainer></div>`,
  styles: [`:host { display: block; width: 100%; height: 100%; }`]
})
export class MfeWrapperComponent implements OnInit {
  @ViewChild('mfeContainer', { read: ViewContainerRef, static: true })
  viewContainer!: ViewContainerRef;

  private authService = inject(AuthService);

  async ngOnInit() {
    try {
      // Obter o usuário atual
      const user = await this.authService.getUser();
      const currentUserId = user?.id || 'guest';

      console.log('Carregando NutriPlanner MFE para o usuário:', currentUserId);

      // Carregar o módulo remoto
      const m = await loadRemoteModule('nutri-planner', './Component');

      // Limpar o container antes de criar o novo componente
      this.viewContainer.clear();

      // Criar o componente no container
      // Nota: Dependendo de como o MFE expõe o componente, pode ser m.App, m.AppComponent, etc.
      // O snippet do usuário sugeriu m.App
      const componentRef = this.viewContainer.createComponent(m.App || m.AppComponent || m.default);
      
      // Passar o idUsuario como input
      componentRef.setInput('idUsuario', currentUserId);
      
      console.log('NutriPlanner MFE carregado com sucesso e idUsuario injetado.');
    } catch (err) {
      console.error('Erro ao carregar NutriPlanner MFE:', err);
    }
  }
}
