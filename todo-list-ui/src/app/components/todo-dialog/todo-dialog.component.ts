import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { Todo } from '../../models/todo.model';

export interface TodoDialogData {
  todo: Todo;
}

@Component({
  selector: 'app-todo-dialog',
  standalone: true,
  imports: [MatDialogModule, FormsModule, MatInput, MatButton],
  templateUrl: 'todo-dialog.component.html',
  styleUrl: 'todo-dialog.component.css',
})
export class TodoDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TodoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TodoDialogData,
  ) {}

  onCancel() {
    this.dialogRef.close();
  }
  onSave() {
    this.dialogRef.close(this.data);
  }
}
