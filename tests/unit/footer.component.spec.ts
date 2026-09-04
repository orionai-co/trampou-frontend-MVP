import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from '../../src/app/layout/footer/footer.component';
import { provideRouter } from '@angular/router';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the Footer component', () => {
    expect(component).toBeTruthy();
  });

  it('should render copyright text and version tag', () => {
    const textContent = fixture.nativeElement.textContent;
    expect(textContent).toContain('TRAMPOU');
    expect(textContent).toContain('MVP v0.1.0');
    expect(textContent).toContain('Todos os direitos reservados');
  });
});
