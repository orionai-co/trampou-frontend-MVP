import { TestBed } from '@angular/core/testing';
import { OpportunityService } from '../../src/app/features/opportunities/services/opportunity.service';
import { Opportunity } from '../../src/app/features/opportunities/models/opportunity.model';

describe('OpportunityService', () => {
  let service: OpportunityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpportunityService]
    });
    service = TestBed.inject(OpportunityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return initial opportunities list', (done: DoneFn) => {
    service.getOpportunities().subscribe(list => {
      expect(list.length).toBeGreaterThanOrEqual(8);
      expect(list[0].id).toBeTruthy();
      done();
    });
  });

  it('should filter opportunities by category', (done: DoneFn) => {
    service.getOpportunities({ category: 'Eventos' }).subscribe(list => {
      expect(list.length).toBeGreaterThan(0);
      list.forEach(item => expect(item.category).toBe('Eventos'));
      done();
    });
  });

  it('should filter opportunities by text search query', (done: DoneFn) => {
    service.getOpportunities({ searchQuery: 'Garçom' }).subscribe(list => {
      expect(list.length).toBeGreaterThan(0);
      list.forEach(item => {
        const matches =
          item.title.toLowerCase().includes('garçom') ||
          item.description.toLowerCase().includes('garçom') ||
          item.category.toLowerCase().includes('garçom');
        expect(matches).toBeTrue();
      });
      done();
    });
  });

  it('should apply to an opportunity and update applied count', (done: DoneFn) => {
    service.getOpportunities().subscribe(list => {
      const firstId = list[0].id;
      service.applyToOpportunity(firstId).subscribe(res => {
        expect(res.success).toBeTrue();
        expect(service.isApplied(firstId)).toBeTrue();
        expect(service.appliedCount()).toBe(1);
        done();
      });
    });
  });
});
