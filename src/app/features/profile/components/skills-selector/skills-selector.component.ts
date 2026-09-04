import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TpIconComponent } from '../../../../shared/components';

export interface SkillOption {
  id: string;
  name: string;
  selected: boolean;
  isCustom?: boolean;
}

const DEFAULT_AVAILABLE_SKILLS: string[] = [
  'Garçom de Salão',
  'Recepção de Eventos',
  'Atendimento & Bar',
  'Operação de Caixa',
  'Logística & Estoque',
  'Limpeza & Stewarding',
  'Auxiliar de Cozinha',
  'Promotor de Eventos'
];

@Component({
  selector: 'tp-skills-selector',
  standalone: true,
  imports: [CommonModule, TpIconComponent],
  templateUrl: './skills-selector.component.html',
  styleUrl: './skills-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillsSelectorComponent {
  private _skills = signal<string[]>([]);

  @Input()
  set skills(value: string[] | undefined | null) {
    this._skills.set(value ? [...value] : []);
  }

  get skills(): string[] {
    return this._skills();
  }

  @Output() skillsChange = new EventEmitter<string[]>();

  readonly availableSkills: string[] = DEFAULT_AVAILABLE_SKILLS;
  readonly customSkills = signal<string[]>([]);
  readonly newSkillName = signal<string>('');

  readonly allSkills = computed<SkillOption[]>(() => {
    const selectedList = this._skills();
    const customList = this.customSkills();

    // 1. Sugeridas padrão
    const suggested: SkillOption[] = DEFAULT_AVAILABLE_SKILLS.map(name => ({
      id: this.generateSkillId(name),
      name,
      selected: selectedList.some(s => s.toLowerCase() === name.toLowerCase()),
      isCustom: false
    }));

    // 2. Personalizadas cadastradas explicitamente ou vindas na lista de skills inicial
    const existingNames = new Set(DEFAULT_AVAILABLE_SKILLS.map(s => s.toLowerCase()));
    const allCustomSet = new Set<string>();

    for (const c of customList) {
      if (!existingNames.has(c.toLowerCase())) {
        allCustomSet.add(c);
      }
    }

    for (const s of selectedList) {
      if (!existingNames.has(s.toLowerCase())) {
        allCustomSet.add(s);
      }
    }

    const custom: SkillOption[] = Array.from(allCustomSet).map(name => ({
      id: 'custom-' + this.generateSkillId(name),
      name,
      selected: selectedList.some(s => s.toLowerCase() === name.toLowerCase()),
      isCustom: true
    }));

    return [...suggested, ...custom];
  });

  readonly selectedSkillsCount = computed(() =>
    this.allSkills().filter(s => s.selected).length
  );

  get selectedCount(): number {
    return this.selectedSkillsCount();
  }

  isSelected(skillName: string): boolean {
    return this._skills().some(s => s.toLowerCase() === skillName.toLowerCase());
  }

  onNewSkillInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newSkillName.set(input.value);
  }

  toggleSkill(idOrName: string): void {
    const skill = this.allSkills().find(
      s => s.id === idOrName || s.name.toLowerCase() === idOrName.toLowerCase()
    );
    if (!skill) return;

    let current = [...this._skills()];
    const index = current.findIndex(s => s.toLowerCase() === skill.name.toLowerCase());

    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(skill.name);
    }

    this._skills.set(current);
    this.skillsChange.emit(current);
  }

  addCustomSkill(): void {
    let cleanName = this.newSkillName().trim();
    if (!cleanName) return;

    if (cleanName.length > 100) {
      cleanName = cleanName.substring(0, 100);
    }

    const existing = this.allSkills().find(
      s => s.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (existing) {
      if (!existing.selected) {
        this.toggleSkill(existing.id);
      }
      this.newSkillName.set('');
      return;
    }

    this.customSkills.update(list => [...list, cleanName]);

    const updated = [...this._skills(), cleanName];
    this._skills.set(updated);
    this.skillsChange.emit(updated);
    this.newSkillName.set('');
  }

  removeCustomSkill(idOrName: string): void {
    const skill = this.allSkills().find(
      s => s.id === idOrName || s.name.toLowerCase() === idOrName.toLowerCase()
    );
    if (!skill) return;

    this.customSkills.update(list =>
      list.filter(s => s.toLowerCase() !== skill.name.toLowerCase())
    );

    const updated = this._skills().filter(
      s => s.toLowerCase() !== skill.name.toLowerCase()
    );
    this._skills.set(updated);
    this.skillsChange.emit(updated);
  }

  private generateSkillId(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
}
