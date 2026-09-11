import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileService } from '../../core/services/user-profile.service';
import { PixKeyConfig } from './models/user-profile.model';
import { ProfileHeaderComponent } from './components/profile-header/profile-header.component';
import { ProfileCareerProgressComponent } from './components/profile-career-progress/profile-career-progress.component';
import { PixSettingsComponent } from './components/pix-settings/pix-settings.component';
import { ProfileAchievementsComponent } from './components/profile-achievements/profile-achievements.component';
import { SkillsSelectorComponent } from './components/skills-selector/skills-selector.component';
import { ReviewsListComponent } from './components/reviews-list/reviews-list.component';

@Component({
  selector: 'tp-profile, app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ProfileHeaderComponent,
    ProfileCareerProgressComponent,
    PixSettingsComponent,
    ProfileAchievementsComponent,
    SkillsSelectorComponent,
    ReviewsListComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  readonly profileService = inject(UserProfileService);
  readonly userProfile = this.profileService;

  ngOnInit(): void {
    this.profileService.fetchUserProfile();
    this.profileService.fetchReputation();
  }

  onPixKeyChange(config: PixKeyConfig): void {
    this.profileService.updatePixKeyRemote(config);
  }

  onEditPixKey(): void {
    // Ação delegada para modal interno de chave PIX
  }

  onSkillsChange(skills: string[]): void {
    this.profileService.updateSkills(skills);
  }

  onToggleSkill(skill: string): void {
    const current = [...this.profileService.skills()];
    const index = current.indexOf(skill);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(skill);
    }
    this.profileService.updateSkills(current);
  }
}
