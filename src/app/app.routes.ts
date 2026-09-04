import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout';
import { OpportunitiesFeedComponent } from './features/opportunities/opportunities-feed.component';
import { MyJobsComponent } from './features/my-jobs/my-jobs.component';
import { ProfileComponent } from './features/profile/profile.component';
import { CompanyComponent } from './features/company/company.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { CompanyProfilePageComponent } from './features/company-profile/company-profile-page.component';
import { HomeTempComponent } from './features/home-temp/home-temp.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'oportunidades',
        pathMatch: 'full'
      },
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
      },
      {
        path: 'design-system',
        component: HomeTempComponent,
        title: 'Design System — TRAMPOU'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'oportunidades'
  }
];
