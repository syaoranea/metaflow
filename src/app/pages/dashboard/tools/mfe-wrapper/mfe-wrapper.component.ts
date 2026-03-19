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
      let m: any;
      try {
        // Tentar via loadRemoteModule (formato padrão do Native Federation)
        m = await (loadRemoteModule as any)({
          type: 'module',
          remoteEntry: 'https://nutri-planer.vercel.app/remoteEntry.js',
          exposedModule: './Component'
        });
      } catch (err) {
        console.warn('loadRemoteModule falhou (provavelmente erro de JSON no servidor). Usando fallback de importação direta.', err);
        // Fallback: Importação direta via ESM (o nutri-planer exporta get/init como ESM)
        const module = await (new Function(`return import('https://nutri-planer.vercel.app/remoteEntry.js')`))();
        
        // Se for um container de Module Federation (tem get/init)
        if (module && module.get && module.init) {
          await module.init((globalThis as any).__share_scopes__?.default || {});
          const factory = await module.get('./Component');
          m = factory();
        } else {
          m = module;
        }
      }

      // Limpar o container antes de criar o novo componente
      this.viewContainer.clear();

      // Identificar o componente (App, AppComponent, or Default)
      const component = m.App || m.AppComponent || m.default || m;
      
      console.log('Componente identificado:', component);
      
      const componentRef = this.viewContainer.createComponent(component);
      
      // Passar o userId como input
      componentRef.setInput('userId', currentUserId);
      
      console.log('NutriPlanner MFE carregado com sucesso.');
    } catch (err) {
      console.error('Erro ao carregar NutriPlanner MFE:', err);
    }
  }
}
