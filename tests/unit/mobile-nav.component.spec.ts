import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MobileNavComponent } from '../../src/app/layout/mobile-nav/mobile-nav.component';
import { provideRouter } from '@angular/router';

describe('MobileNavComponent', () => {
  let component: MobileNavComponent;
  let fixture: ComponentFixture<MobileNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileNavComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(MobileNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the MobileNav component', () => {
    expect(component).toBeTruthy();
  });

  it('should render navigation links for Vagas, Trabalhos, Empresa, Avisos and Perfil', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.tp-mobile-tab');
    expect(tabs.length).toBe(5);

    const textContent = fixture.nativeElement.textContent;
    expect(textContent).toContain('Vagas');
    expect(textContent).toContain('Trabalhos');
    expect(textContent).toContain('Empresa');
    expect(textContent).toContain('Avisos');
    expect(textContent).toContain('Perfil');
  });
});
