import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CandidateSelectionModalComponent } from '../../src/app/features/company/components/candidate-selection-modal/candidate-selection-modal.component';
import { CompanyJob } from '../../src/app/features/company/models/company-job.model';

describe('CandidateSelectionModalComponent', () => {
  let component: CandidateSelectionModalComponent;
  let fixture: ComponentFixture<CandidateSelectionModalComponent>;

  const mockJob: CompanyJob = {
    id: 'test-job-cand',
    title: 'Garçom para Evento Corporativo',
    category: 'Gastronomia',
    location: {
      city: 'São Paulo',
      neighborhood: 'Jardins',
      address: 'Alameda Santos, 1200'
    },
    date: 'Hoje, 25 Ago',
    schedule: {
      start: '18:00',
      end: '23:30',
      totalHours: 5.5
    },
    slots: {
      total: 2,
      filled: 1
    },
    paymentAmount: 190,
    requiredLevel: 2,
    status: 'open',
    requirements: ['Camisa preta'],
    candidates: [
      {
        id: 'cand-1',
        name: 'Lucas Mendes',
        avatarInitials: 'LM',
        level: 2,
        rating: 4.9,
        reviewsCount: 38,
        matchPercentage: 98,
        punctualityRate: 100,
        pixKeyPreview: '***.391.842-**',
        status: 'approved'
      },
      {
        id: 'cand-2',
        name: 'Rodrigo Silveira',
        avatarInitials: 'RS',
        level: 2,
        rating: 4.8,
        reviewsCount: 24,
        matchPercentage: 92,
        punctualityRate: 96,
        pixKeyPreview: '***.483.910-**',
        status: 'applied'
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateSelectionModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateSelectionModalComponent);
    component = fixture.componentInstance;
    component.isOpen = true;
    component.job = mockJob;
    fixture.detectChanges();
  });

  it('should create the candidate selection modal', () => {
    expect(component).toBeTruthy();
  });

  it('should render candidates list with profile details', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Lucas Mendes');
    expect(compiled.textContent).toContain('Rodrigo Silveira');
    expect(compiled.textContent).toContain('98% Match');
    expect(compiled.textContent).toContain('100% Pontualidade');
    expect(compiled.textContent).toContain('***.391.842-**');
  });

  it('should emit candidateApproved when clicking approve', () => {
    spyOn(component.candidateApproved, 'emit');
    const approveBtn = fixture.nativeElement.querySelector('.tp-decision-approve');
    approveBtn.click();

    expect(component.candidateApproved.emit).toHaveBeenCalledWith({
      jobId: 'test-job-cand',
      candidateId: 'cand-2'
    });
  });

  it('should emit candidateRejected when clicking reject', () => {
    spyOn(component.candidateRejected, 'emit');
    const rejectBtn = fixture.nativeElement.querySelector('.tp-decision-reject');
    rejectBtn.click();

    expect(component.candidateRejected.emit).toHaveBeenCalledWith({
      jobId: 'test-job-cand',
      candidateId: 'cand-2'
    });
  });

  it('should open candidate profile modal and emit viewProfile when clicking candidate avatar or name or view profile button', () => {
    spyOn(component.viewProfile, 'emit');

    const avatarBtn = fixture.nativeElement.querySelector('.tp-cand-avatar.tp-cand-clickable');
    expect(avatarBtn).toBeTruthy();
    avatarBtn.click();
    fixture.detectChanges();

    expect(component.isProfileModalOpen).toBeTrue();
    expect(component.selectedCandidateForProfile?.id).toBe('cand-1');
    expect(component.viewProfile.emit).toHaveBeenCalledWith({
      candidate: mockJob.candidates[0],
      job: mockJob
    });

    component.closeCandidateProfile();
    expect(component.isProfileModalOpen).toBeFalse();
    expect(component.selectedCandidateForProfile).toBeNull();
  });

  it('should open profile modal when clicking "Ver Perfil" button', () => {
    const viewProfileBtn = fixture.nativeElement.querySelector('.tp-cand-view-profile-btn');
    expect(viewProfileBtn).toBeTruthy();
    viewProfileBtn.click();
    fixture.detectChanges();

    expect(component.isProfileModalOpen).toBeTrue();
    expect(component.selectedCandidateForProfile?.id).toBe('cand-1');
  });

  it('should handle onProfileApprove and delegate to candidateApproved', () => {
    spyOn(component.candidateApproved, 'emit');
    component.selectedCandidateForProfile = mockJob.candidates[1];
    component.onProfileApprove(mockJob.candidates[1]);

    expect(component.candidateApproved.emit).toHaveBeenCalledWith({
      jobId: 'test-job-cand',
      candidateId: 'cand-2'
    });
    expect(component.selectedCandidateForProfile?.status).toBe('approved');
  });

  it('should handle onProfileReject and delegate to candidateRejected', () => {
    spyOn(component.candidateRejected, 'emit');
    component.selectedCandidateForProfile = mockJob.candidates[1];
    component.onProfileReject(mockJob.candidates[1]);

    expect(component.candidateRejected.emit).toHaveBeenCalledWith({
      jobId: 'test-job-cand',
      candidateId: 'cand-2'
    });
    expect(component.selectedCandidateForProfile?.status).toBe('rejected');
  });

  it('should emit openChat and close modal when onOpenChat is called', () => {
    spyOn(component.openChat, 'emit');
    spyOn(component.closed, 'emit');

    component.onOpenChat(mockJob.candidates[0]);

    expect(component.openChat.emit).toHaveBeenCalledWith({
      candidate: mockJob.candidates[0],
      job: mockJob
    });
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should emit closed when clicking close', () => {
    spyOn(component.closed, 'emit');
    component.close();
    expect(component.closed.emit).toHaveBeenCalled();
  });
});
