import { Injectable, signal, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { CompanyPublicProfile } from '../models/company-profile.model';
import { Opportunity } from '../../opportunities/models/opportunity.model';
import { ApiClientService } from '../../../core/services/api-client.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class CompanyPublicService {
  private apiClient = inject(ApiClientService);

  private companiesState = signal<CompanyPublicProfile[]>([]);
  private favoritedCompanyIds = signal<Set<string>>(new Set<string>());
  private followedCompanyIds = signal<Set<string>>(new Set<string>());
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly companies = this.companiesState.asReadonly();

  async fetchCompanyProfileById(idOrSlug: string): Promise<CompanyPublicProfile> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const profile = await this.apiClient.get<CompanyPublicProfile>(API_ENDPOINTS.COMPANIES.PUBLIC_PROFILE(idOrSlug));
      if (profile) {
        this.companiesState.update(list => {
          const index = list.findIndex(c => c.id === profile.id);
          if (index >= 0) {
            const next = [...list];
            next[index] = profile;
            return next;
          }
          return [...list, profile];
        });
      }
      return profile;
    } catch (error: any) {
      const msg = error?.message || 'Erro ao carregar perfil da empresa.';
      this.errorMessage.set(msg);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async fetchFeaturedCompanies(): Promise<CompanyPublicProfile[]> {
    try {
      const list = await this.apiClient.get<CompanyPublicProfile[]>(API_ENDPOINTS.COMPANIES.FEATURED);
      this.companiesState.set(list || []);
      return list || [];
    } catch (error) {
      return [];
    }
  }

  async fetchOpenJobs(companyId: string): Promise<Opportunity[]> {
    try {
      return await this.apiClient.get<Opportunity[]>(API_ENDPOINTS.COMPANIES.OPEN_JOBS(companyId));
    } catch (error) {
      return [];
    }
  }

  getCompanyProfileById(idOrSlug: string): Observable<CompanyPublicProfile | undefined> {
    return from(this.fetchCompanyProfileById(idOrSlug));
  }

  async toggleFavoriteCompany(companyId: string): Promise<void> {
    const isFav = this.favoritedCompanyIds().has(companyId);
    this.favoritedCompanyIds.update(set => {
      const next = new Set(set);
      if (isFav) {
        next.delete(companyId);
      } else {
        next.add(companyId);
      }
      return next;
    });

    try {
      await this.apiClient.put(API_ENDPOINTS.COMPANIES.FAVORITE(companyId));
    } catch (err) {
      // Reverter estado local em caso de falha de rede
      this.favoritedCompanyIds.update(set => {
        const next = new Set(set);
        if (isFav) {
          next.add(companyId);
        } else {
          next.delete(companyId);
        }
        return next;
      });
    }
  }

  async toggleFollowCompany(companyId: string): Promise<void> {
    const isFoll = this.followedCompanyIds().has(companyId);
    this.followedCompanyIds.update(set => {
      const next = new Set(set);
      if (isFoll) {
        next.delete(companyId);
      } else {
        next.add(companyId);
      }
      return next;
    });

    try {
      await this.apiClient.put(API_ENDPOINTS.COMPANIES.FOLLOW(companyId));
    } catch (err) {
      // Reverter estado local em caso de falha de rede
      this.followedCompanyIds.update(set => {
        const next = new Set(set);
        if (isFoll) {
          next.add(companyId);
        } else {
          next.delete(companyId);
        }
        return next;
      });
    }
  }

  isFavorited(companyId: string): boolean {
    return this.favoritedCompanyIds().has(companyId);
  }

  isFollowing(companyId: string): boolean {
    return this.followedCompanyIds().has(companyId);
  }

  getOpenJobsByCompanyId(companyId: string, _companyName?: string): Observable<Opportunity[]> {
    return from(this.fetchOpenJobs(companyId));
  }
}
