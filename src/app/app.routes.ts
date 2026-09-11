import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout';
import { OpportunitiesFeedComponent } from './features/opportunities/opportunities-feed.component';
import { MyJobsComponent } from './features/my-jobs/my-jobs.component';
import { ProfileComponent } from './features/profile/profile.component';
import { CompanyComponent } from './features/company/company.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { CompanyProfilePageComponent } from './features/company-profile/company-profile-page.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login'
  },
  {
    path: 'auth',
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent),
        title: 'Entrar — TRAMPOU'
      },
      {
        path: 'tipo-conta',
        loadComponent: () => import('./features/auth/pages/account-type-selector/account-type-selector.component').then(m => m.AccountTypeSelectorComponent),
        title: 'Escolha seu Perfil — TRAMPOU'
      },
      {
        path: 'cadastro/profissional',
        loadComponent: () => import('./features/auth/pages/register-professional/register-professional.component').then(m => m.RegisterProfessionalComponent),
        title: 'Cadastro de Prestador — TRAMPOU'
      },
      {
        path: 'cadastro/empresa',
        loadComponent: () => import('./features/auth/pages/register-company/register-company.component').then(m => m.RegisterCompanyComponent),
        title: 'Cadastro de Empresa — TRAMPOU'
      }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'oportunidades',
        component: OpportunitiesFeedComponent,
        title: 'Oportunidades — TRAMPOU'
      },
      {
        path: 'empresas/:id',
        component: CompanyProfilePageComponent,
        title: 'Perfil da Empresa — TRAMPOU'
      },
      {
        path: 'empresas',
        redirectTo: 'empresas/comp-001',
        pathMatch: 'full'
      },
      {
        path: 'meus-trabalhos',
        component: MyJobsComponent,
        title: 'Meus Trabalhos — TRAMPOU'
      },
      {
        path: 'perfil',
        component: ProfileComponent,
        title: 'Meu Perfil — TRAMPOU'
      },
      {
        path: 'empresa',
        component: CompanyComponent,
        title: 'Painel da Empresa — TRAMPOU'
      },
      {
        path: 'avisos',
        component: NotificationsComponent,
        title: 'Avisos & Lembretes — TRAMPOU'
      },
      {
        path: 'notificacoes',
        redirectTo: 'avisos',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
