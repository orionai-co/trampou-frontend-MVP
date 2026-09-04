import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from '../../src/app/layout/main-layout/main-layout.component';
import { provideRouter } from '@angular/router';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the MainLayout component', () => {
    expect(component).toBeTruthy();
  });

  it('should render header, main router outlet container, footer and mobile nav', () => {
    const headerElement = fixture.nativeElement.querySelector('tp-header');
    const mainElement = fixture.nativeElement.querySelector('.tp-shell-main');
    const footerElement = fixture.nativeElement.querySelector('tp-footer');
    const mobileNavElement = fixture.nativeElement.querySelector('tp-mobile-nav');

    expect(headerElement).toBeTruthy();
    expect(mainElement).toBeTruthy();
    expect(footerElement).toBeTruthy();
    expect(mobileNavElement).toBeTruthy();
  });
});
