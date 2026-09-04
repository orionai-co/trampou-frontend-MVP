import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkillsSelectorComponent } from '../../src/app/features/profile/components/skills-selector/skills-selector.component';

describe('SkillsSelectorComponent', () => {
  let component: SkillsSelectorComponent;
  let fixture: ComponentFixture<SkillsSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsSelectorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SkillsSelectorComponent);
    component = fixture.componentInstance;
    component.skills = ['Garçom de Salão', 'Recepção de Eventos'];
    fixture.detectChanges();
  });

  it('should create the SkillsSelectorComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render available skills and show correct selection count', () => {
    expect(component.selectedCount).toBe(2);
    expect(component.selectedSkillsCount()).toBe(2);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('2 selecionadas');
    expect(compiled.textContent).toContain('Garçom de Salão');
    expect(compiled.textContent).toContain('Operação de Caixa');
  });

  it('should toggle a skill on and emit skillsChange', () => {
    spyOn(component.skillsChange, 'emit');

    component.toggleSkill('Operação de Caixa');

    expect(component.skillsChange.emit).toHaveBeenCalledWith([
      'Garçom de Salão',
      'Recepção de Eventos',
      'Operação de Caixa'
    ]);
  });

  it('should toggle a skill off and emit skillsChange', () => {
    spyOn(component.skillsChange, 'emit');

    component.toggleSkill('Garçom de Salão');

    expect(component.skillsChange.emit).toHaveBeenCalledWith([
      'Recepção de Eventos'
    ]);
  });

  it('should add a custom skill, mark it selected and custom, and emit skillsChange', () => {
    spyOn(component.skillsChange, 'emit');

    component.newSkillName.set('Bartender Flair');
    component.addCustomSkill();
    fixture.detectChanges();

    expect(component.skillsChange.emit).toHaveBeenCalledWith([
      'Garçom de Salão',
      'Recepção de Eventos',
      'Bartender Flair'
    ]);
    expect(component.selectedSkillsCount()).toBe(3);
    expect(component.newSkillName()).toBe('');

    const customSkill = component.allSkills().find(s => s.name === 'Bartender Flair');
    expect(customSkill).toBeDefined();
    expect(customSkill?.isCustom).toBeTrue();
    expect(customSkill?.selected).toBeTrue();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bartender Flair');
    expect(compiled.textContent).toContain('3 selecionadas');
  });

  it('should not add an empty or whitespace-only custom skill', () => {
    spyOn(component.skillsChange, 'emit');

    component.newSkillName.set('   ');
    component.addCustomSkill();

    expect(component.skillsChange.emit).not.toHaveBeenCalled();
    expect(component.selectedSkillsCount()).toBe(2);
  });

  it('should handle adding an existing suggested skill by selecting it if unselected', () => {
    spyOn(component.skillsChange, 'emit');

    component.newSkillName.set('Operação de Caixa');
    component.addCustomSkill();

    expect(component.skillsChange.emit).toHaveBeenCalledWith([
      'Garçom de Salão',
      'Recepção de Eventos',
      'Operação de Caixa'
    ]);
    expect(component.newSkillName()).toBe('');
  });

  it('should remove a custom skill and emit updated skills', () => {
    component.newSkillName.set('Sommelier');
    component.addCustomSkill();
    fixture.detectChanges();

    spyOn(component.skillsChange, 'emit');

    const sommelierSkill = component.allSkills().find(s => s.name === 'Sommelier');
    expect(sommelierSkill).toBeDefined();

    component.removeCustomSkill(sommelierSkill!.id);
    fixture.detectChanges();

    expect(component.skillsChange.emit).toHaveBeenCalledWith([
      'Garçom de Salão',
      'Recepção de Eventos'
    ]);
    expect(component.allSkills().some(s => s.name === 'Sommelier')).toBeFalse();
    expect(component.selectedSkillsCount()).toBe(2);
  });

  it('should accept custom skill names up to 100 characters and truncate beyond 100 characters', () => {
    spyOn(component.skillsChange, 'emit');

    const exact100 = 'Especialista em Coquetelaria Molecular e Drinks Artesanais para Grandes Eventos Corporativos e Festa';
    expect(exact100.length).toBe(100);

    component.newSkillName.set(exact100);
    component.addCustomSkill();
    fixture.detectChanges();

    expect(component.skillsChange.emit).toHaveBeenCalledWith([
      'Garçom de Salão',
      'Recepção de Eventos',
      exact100
    ]);
    expect(component.allSkills().some(s => s.name === exact100)).toBeTrue();

    const over100 = 'B'.repeat(120);
    component.newSkillName.set(over100);
    component.addCustomSkill();

    const expectedTruncated = 'B'.repeat(100);
    expect(component.allSkills().some(s => s.name === expectedTruncated)).toBeTrue();
  });
});
