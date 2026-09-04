import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RatingModalComponent } from '../../src/app/shared/components/rating-modal/rating-modal.component';
import { RatingService } from '../../src/app/core/services/rating.service';
import { UserProfileService } from '../../src/app/core/services/user-profile.service';
import { CompanyService } from '../../src/app/features/company/services/company.service';

describe('RatingModalComponent', () => {
  let component: RatingModalComponent;
  let fixture: ComponentFixture<RatingModalComponent>;
  let ratingService: RatingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingModalComponent],
      providers: [RatingService, UserProfileService, CompanyService]
    }).compileComponents();

    fixture = TestBed.createComponent(RatingModalComponent);
    component = fixture.componentInstance;
    ratingService = TestBed.inject(RatingService);

    component.isOpen = true;
    component.shiftId = 'shift-spec-1';
    component.shiftTitle = 'Garçom para Casamento';
    component.reviewerRole = 'company';
    component.reviewerName = 'Buffet Espaço Paulista';
    component.targetId = 'freelancer-1';
    component.targetName = 'Lucas Mendes';
    fixture.detectChanges();
  });

  it('should create the rating modal component', () => {
    expect(component).toBeTruthy();
  });

  it('should allow changing star rating and toggle tags', () => {
    component.setRating(4);
    expect(component.selectedRating()).toBe(4);
    expect(component.ratingLabel).toContain('Muito Bom');

    component.toggleTag('Pontual');
    expect(component.isTagSelected('Pontual')).toBeTrue();

    component.toggleTag('Pontual');
    expect(component.isTagSelected('Pontual')).toBeFalse();
  });

  it('should submit review and emit reviewSubmitted', () => {
    spyOn(component.reviewSubmitted, 'emit');
    spyOn(component.closed, 'emit');

    component.selectedRating.set(5);
    component.selectedTags.set(['Pontual', 'Proativo']);
    component.commentText.set('Ótimo trabalho!');

    component.submit();

    expect(component.reviewSubmitted.emit).toHaveBeenCalled();
    expect(component.closed.emit).toHaveBeenCalled();
  });
});
