import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoDialogComponent } from './todo-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDatetimeModule } from '@mat-datetimepicker/core';

class MatDialogRefStub {
  close = jasmine.createSpy('close');
}

describe('TodoDialogComponent', () => {
  let component: TodoDialogComponent;
  let fixture: ComponentFixture<TodoDialogComponent>;
  let dialogRef: MatDialogRefStub;

  function create(data: any) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TodoDialogComponent, MatDatepickerModule, MatNativeDatetimeModule],
      providers: [
        { provide: MatDialogRef, useClass: MatDialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TodoDialogComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(MatDialogRef) as unknown as MatDialogRefStub;
    fixture.detectChanges();
  }

  it('should create with defaults when no data provided', async () => {
    await create(undefined);
    expect(component).toBeTruthy();
    expect(component.model.title).toBe('');
    expect(component.isAppointmentValid()).toBeTrue();
  });

  it('should normalize provided todo data', async () => {
    const appt = moment().add(1, 'day').toISOString();
    await create({ todo: { id: '1', title: 'X', appointment: appt } });
    expect(component.model.id).toBe('1');
    expect(component.model.title).toBe('X');
    expect(component.model.appointment).toBeTruthy();
  });

  it('should validate title and appointment', async () => {
    await create({});
    component.model.title = '  ';
    expect(component.isTitleValid()).toBeFalse();

    component.model.title = 'Valid';
    component.model.appointment = moment().subtract(1, 'day').toISOString();
    expect(component.isAppointmentValid()).toBeFalse();

    component.model.appointment = moment().add(1, 'hour').toISOString();
    expect(component.isFormValid()).toBeTrue();
  });

  it('should format date and close with result on save', async () => {
    await create({});
    component.model.title = ' Hello ';
    component.model.appointment = moment().add(1, 'hour').toISOString();
    component.onSave();
    expect(dialogRef.close).toHaveBeenCalled();
    const arg = (dialogRef.close as any).calls.mostRecent().args[0];
    expect(arg.title).toBe('Hello');
    // ISO with timezone offset like +00:00
    expect(arg.appointment).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}/);
  });

  it('should not close when form invalid', async () => {
    await create({});
    component.model.title = '';
    component.model.appointment = moment().subtract(1, 'hour').toISOString();
    component.onSave();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
