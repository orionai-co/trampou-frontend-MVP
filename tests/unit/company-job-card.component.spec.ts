import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyJobCardComponent } from '../../src/app/features/company/components/company-job-card/company-job-card.component';
import { CompanyJob } from '../../src/app/features/company/models/company-job.model';

describe('CompanyJobCardComponent', () => {
  let component: CompanyJobCardComponent;
  let fixture: ComponentFixture<CompanyJobCardComponent>;

  const mockJob: CompanyJob = {
    id: 'test-job-1',
    title: 'Garçom para Casamento',
    category: 'Gastronomia',
    location: {
      city: 'São Paulo',
      neighborhood: 'Jardins',
      address: 'Rua Bela Cintra, 1000'
    },
    date: 'Hoje, 25 Ago',
    schedule: {
      start: '18:00',
      end: '23:30',
      totalHours: 5.5
    },
    slots: {
      total: 4,
      filled: 2
    },
    paymentAmount: 190,
    requiredLevel: 2,
    status: 'open',
    requirements: ['Camisa social preta'],
    candidates: [
      {
        id: 'c1',
        name: 'Carlos Silva',
        avatarInitials: 'CS',
        level: 2,
        rating: 4.9,
        reviewsCount: 15,
        matchPercentage: 95,
        punctualityRate: 100,
        pixKeyPreview: '***.123.456-**',
        status: 'applied'
      },
      {
        id: 'c2',
        name: 'Mariana Costa',
        avatarInitials: 'MC',
        level: 2,
        rating: 5.0,
        reviewsCount: 20,
        matchPercentage: 98,
        punctualityRate: 100,
        pixKeyPreview: '***.789.012-**',
        status: 'approved'
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyJobCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyJobCardComponent);
    component = fixture.componentInstance;
    component.job = mockJob;
    fixture.detectChanges();
  });

  it('should create the job card component', () => {
    expect(component).toBeTruthy();
  });

  it('should render job title, schedule, address and payment amount', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.tp-ccard-title')?.textContent).toContain('Garçom para Casamento');
    expect(compiled.textContent).toContain('Rua Bela Cintra, 1000');
    expect(compiled.textContent).toContain('Hoje, 25 Ago');
    expect(compiled.querySelector('.tp-cpay-val')?.textContent).toContain('190');
  });

  it('should calculate fill percentage and candidates count correctly', () => {
    expect(component.fillPercentage).toBe(50);
    expect(component.appliedCandidatesCount).toBe(1);
    expect(component.totalCandidatesCount).toBe(2);
  });

  it('should emit viewCandidates when clicking action button', () => {
    spyOn(component.viewCandidates, 'emit');
    const button = fixture.nativeElement.querySelector('.tp-candidates-btn') || fixture.nativeElement.querySelector('tp-button');
    if (button) {
      button.dispatchEvent(new Event('btnClick'));
    }
    component.onCardAction();

    expect(component.viewCandidates.emit).toHaveBeenCalledWith(mockJob);
  });
});
