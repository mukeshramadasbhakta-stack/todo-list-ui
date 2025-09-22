import { Component, signal } from '@angular/core';
import { TodoService } from '../../services/todo.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TodoDialogComponent } from '../todo-dialog/todo-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../spinner/spinner.component';
import { MatCardModule } from '@angular/material/card';
import {Todo} from '../../models/todo.model';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    SpinnerComponent,
  ],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
})
export class TodoListComponent {
  todos = signal<Todo[]>([]);
  searchTerm = signal('');
  loading = signal(false);
  error = signal('');

  constructor(
    private todoService: TodoService,
    private dialog: MatDialog,
  ) {
    this.loadTodos();
  }

  get filteredTodos() {
    const term = this.searchTerm().toLowerCase();
    return this.todos().filter((todo) => todo.title?.toLowerCase().includes(term));
  }

  loadTodos() {
    this.loading.set(true);
    this.todoService.getAll().subscribe({
      next: (data) => this.todos.set(data),
      error: (err) => this.error.set(err.message || 'Failed to load TODOs'),
      complete: () => this.loading.set(false),
    });
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(TodoDialogComponent, {
      data: {
        id: undefined,
        title: '',
        appointment: ''
      } as Todo
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.todoService.upsert(result).subscribe({
          next: (newId) => {
            this.todoService.get(newId).subscribe({
              next: (newTodo) => this.todos.set([...this.todos(), newTodo]),
              error: (err) => this.error.set(err.message),
            });
          },
          error: (err) => this.error.set(err.message),
        });
      }
    });
  }

  openEditDialog(todo: Todo) {
    const dialogRef = this.dialog.open(TodoDialogComponent, { data: { todo: todo } });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.todoService.upsert(result).subscribe({
          next: (newId) => {
            this.todoService.get(newId).subscribe({
              next: (newTodo) =>
                this.todos.set(this.todos().map((t) => (t.id === newTodo.id ? newTodo : t))),
              error: (err) => this.error.set(err.message),
            });
          },
          error: (err) => this.error.set(err.message),
        });
      }
    });
  }

  confirmDelete(todo: Todo) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `Are you sure you want to delete "${todo.title}"?` },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && todo.id) {
        this.todoService.delete(todo.id).subscribe({
          next: () => this.todos.set(this.todos().filter((t) => t.id !== todo.id)),
          error: (err) => this.error.set(err.message),
        });
      }
    });
  }

  trackById(index: number, todo: Todo) {
    return todo.id;
  }
}
