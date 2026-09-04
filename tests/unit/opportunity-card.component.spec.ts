import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpportunityCardComponent } from '../../src/app/features/opportunities/components/opportunity-card/opportunity-card.component';
import { Opportunity } from '../../src/app/features/opportunities/models/opportunity.model';

describe('OpportunityCardComponent', () => {
  let component: OpportunityCardComponent;
  let fixture: ComponentFixture<OpportunityCardComponent>;

  const mockOpp: Opportunity = {
    id: 'test-01',
    title: 'Garçom para Casamento',
    companyName: 'Buffet Paulista',
    companyRating: 4.9,
    category: 'Eventos',
    location: {
      city: 'São Paulo',
      neighborhood: 'Vila Olímpia',
      distanceKm: 2.5
    },
    date: 'Hoje',
    isToday: true,
    schedule: {
      start: '18:00',
      end: '01:00',
      totalHours: 7
    },
    payment: {
      amount: 180,
      type: 'diaria',
      pixImmediate: true
    },
    requiredLevel: 2,
    matchPercentage: 98,
    status: 'urgency',
    spotsAvailable: 2,
    spotsTotal: 5,
    description: 'Atendimento de convidados em evento social.',
    requirements: ['Camisa branca', 'Experiência']
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpportunityCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(OpportunityCardComponent);
    component = fixture.componentInstance;
    component.opportunity = mockOpp;
    fixture.detectChanges();
  });

  it('should create the OpportunityCardComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render opportunity title and company name', () => {
    const textContent = fixture.nativeElement.textContent;
    expect(textContent).toContain('Garçom para Casamento');
    expect(textContent).toContain('Buffet Paulista');
  });

  it('should render currency value and payment type correctly', () => {
    const textContent = fixture.nativeElement.textContent;
    expect(textContent).toContain('180');
    expect(textContent).toContain('/ diaria');
  });

  it('should render match percentage and urgency badge', () => {
    const textContent = fixture.nativeElement.textContent;
    expect(textContent).toContain('Match 98%');
    expect(textContent).toContain('Urgente');
  });

  it('should emit openMatch event with breakdown data when clicking match badge', () => {
    spyOn(component.openMatch, 'emit');

    const matchBadge = fixture.nativeElement.querySelector('.tp-match-badge-btn') as HTMLElement;
    expect(matchBadge).toBeTruthy();
    matchBadge.click();

    expect(component.openMatch.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        jobTitleOrCompanyName: 'Garçom para Casamento',
        totalMatchScore: 98
      })
    );
  });

  it('should emit apply event when "Quero esse trampo" button is clicked', () => {
    spyOn(component.apply, 'emit');
    const button = fixture.nativeElement.querySelector('tp-button button');
    button.click();
    expect(component.apply.emit).toHaveBeenCalledWith(mockOpp);
  });

  it('should emit viewDetails event when card is clicked', () => {
    spyOn(component.viewDetails, 'emit');
    const cardEl = fixture.nativeElement.querySelector('.tp-stream-post') || fixture.nativeElement.querySelector('article');
    cardEl.click();
    expect(component.viewDetails.emit).toHaveBeenCalledWith(mockOpp);
  });
});
