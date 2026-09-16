import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturedCompanyCardComponent } from '../../src/app/features/opportunities/components/featured-company-card/featured-company-card.component';
import { FeaturedCompany } from '../../src/app/core/models/sponsored-content.model';
import { AuthService } from '../../src/app/core/services/auth.service';
import { provideRouter } from '@angular/router';

describe('FeaturedCompanyCardComponent', () => {
  let component: FeaturedCompanyCardComponent;
  let fixture: ComponentFixture<FeaturedCompanyCardComponent>;

  const mockCompany: FeaturedCompany = {
    id: 'feat-comp-01',
    companyId: 'comp-001',
    companyName: 'Buffet Espaço Paulista',
    companyHandle: '@espacopaulista',
    avatarInitials: 'EP',
    verified: true,
    rating: 4.9,
    reviewCount: 84,
    badgeLabel: 'Patrocinado',
    headline: 'Conheça nossa megaestrutura gastronômica, nossa equipe e como é trabalhar nos maiores eventos de SP.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-restaurant-kitchen-staff-working-42998-large.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552',
    videoDurationText: '0:45',
    location: 'Vila Olímpia, São Paulo',
    distanceKm: 2.4,
    completedShiftsCount: 84,
    matchScore: 96,
    matchReasons: [
      'Localização próxima (2.4 km)',
      'Setor de Gastronomia & Eventos',
      '100% Repasses via PIX no prazo'
    ],
    openJobsCount: 3
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedCompanyCardComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturedCompanyCardComponent);
    component = fixture.componentInstance;
    component.company = { ...mockCompany };
    fixture.detectChanges();
  });

  it('should create the FeaturedCompanyCardComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render company header info, badge and rating', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Buffet Espaço Paulista');
    expect(compiled.textContent).toContain('@espacopaulista');
    expect(compiled.textContent).toContain('Vila Olímpia, São Paulo (2.4 km)');
    expect(compiled.textContent).toContain('4.9');
    expect(compiled.textContent).toContain('(84)');
    expect(compiled.textContent).toContain('Patrocinado');
  });

  it('should render HTML5 video element with poster, src and controls', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const video = compiled.querySelector('video.tp-featured-video') as HTMLVideoElement;
    expect(video).toBeTruthy();
    expect(video.src).toContain('assets.mixkit.co');
    expect(video.poster).toContain('photo-1519741497674-611481863552');

    expect(compiled.textContent).toContain('Conheça nossa megaestrutura gastronômica');
    expect(compiled.textContent).toContain('0:45');
    expect(compiled.textContent).toContain('Vídeo Institucional');
  });

  it('should toggle play and pause state on video click or togglePlayVideo call', () => {
    expect(component.isPlaying()).toBeFalse();

    const videoElement = component.videoPlayerRef?.nativeElement;
    if (videoElement) {
      spyOn(videoElement, 'play').and.returnValue(Promise.resolve());
      spyOn(videoElement, 'pause');
    }

    component.togglePlayVideo();
    expect(component.isPlaying()).toBeTrue();

    component.togglePlayVideo();
    expect(component.isPlaying()).toBeFalse();
  });

  it('should toggle audio muted state when audio button is clicked', () => {
    expect(component.isMuted()).toBeTrue();

    const audioBtn = fixture.nativeElement.querySelector('.tp-video-audio-btn') as HTMLButtonElement;
    expect(audioBtn).toBeTruthy();

    audioBtn.click();
    fixture.detectChanges();

    expect(component.isMuted()).toBeFalse();

    audioBtn.click();
    fixture.detectChanges();

    expect(component.isMuted()).toBeTrue();
  });

  it('should render organic match block and operational trust proof', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('✦ 96% Match');
    expect(compiled.textContent).toContain('Localização próxima (2.4 km)');
    expect(compiled.textContent).toContain('Setor de Gastronomia & Eventos');
    expect(compiled.textContent).toContain('84 profissionais já trabalharam aqui');
    expect(compiled.textContent).toContain('100% repasses no prazo via PIX');
  });

  it('should emit openMatch event with company breakdown data when clicking match tag', () => {
    spyOn(component.openMatch, 'emit');

    const matchTag = fixture.nativeElement.querySelector('.tp-feat-match-tag') as HTMLElement;
    expect(matchTag).toBeTruthy();
    matchTag.click();

    expect(component.openMatch.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        jobTitleOrCompanyName: 'Buffet Espaço Paulista',
        totalMatchScore: 96
      })
    );
  });

  it('should emit exploreCompany when action button is clicked for professional user', () => {
    spyOn(component.exploreCompany, 'emit');

    const button = fixture.nativeElement.querySelector('.tp-feat-action-btn') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Conhecer Empresa & Ver Vagas (3)');

    button.click();
    expect(component.exploreCompany.emit).toHaveBeenCalledWith(component.company);
  });

  it('should render own company active ad badge and hide explore button when user is contractor and owns the ad', () => {
    const authService = TestBed.inject(AuthService);
    authService.userRole.set('contractor');
    component.isOwnCompany = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const actionBtn = compiled.querySelector('.tp-feat-action-btn');
    const ownAdBadge = compiled.querySelector('.tp-feat-own-ad-badge');

    expect(actionBtn).toBeNull();
    expect(ownAdBadge).toBeTruthy();
    expect(ownAdBadge?.textContent).toContain('Seu Anúncio Ativo (Gerenciar no Painel)');
  });

  it('should render audit view badge and hide explore button when user is contractor and ad belongs to another company', () => {
    const authService = TestBed.inject(AuthService);
    authService.userRole.set('contractor');
    component.isOwnCompany = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const actionBtn = compiled.querySelector('.tp-feat-action-btn');
    const auditBadge = compiled.querySelector('.tp-feat-audit-badge');

    expect(actionBtn).toBeNull();
    expect(auditBadge).toBeTruthy();
    expect(auditBadge?.textContent).toContain('Visualização de Auditoria • Anúncio Corporativo');
  });
});
