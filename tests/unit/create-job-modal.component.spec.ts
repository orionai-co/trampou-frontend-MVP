import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateJobModalComponent } from '../../src/app/features/company/components/create-job-modal/create-job-modal.component';

describe('CreateJobModalComponent', () => {
  let component: CreateJobModalComponent;
  let fixture: ComponentFixture<CreateJobModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateJobModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateJobModalComponent);
    component = fixture.componentInstance;
    component.isOpen = true;
    fixture.detectChanges();
  });

  it('should create the modal component', () => {
    expect(component).toBeTruthy();
  });

  it('should start at step 1 and validate required fields before advancing', () => {
    expect(component.currentStep()).toBe(1);

    component.formData.update(f => ({ ...f, title: '', address: '' }));
    component.nextStep();

    expect(component.errorMessage()).toContain('título da vaga');
    expect(component.currentStep()).toBe(1);

    component.formData.update(f => ({ ...f, title: 'Barman para Festa', address: 'Rua Augusta, 500' }));
    component.nextStep();

    expect(component.errorMessage()).toBeNull();
    expect(component.currentStep()).toBe(2);
  });

  it('should navigate through step 2 to step 3 and back', () => {
    component.formData.update(f => ({ ...f, title: 'Recepcionista', address: 'Av Paulista, 100', slotsTotal: 2, paymentAmount: 200 }));
    component.currentStep.set(2);

    component.nextStep();
    expect(component.currentStep()).toBe(3);

    component.prevStep();
    expect(component.currentStep()).toBe(2);
  });

  it('should emit jobCreated when submitting at step 3', () => {
    spyOn(component.jobCreated, 'emit');
    spyOn(component.closed, 'emit');

    component.formData.set({
      title: 'Garçom de Salão',
      category: 'Gastronomia',
      date: 'Hoje',
      startTime: '18:00',
      endTime: '23:00',
      totalHours: 5,
      city: 'São Paulo',
      neighborhood: 'Moema',
      address: 'Av Ibirapuera, 500',
      slotsTotal: 3,
      requiredLevel: 2,
      paymentAmount: 190,
      requirementsText: 'Uniforme preto\nPontualidade'
    });
    component.currentStep.set(3);

    component.submitJob();

    expect(component.jobCreated.emit).toHaveBeenCalledWith(jasmine.objectContaining({
      title: 'Garçom de Salão',
      category: 'Gastronomia',
      paymentAmount: 190,
      slots: { total: 3, filled: 0 }
    }));
    expect(component.closed.emit).toHaveBeenCalled();
  });
});
