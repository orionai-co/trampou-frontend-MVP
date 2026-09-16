import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoostCampaignModalComponent } from '../../src/app/features/company/components/boost-campaign-modal/boost-campaign-modal.component';
import { CampaignService } from '../../src/app/features/company/services/campaign.service';

describe('BoostCampaignModalComponent', () => {
  let component: BoostCampaignModalComponent;
  let fixture: ComponentFixture<BoostCampaignModalComponent>;
  let campaignService: CampaignService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoostCampaignModalComponent],
      providers: [CampaignService]
    }).compileComponents();

    fixture = TestBed.createComponent(BoostCampaignModalComponent);
    component = fixture.componentInstance;
    campaignService = TestBed.inject(CampaignService);
    localStorage.removeItem('trampou_boost_campaigns');
    component.isOpen = true;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('trampou_boost_campaigns');
  });

  it('should create the BoostCampaignModalComponent', () => {
    expect(component).toBeTruthy();
    expect(component.currentStep()).toBe(1);
  });

  it('should render the stepper progress header with 3 steps', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Criativo');
    expect(compiled.textContent).toContain('Alcance');
    expect(compiled.textContent).toContain('Investimento');
  });

  it('should render Step 1 (Conteúdo & Mídia) by default', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('1. Objetivo do Impulsionamento');
    expect(compiled.textContent).toContain('Apresentar Empresa & Cultura');
    expect(compiled.textContent).toContain('Impulsionar Vagas Abertas');
    expect(compiled.textContent).toContain('2. Headline do Card');
    expect(compiled.textContent).toContain('3. Vídeo Institucional');
    expect(compiled.textContent).toContain('Avançar para Segmentação →');
  });

  function attachTestVideo(comp: BoostCampaignModalComponent) {
    const fakeFile = new File(['fake-video-content'], 'meu-video-institucional.mp4', { type: 'video/mp4' });
    comp.onVideoFileSelected({
      target: {
        files: [fakeFile],
        value: ''
      }
    } as unknown as Event);
  }

  it('should validate Step 1 and prevent advancing if headline is short or no video is attached', () => {
    // Caso 1: Sem vídeo anexado (mesmo com headline válida)
    component.updateHeadline('Empresa líder de gastronomia');
    expect(component.uploadedVideo()).toBeNull();
    expect(component.isStep1Valid()).toBeFalse();

    component.nextStep();
    expect(component.currentStep()).toBe(1);

    // Caso 2: Com vídeo anexado mas headline curta
    attachTestVideo(component);
    expect(component.uploadedVideo()).toBeTruthy();
    component.updateHeadline('');
    expect(component.isStep1Valid()).toBeFalse();

    component.nextStep();
    expect(component.currentStep()).toBe(1);

    // Caso 3: Com vídeo anexado e headline válida
    component.updateHeadline('Empresa líder de gastronomia em SP');
    expect(component.isStep1Valid()).toBeTrue();

    component.nextStep();
    expect(component.currentStep()).toBe(2);
  });

  it('should only show headline error when user typed an insufficient text (1 to 4 characters)', () => {
    // Caso 1: Headline padrão válida com mais de 5 caracteres
    component.updateHeadline('Conheça nossa megaestrutura gastronômica, nossa equipe e como é trabalhar nos maiores eventos de SP.');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const textarea = compiled.querySelector('#campaignHeadline') as HTMLTextAreaElement;
    expect(textarea.classList.contains('tp-textarea-error')).toBeFalse();
    expect(textarea.classList.contains('tp-input--error')).toBeFalse();
    expect(compiled.querySelector('.tp-field-error-msg')).toBeNull();

    // Caso 2: Headline vazia (não exibe erro de headline)
    component.updateHeadline('');
    fixture.detectChanges();
    expect(textarea.classList.contains('tp-textarea-error')).toBeFalse();
    expect(compiled.querySelector('.tp-field-error-msg')).toBeNull();

    // Caso 3: Headline insuficiente com 1 a 4 caracteres (exibe erro visual)
    component.updateHeadline('Olá');
    fixture.detectChanges();
    expect(textarea.classList.contains('tp-textarea-error')).toBeTrue();
    expect(textarea.classList.contains('tp-input--error')).toBeTrue();
    expect(compiled.querySelector('.tp-field-error-msg')?.textContent).toContain('pelo menos 5 caracteres');
  });

  it('should navigate from Step 1 to Step 2 when valid', () => {
    component.updateHeadline('Empresa líder no segmento gastronômico');
    attachTestVideo(component);
    fixture.detectChanges();

    expect(component.isStep1Valid()).toBeTrue();

    component.nextStep();
    fixture.detectChanges();

    expect(component.currentStep()).toBe(2);
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('4. Raio de Alcance Geográfico');
    expect(compiled.textContent).toContain('5 km');
    expect(compiled.textContent).toContain('10 km');
    expect(compiled.textContent).toContain('Impacto Estimado na Região');
    expect(compiled.textContent).toContain('Avançar para Orçamento →');
    expect(compiled.textContent).toContain('← Voltar');
  });

  it('should navigate from Step 2 to Step 3 and back to Step 2', () => {
    attachTestVideo(component);
    component.goToStep(2);
    fixture.detectChanges();
    expect(component.currentStep()).toBe(2);

    component.nextStep();
    fixture.detectChanges();

    expect(component.currentStep()).toBe(3);
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('5. Período & Investimento');
    expect(compiled.textContent).toContain('3 Dias');
    expect(compiled.textContent).toContain('7 Dias');
    expect(compiled.textContent).toContain('14 Dias');
    expect(compiled.textContent).toContain('30 Dias');
    expect(compiled.textContent).toContain('Resumo do Investimento');
    expect(compiled.textContent).toContain('Confirmar & Ativar Campanha');

    component.prevStep();
    fixture.detectChanges();
    expect(component.currentStep()).toBe(2);
  });

  it('should switch campaign type and update default headline', () => {
    component.selectType('boost_job');
    fixture.detectChanges();

    expect(component.selectedType()).toBe('boost_job');
    expect(component.headline()).toContain('Vagas urgentes');

    component.selectType('featured_company');
    fixture.detectChanges();

    expect(component.selectedType()).toBe('featured_company');
    expect(component.headline()).toContain('Conheça nossa megaestrutura');
  });

  it('should change duration and update selected plan and price in Step 3', () => {
    attachTestVideo(component);
    component.goToStep(3);
    component.selectDuration(14);
    fixture.detectChanges();

    expect(component.selectedDuration()).toBe(14);
    expect(component.selectedPlan().price).toBe(179);
    expect(fixture.nativeElement.textContent).toContain('179,00');
    expect(fixture.nativeElement.textContent).toContain('14 dias consecutivos');
  });

  it('should change radius and update estimated impact', () => {
    attachTestVideo(component);
    component.goToStep(2);
    component.selectRadius(25);
    fixture.detectChanges();

    expect(component.selectedRadius()).toBe(25);
    expect(component.currentImpact().reachLabel).toContain('Grande Metrópole');
  });

  it('should render upload video area and preview placeholder when no video is attached', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const uploadArea = compiled.querySelector('.tp-video-upload-area');

    expect(uploadArea).toBeTruthy();
    expect(uploadArea?.textContent).toContain('Anexar vídeo do computador ou celular');
    expect(uploadArea?.textContent).toContain('MP4, WebM, MOV');

    // Mini video preview player placeholder
    const placeholder = compiled.querySelector('.tp-mini-video-placeholder');
    expect(placeholder).toBeTruthy();
    expect(placeholder?.textContent).toContain('Seu vídeo institucional aparecerá aqui após o anexo.');
  });

  it('should handle local video file selection, update preview with real video and allow removal', () => {
    attachTestVideo(component);
    fixture.detectChanges();

    expect(component.uploadedVideo()).toBeTruthy();
    expect(component.uploadedVideo()?.fileName).toBe('meu-video-institucional.mp4');
    expect(component.selectedVideoUrl()).toContain('blob:');

    const compiled = fixture.nativeElement as HTMLElement;
    const uploadedCard = compiled.querySelector('.tp-uploaded-video-card');
    expect(uploadedCard).toBeTruthy();
    expect(uploadedCard?.textContent).toContain('meu-video-institucional.mp4');
    expect(uploadedCard?.textContent).toContain('Pronto para veiculação');
    expect(uploadedCard?.textContent).toContain('Substituir vídeo');
    expect(uploadedCard?.textContent).toContain('Remover');

    // Mini video preview player in right column should now have real video element with controls
    const previewVideo = compiled.querySelector('video.tp-mini-real-video') as HTMLVideoElement;
    expect(previewVideo).toBeTruthy();
    expect(previewVideo.controls).toBeTrue();

    // Test removal of video
    component.removeUploadedVideo();
    fixture.detectChanges();

    expect(component.uploadedVideo()).toBeNull();
    expect(compiled.querySelector('.tp-video-upload-area')).toBeTruthy();
    expect(compiled.querySelector('.tp-mini-video-placeholder')).toBeTruthy();
  });

  it('should keep live preview reactive across all steps', () => {
    attachTestVideo(component);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.tp-boost-preview-col')).toBeTruthy();

    component.updateHeadline('Texto de teste para preview ao vivo');
    fixture.detectChanges();
    expect(compiled.querySelector('.tp-mini-headline')?.textContent).toContain('Texto de teste para preview ao vivo');

    component.goToStep(2);
    component.selectRadius(50);
    fixture.detectChanges();
    expect(compiled.querySelector('.tp-mini-meta')?.textContent).toContain('50 km');

    component.goToStep(3);
    fixture.detectChanges();
    expect(compiled.querySelector('.tp-boost-preview-col')).toBeTruthy();
  });

  it('should call campaignService.createCampaign, save to storage, dispatch event and emit event when confirmed', () => {
    spyOn(component.campaignCreated, 'emit');
    spyOn(component.closed, 'emit');
    spyOn(campaignService, 'createCampaign').and.callThrough();
    spyOn(window, 'dispatchEvent').and.callThrough();

    attachTestVideo(component);
    component.goToStep(3);
    component.confirmCampaign();

    expect(campaignService.createCampaign).toHaveBeenCalled();
    expect(component.campaignCreated.emit).toHaveBeenCalled();
    expect(component.closed.emit).toHaveBeenCalled();
    expect(component.currentStep()).toBe(1);

    // Verifica persistência no storage compartilhado
    const raw = localStorage.getItem('trampou_boost_campaigns');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(Array.isArray(parsed)).toBeTrue();
    expect(parsed[0].active).toBeTrue();
    expect(parsed[0].companyName).toBe('Buffet Espaço Paulista');

    // Verifica disparo de evento global
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      jasmine.objectContaining({ type: 'trampou:boost-updated' })
    );
  });

  it('should reset currentStep to 1 on close', () => {
    attachTestVideo(component);
    component.goToStep(2);
    expect(component.currentStep()).toBe(2);

    component.onClose();
    expect(component.currentStep()).toBe(1);
  });

});

