import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import moment from 'moment';
import { FormsModule } from '@angular/forms';
import { MatError, MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatetimepickerModule } from '@mat-datetimepicker/core';
import { MatMomentDatetimeModule } from '@mat-datetimepicker/moment';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Todo } from '../../models/todo.model';

imports: [
  FormsModule,
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule,
  MatIconModule,
  MatDialogModule,
  MatDatetimepickerModule,
  MatMomentDatetimeModule,
  MatDatepickerModule,
];

@Component({
  selector: 'app-todo-dialog',
  templateUrl: './todo-dialog.component.html',
  imports: [
    MatFormField,
    MatLabel,
    MatError,
    MatDatetimepickerModule,
    FormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatInput,
    MatDialogActions,
    MatButton,
  ],
  styleUrls: ['./todo-dialog.component.css'],
})
export class TodoDialogComponent {
  // ensure a mutable model the template can bind to
  public model: Todo = { id: undefined, title: '', appointment: '' };

  constructor(
    public dialogRef: MatDialogRef<TodoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    // Normalize incoming data
    const incoming: Todo = data && data.todo ? data.todo : data;

    // Preserve id from caller if provided
    this.model.id = incoming?.id;

    // Title
    this.model.title = incoming?.title ?? '';

    const appt = (incoming?.appointment as unknown) ?? moment().add(30, 'minutes').toISOString();
    const m = moment(appt);
    this.model.appointment = m.isValid() ? m.toISOString() : '';
  }

  // Validate title and appointment
  isAppointmentValid(): boolean {
    if (!this.model.appointment) return false;
    return moment(this.model.appointment).isAfter(moment());
  }

  isTitleValid(): boolean {
    return !!(this.model.title && this.model.title.trim());
  }

  isFormValid(): boolean {
    return this.isTitleValid() && this.isAppointmentValid();
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (!this.isFormValid()) return;

    const result: Todo = {
      id: this.model.id,
      title: this.model.title?.trim(),
      appointment: moment(this.model.appointment).format('YYYY-MM-DDTHH:mm:ssZ'),
    };

    this.dialogRef.close(result);
  }
}
