import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';

class MatDialogRefStub {
  close = jasmine.createSpy('close');
}

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let dialogRef: MatDialogRefStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MatDialogRef, useClass: MatDialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: { message: 'Are you sure?' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(MatDialogRef) as unknown as MatDialogRefStub;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render passed message', () => {
    const text = fixture.nativeElement as HTMLElement;
    expect(text.textContent).toContain('Are you sure?');
  });

  it('should close with true on Yes', () => {
    component.onYes();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close with false on No', () => {
    component.onNo();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should wire buttons to onYes/onNo in template (if present)', () => {
    // Only checks presence and click binding if buttons exist in the template
    const yesBtn = fixture.debugElement.query(
      By.css('button[color="primary"], button.mat-primary'),
    );
    const noBtn = fixture.debugElement.query(
      By.css('button[color="warn"], button.mat-warn, button:not([color])'),
    );
    if (yesBtn) {
      yesBtn.triggerEventHandler('click', {});
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    }
    if (noBtn) {
      dialogRef.close.calls.reset();
      noBtn.triggerEventHandler('click', {});
      expect(dialogRef.close).toHaveBeenCalled();
    }
  });
});
