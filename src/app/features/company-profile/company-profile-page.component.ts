import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CompanyPublicService } from './services/company-public.service';
import { CompanyPublicProfile } from './models/company-profile.model';
import { Opportunity } from '../opportunities/models/opportunity.model';
import { MyJobsService } from '../my-jobs/services/my-jobs.service';
import { CompanyPublicHeaderComponent } from './components/company-public-header/company-public-header.component';
import { CompanyReputationStatsComponent } from './components/company-reputation-stats/company-reputation-stats.component';
import { CompanyMediaGalleryComponent } from './components/company-media-gallery/company-media-gallery.component';
import { CompanyOpenJobsComponent } from './components/company-open-jobs/company-open-jobs.component';
import { OpportunityDetailsModalComponent } from '../opportunities/components/opportunity-details-modal/opportunity-details-modal.component';
import { TpIconComponent, TpButtonComponent, TpSpinnerComponent } from '../../shared/components';

@Component({
  selector: 'tp-company-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CompanyPublicHeaderComponent,
    CompanyReputationStatsComponent,
    CompanyMediaGalleryComponent,
    CompanyOpenJobsComponent,
    OpportunityDetailsModalComponent,
    TpIconComponent,
    TpSpinnerComponent
  ],
  templateUrl: './company-profile-page.component.html',
  styleUrl: './company-profile-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyProfilePageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly companyPublicService = inject(CompanyPublicService);
  readonly myJobsService = inject(MyJobsService);

  company = signal<CompanyPublicProfile | null>(null);
  openJobs = signal<Opportunity[]>([]);
  isLoading = signal<boolean>(true);

  isFavorited = signal<boolean>(false);
  isFollowing = signal<boolean>(false);

  selectedOpportunity = signal<Opportunity | null>(null);
  isModalOpen = signal<boolean>(false);
  lastAppliedTitle = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const companyId = params.get('id') || 'comp-001';
      this.loadCompanyData(companyId);
    });
  }

  loadCompanyData(id: string): void {
    this.isLoading.set(true);

    this.companyPublicService.getCompanyProfileById(id).subscribe(profile => {
      if (profile) {
        this.company.set(profile);
        this.isFavorited.set(!!profile.isFavorited);
        this.isFollowing.set(!!profile.isFollowing);

        this.companyPublicService.getOpenJobsByCompanyId(profile.id, profile.name).subscribe(jobs => {
          this.openJobs.set(jobs);
          this.isLoading.set(false);
        });
      } else {
        this.isLoading.set(false);
      }
    });
  }

  onToggleFavorite(): void {
    const comp = this.company();
    if (!comp) return;
    this.companyPublicService.toggleFavoriteCompany(comp.id);
    this.isFavorited.update(v => !v);
  }

  onToggleFollow(): void {
    const comp = this.company();
    if (!comp) return;
    this.companyPublicService.toggleFollowCompany(comp.id);
    this.isFollowing.update(v => !v);
  }

  openJobDetails(opp: Opportunity): void {
    this.selectedOpportunity.set(opp);
    this.isModalOpen.set(true);
  }

  closeJobDetails(): void {
    this.isModalOpen.set(false);
    this.selectedOpportunity.set(null);
  }

  handleApplyFromModal(opp: Opportunity): void {
    this.lastAppliedTitle.set(opp.title);
    this.closeJobDetails();

    this.myJobsService.addPendingApplication({
      opportunityId: opp.id,
      title: opp.title,
      companyName: opp.companyName,
      category: opp.category,
      location: {
        city: opp.location.city,
        neighborhood: opp.location.neighborhood,
        address: opp.location.address || `${opp.location.neighborhood}, ${opp.location.city}`,
        distanceKm: opp.location.distanceKm
      },
      date: opp.date,
      isToday: opp.isToday,
      schedule: opp.schedule,
      payment: opp.payment
    });

    setTimeout(() => {
      this.lastAppliedTitle.set(null);
    }, 6000);
  }

  dismissSuccessBanner(): void {
    this.lastAppliedTitle.set(null);
  }

  goBack(): void {
    this.router.navigate(['/oportunidades']);
  }
}
