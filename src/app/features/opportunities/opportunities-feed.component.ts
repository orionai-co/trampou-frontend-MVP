import { Component, OnInit, signal, ChangeDetectionStrategy, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Opportunity, OpportunityFilters } from './models/opportunity.model';
import { FeaturedCompany } from '../../core/models/sponsored-content.model';
import { MatchBreakdownData } from '../../core/models/match-breakdown.model';
import { OpportunityService } from './services/opportunity.service';
import { MyJobsService } from '../my-jobs/services/my-jobs.service';
import { OpportunityCardComponent } from './components/opportunity-card/opportunity-card.component';
import { FeaturedCompanyCardComponent } from './components/featured-company-card/featured-company-card.component';
import { OpportunityFiltersComponent } from './components/opportunity-filters/opportunity-filters.component';
import { OpportunityDetailsModalComponent } from './components/opportunity-details-modal/opportunity-details-modal.component';
import { MatchBreakdownComponent } from './components/match-breakdown/match-breakdown.component';
import { HeroBannerComponent } from './components/hero-banner/hero-banner.component';
import {
  TpButtonComponent,
  TpIconComponent,
  TpSpinnerComponent
} from '../../shared/components';

export type FeedTimelineTab = 'for_you' | 'urgent' | 'closest';

@Component({
  selector: 'app-opportunities-feed',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    OpportunityCardComponent,
    FeaturedCompanyCardComponent,
    OpportunityFiltersComponent,
    OpportunityDetailsModalComponent,
    MatchBreakdownComponent,
    HeroBannerComponent,
    TpButtonComponent,
    TpIconComponent,
    TpSpinnerComponent
  ],
  templateUrl: './opportunities-feed.component.html',
  styleUrl: './opportunities-feed.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpportunitiesFeedComponent implements OnInit {
  readonly opportunityService = inject(OpportunityService);
  readonly myJobsService = inject(MyJobsService);
  readonly router = inject(Router);

  opportunities = signal<Opportunity[]>([]);
  isLoading = signal<boolean>(true);
  activeTab = signal<FeedTimelineTab>('for_you');

  filters = signal<OpportunityFilters>({
    category: 'Todas',
    searchQuery: '',
    sortBy: 'highest_match',
    onlyTodayOrUrgent: false
  });

  selectedOpportunity = signal<Opportunity | null>(null);
  isModalOpen = signal<boolean>(false);
  lastAppliedTitle = signal<string | null>(null);

  readonly selectedMatchData = signal<MatchBreakdownData | null>(null);

  quickCategories = [
    'Todas',
    'Eventos',
    'Gastronomia',
    'Atendimento',
    'Logística',
    'Operacional'
  ];

  urgentCount = computed(() => {
    return this.opportunityService.opportunities().filter(o => o.isToday || o.status === 'urgency').length;
  });

  readonly featuredCompany = computed<FeaturedCompany | null>(() => {
    const list = this.opportunityService.featuredCompanies();
    return list.length > 0 ? list[0] : null;
  });

  onExploreCompany(company: FeaturedCompany): void {
    this.router.navigate(['/empresas', company.companyId]);
  }

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('trampou:boost-updated', () => {
        this.opportunityService.loadStoredBoostCampaigns();
      });
    }

    effect(() => {
      const q = this.opportunityService.searchQuery();
      if (this.filters().searchQuery !== q) {
        this.filters.update(curr => ({ ...curr, searchQuery: q }));
        this.loadOpportunities();
      }
    });
  }

  ngOnInit(): void {
    this.opportunityService.loadStoredBoostCampaigns();
    this.loadOpportunities();
    this.opportunityService.fetchFeaturedCompanies();
  }

  loadOpportunities(): void {
    this.isLoading.set(true);
    this.opportunityService.getOpportunities(this.filters()).subscribe(list => {
      this.opportunities.set(list);
      this.isLoading.set(false);
    });
  }

  onSelectTab(tab: FeedTimelineTab): void {
    this.activeTab.set(tab);

    let nextFilters: OpportunityFilters = { ...this.filters() };

    switch (tab) {
      case 'for_you':
        nextFilters = {
          ...nextFilters,
          sortBy: 'highest_match',
          onlyTodayOrUrgent: false,
          maxDistanceKm: undefined,
          category: 'Todas'
        };
        break;
      case 'urgent':
        nextFilters = {
          ...nextFilters,
          onlyTodayOrUrgent: true,
          sortBy: 'highest_match'
        };
        break;
      case 'closest':
        nextFilters = {
          ...nextFilters,
          sortBy: 'closest',
          onlyTodayOrUrgent: false
        };
        break;
    }

    this.filters.set(nextFilters);
    this.loadOpportunities();
  }

  onSearchChange(query: string): void {
    this.filters.update(curr => ({ ...curr, searchQuery: query }));
    this.loadOpportunities();
  }

  onSelectCategory(category: any): void {
    this.filters.update(curr => ({ ...curr, category }));
    this.loadOpportunities();
  }

  onFiltersChange(newFilters: OpportunityFilters): void {
    this.filters.set(newFilters);
    this.loadOpportunities();
  }

  hasActiveSecondaryFilters(): boolean {
    const f = this.filters();
    return !!(
      (f.category && f.category !== 'Todas') ||
      (f.maxDistanceKm && f.maxDistanceKm > 0) ||
      (f.searchQuery && f.searchQuery.trim() !== '')
    );
  }

  openDetails(opp: Opportunity): void {
    this.selectedOpportunity.set(opp);
    this.isModalOpen.set(true);
  }

  closeDetails(): void {
    this.isModalOpen.set(false);
    this.selectedOpportunity.set(null);
  }

  openMatchModal(data: MatchBreakdownData): void {
    this.selectedMatchData.set(data);
  }

  closeMatchModal(): void {
    this.selectedMatchData.set(null);
  }

  handleApplyFromModal(opp: Opportunity): void {
    this.lastAppliedTitle.set(opp.title);

    // Sincroniza e persiste a candidatura com MyJobsService e backend
    this.opportunityService.submitApplication(opp.id, opp).catch(() => {});
    this.loadOpportunities();

    setTimeout(() => {
      this.lastAppliedTitle.set(null);
    }, 6000);
  }

  dismissSuccessBanner(): void {
    this.lastAppliedTitle.set(null);
  }

  resetAllFilters(): void {
    this.filters.set({
      category: 'Todas',
      maxDistanceKm: undefined,
      searchQuery: '',
      sortBy: 'highest_match',
      onlyTodayOrUrgent: false
    });
    this.opportunityService.setSearchQuery('');
    this.activeTab.set('for_you');
    this.loadOpportunities();
  }

  trackByOppId(index: number, opp: Opportunity): string {
    return opp.id;
  }
}
