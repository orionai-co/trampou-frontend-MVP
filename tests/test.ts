import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Importação estática de todos os specs em tests/unit
import './unit/api-client.service.spec';
import './unit/app.component.spec';
import './unit/badge.component.spec';
import './unit/button.component.spec';
import './unit/card.component.spec';
import './unit/footer.component.spec';
import './unit/header.component.spec';
import './unit/main-layout.component.spec';
import './unit/mobile-nav.component.spec';
import './unit/opportunities-feed.component.spec';
import './unit/opportunity-card.component.spec';
import './unit/featured-company-card.component.spec';
import './unit/opportunity.service.spec';
import './unit/user-profile.service.spec';
import './unit/my-jobs.service.spec';
import './unit/job-status-item.component.spec';
import './unit/my-jobs.component.spec';
import './unit/opportunity-details-modal.component.spec';
import './unit/profile-header.component.spec';
import './unit/pix-settings.component.spec';
import './unit/skills-selector.component.spec';
import './unit/profile.component.spec';
import './unit/hero-banner.component.spec';
import './unit/company.service.spec';
import './unit/company-dashboard-header.component.spec';
import './unit/company-job-card.component.spec';
import './unit/create-job-modal.component.spec';
import './unit/candidate-selection-modal.component.spec';
import './unit/company.component.spec';
import './unit/shift-chat.service.spec';
import './unit/shift-chat-modal.component.spec';
import './unit/shift-chat-sidebar.component.spec';
import './unit/chat-contacts-list.component.spec';
import './unit/rating.service.spec';
import './unit/rating-modal.component.spec';
import './unit/pix-receipt-modal.component.spec';
import './unit/profile-career-progress.component.spec';
import './unit/profile-achievements.component.spec';
import './unit/candidate-profile-modal.component.spec';
import './unit/notifications.service.spec';
import './unit/notification-item.component.spec';
import './unit/notifications.component.spec';
import './unit/company-public.service.spec';
import './unit/company-public-header.component.spec';
import './unit/company-reputation-stats.component.spec';
import './unit/company-profile-page.component.spec';
import './unit/campaign.service.spec';
import './unit/boost-campaign-modal.component.spec';
import './unit/company-campaign-metrics.component.spec';
import './unit/match-breakdown.component.spec';
import './unit/cnpj.validator.spec';
import './unit/auth.service.spec';
import './unit/login.component.spec';
import './unit/register-professional.component.spec';
import './unit/register-company.component.spec';
