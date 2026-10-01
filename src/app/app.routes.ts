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
        title: 'Entrar — TRAMPALI'
      },
      {
        path: 'tipo-conta',
        loadComponent: () => import('./features/auth/pages/account-type-selector/account-type-selector.component').then(m => m.AccountTypeSelectorComponent),
        title: 'Escolha seu Perfil — TRAMPALI'
      },
      {
        path: 'cadastro/profissional',
        loadComponent: () => import('./features/auth/pages/register-professional/register-professional.component').then(m => m.RegisterProfessionalComponent),
        title: 'Cadastro de Prestador — TRAMPALI'
      },
      {
        path: 'cadastro/empresa',
        loadComponent: () => import('./features/auth/pages/register-company/register-company.component').then(m => m.RegisterCompanyComponent),
        title: 'Cadastro de Empresa — TRAMPALI'
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
        title: 'Oportunidades — TRAMPALI'
      },
      {
        path: 'empresas/:id',
        component: CompanyProfilePageComponent,
        title: 'Perfil da Empresa — TRAMPALI'
      },
      {
        path: 'empresas',
        redirectTo: 'empresas/comp-001',
        pathMatch: 'full'
      },
      {
        path: 'meus-trabalhos',
        component: MyJobsComponent,
        title: 'Meus Trabalhos — TRAMPALI'
      },
      {
        path: 'perfil',
        component: ProfileComponent,
        title: 'Meu Perfil — TRAMPALI'
      },
      {
        path: 'empresa',
        component: CompanyComponent,
        title: 'Painel da Empresa — TRAMPALI'
      },
      {
        path: 'avisos',
        component: NotificationsComponent,
        title: 'Avisos & Lembretes — TRAMPALI'
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
