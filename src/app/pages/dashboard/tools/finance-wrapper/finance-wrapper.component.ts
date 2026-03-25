import { Component, OnInit, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-finance-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: `<div #container></div>`,
  styles: [`:host { display: block; width: 100%; height: 100%; }`]
})
export class FinanceWrapperComponent implements OnInit {
  @ViewChild('container', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;

  private authService = inject(AuthService);

  async ngOnInit() {
    try {
      const user = await this.authService.getUser();
      const currentUserId = user?.id || '142ee1e5-52bf-4e85-84ed-cb6cdc686c9b';

      console.log('Carregando Controle Financeiro MFE para o usuário:', currentUserId);

      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      let remoteEntryUrl = 'https://controle-financeiro-azure-psi.vercel.app/remoteEntry.json';

      if (isLocal) {
        try {
          const response = await fetch('http://localhost:4204/remoteEntry.json', { method: 'HEAD' });
          if (response.ok) {
            remoteEntryUrl = 'http://localhost:4204/remoteEntry.json';
          }
        } catch (e) {
          console.warn('MFE Controle Financeiro local (4204) indisponível. Usando versão de produção.');
        }
      }

      console.log(`Usando remote entry: ${remoteEntryUrl}`);

      const m = await (loadRemoteModule as any)({
        type: 'module',
        remoteEntry: remoteEntryUrl,
        exposedModule: './Component'
      });

      this.container.clear();
      const component = m.AppComponent || m.default || m;
      const componentRef = this.container.createComponent(component as any);
      componentRef.setInput('userId', currentUserId);

      console.log('Controle Financeiro MFE carregado com sucesso.');
    } catch (err) {
      console.error('Erro ao carregar Controle Financeiro MFE:', err);
    }
  }
}
