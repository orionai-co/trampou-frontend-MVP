import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PixReceiptModalComponent } from '../../src/app/shared/components/pix-receipt-modal/pix-receipt-modal.component';

describe('PixReceiptModalComponent', () => {
  let component: PixReceiptModalComponent;
  let fixture: ComponentFixture<PixReceiptModalComponent>;

  const mockReceipt = {
    transactionId: 'PIX-12345678-TEST',
    amount: 190,
    paidAt: '25/08/2026 às 23:30',
    companyName: 'Buffet Espaço Paulista',
    freelancerName: 'Lucas Mendes',
    pixKeyPreview: '***.391.842-**',
    jobTitle: 'Garçom para Evento Corporativo'
  };

  beforeEach(async () => {
    if (!navigator.clipboard) {
      (navigator as any).clipboard = {
        writeText: () => Promise.resolve()
      };
    } else {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
    }

    await TestBed.configureTestingModule({
      imports: [PixReceiptModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PixReceiptModalComponent);
    component = fixture.componentInstance;
    component.isOpen = true;
    component.receiptData = mockReceipt;
    component.showRatingAction = true;
    fixture.detectChanges();
  });

  it('should create the pix receipt modal component', () => {
    expect(component).toBeTruthy();
  });

  it('should render receipt details accurately', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('190,00');
    expect(compiled.textContent).toContain('Buffet Espaço Paulista');
    expect(compiled.textContent).toContain('Lucas Mendes');
    expect(compiled.textContent).toContain('***.391.842-**');
    expect(compiled.textContent).toContain('PIX-12345678-TEST');
  });

  it('should copy code and emit downloadReceipt', () => {
    spyOn(component.downloadReceipt, 'emit');
    component.onDownload();

    expect(component.downloadReceipt.emit).toHaveBeenCalled();
    expect(component.isCopied()).toBeTrue();
  });

  it('should emit openRating when clicking evaluate action', () => {
    spyOn(component.openRating, 'emit');
    component.onOpenRating();

    expect(component.openRating.emit).toHaveBeenCalled();
  });

  it('should emit closed when closing modal', () => {
    spyOn(component.closed, 'emit');
    component.close();

    expect(component.closed.emit).toHaveBeenCalled();
  });
});
