import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PixSettingsComponent } from '../../src/app/features/profile/components/pix-settings/pix-settings.component';
import { PixKeyConfig } from '../../src/app/features/profile/models/user-profile.model';

describe('PixSettingsComponent', () => {
  let component: PixSettingsComponent;
  let fixture: ComponentFixture<PixSettingsComponent>;

  const initialPixKey: PixKeyConfig = {
    type: 'phone',
    key: '(11) 98765-4321'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PixSettingsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PixSettingsComponent);
    component = fixture.componentInstance;
    component.pixKey = { ...initialPixKey };
    fixture.detectChanges();
  });

  it('should create the PixSettingsComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should display active PIX key and label', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('(11) 98765-4321');
    expect(compiled.textContent).toContain('Chave Celular / Telefone');
  });

  it('should open and close the edit modal', () => {
    expect(component.isModalOpen()).toBeFalse();

    component.openEditModal();
    expect(component.isModalOpen()).toBeTrue();
    expect(component.selectedType()).toBe('phone');
    expect(component.keyInput()).toBe('(11) 98765-4321');

    component.closeEditModal();
    expect(component.isModalOpen()).toBeFalse();
  });

  it('should validate format based on selected key type', () => {
    // E-mail validation
    component.selectType('email');
    component.onKeyInputChange('invalido');
    expect(component.isValid()).toBeFalse();

    component.onKeyInputChange('valido@email.com');
    expect(component.isValid()).toBeTrue();

    // CPF validation
    component.selectType('cpf');
    component.onKeyInputChange('123');
    expect(component.isValid()).toBeFalse();

    component.onKeyInputChange('12345678901');
    expect(component.isValid()).toBeTrue();

    // Phone validation
    component.selectType('phone');
    component.onKeyInputChange('11987654321');
    expect(component.isValid()).toBeTrue();
  });

  it('should emit pixKeyChange with updated config when saving valid key', () => {
    spyOn(component.pixKeyChange, 'emit');

    component.openEditModal();
    component.selectType('email');
    component.onKeyInputChange('matheus.silva@email.com');

    component.savePixKey();

    expect(component.pixKeyChange.emit).toHaveBeenCalledWith({
      type: 'email',
      key: 'matheus.silva@email.com'
    });
    expect(component.isModalOpen()).toBeFalse();
    expect(component.feedbackMessage()).toBe('Chave PIX atualizada com sucesso!');
  });
});
