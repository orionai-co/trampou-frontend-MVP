import { Injectable, signal, inject } from '@angular/core';
import { Observable, of, delay, map, from, firstValueFrom } from 'rxjs';
import {
  CompanyPublicProfile,
  MOCK_COMPANY_PUBLIC_PROFILES
} from '../models/company-profile.model';
import { Opportunity } from '../../opportunities/models/opportunity.model';
import { OpportunityService } from '../../opportunities/services/opportunity.service';
import { ApiClientService } from '../../../core/services/api-client.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyPublicService {
  private opportunityService = inject(OpportunityService);
  private apiClient = inject(ApiClientService);

  private companiesState = signal<CompanyPublicProfile[]>(MOCK_COMPANY_PUBLIC_PROFILES);
  private favoritedCompanyIds = signal<Set<string>>(new Set<string>());
  private followedCompanyIds = signal<Set<string>>(new Set<string>());

  readonly companies = this.companiesState.asReadonly();

  async fetchCompanyProfileById(id: string): Promise<CompanyPublicProfile> {
    if (environment.useMock) {
      const company = this.companiesState().find(c => c.id === id) || this.companiesState()[0];
      return Promise.resolve(company);
    }
    return this.apiClient.get<CompanyPublicProfile>(API_ENDPOINTS.COMPANIES.PUBLIC_PROFILE(id));
  }

  async fetchFeaturedCompanies(): Promise<CompanyPublicProfile[]> {
    if (environment.useMock) {
      return Promise.resolve(this.companiesState());
    }
    return this.apiClient.get<CompanyPublicProfile[]>(API_ENDPOINTS.COMPANIES.FEATURED);
  }

  async fetchOpenJobs(companyId: string): Promise<Opportunity[]> {
    if (environment.useMock) {
      return firstValueFrom(this.getOpenJobsByCompanyId(companyId));
    }
    return this.apiClient.get<Opportunity[]>(API_ENDPOINTS.COMPANIES.OPEN_JOBS(companyId));
  }

  getCompanyProfileById(idOrSlug: string): Observable<CompanyPublicProfile | undefined> {
    if (!environment.useMock) {
      return from(this.apiClient.get<CompanyPublicProfile>(API_ENDPOINTS.COMPANIES.PUBLIC_PROFILE(idOrSlug)));
    }
    const list = this.companiesState();
    const query = idOrSlug.toLowerCase().trim();

    const company = list.find(c => {
      if (c.id.toLowerCase() === query) return true;
      if (c.handle.toLowerCase().replace('@', '') === query.replace('@', '')) return true;
      const slug = c.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      return slug === query;
    });

    if (!company) {
      // Fallback para o primeiro registro do mock se ID não encontrado
      const fallback = list[0];
      return of(fallback).pipe(delay(150));
    }

    const isFav = this.favoritedCompanyIds().has(company.id);
    const isFoll = this.followedCompanyIds().has(company.id);

    return of({
      ...company,
      isFavorited: isFav,
      isFollowing: isFoll
    }).pipe(delay(150));
  }

  toggleFavoriteCompany(companyId: string): void {
    this.favoritedCompanyIds.update(set => {
      const next = new Set(set);
      if (next.has(companyId)) {
        next.delete(companyId);
      } else {
        next.add(companyId);
      }
      return next;
    });
  }

  toggleFollowCompany(companyId: string): void {
    this.followedCompanyIds.update(set => {
      const next = new Set(set);
      if (next.has(companyId)) {
        next.delete(companyId);
      } else {
        next.add(companyId);
      }
      return next;
    });
  }

  isFavorited(companyId: string): boolean {
    return this.favoritedCompanyIds().has(companyId);
  }

  isFollowing(companyId: string): boolean {
    return this.followedCompanyIds().has(companyId);
  }

  getOpenJobsByCompanyId(companyId: string, companyName?: string): Observable<Opportunity[]> {
    return this.opportunityService.getOpportunities().pipe(
      map(jobs => {
        if (!companyName) {
          const comp = this.companiesState().find(c => c.id === companyId);
          companyName = comp?.name;
        }
        if (!companyName) {
          return jobs.slice(0, 3);
        }
        const nameQuery = companyName.toLowerCase();
        const filtered = jobs.filter(j => j.companyName.toLowerCase().includes(nameQuery));
        return filtered.length > 0 ? filtered : jobs.slice(0, 2);
      })
    );
  }
}
