import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {AsyncPipe, CommonModule} from '@angular/common';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../models/todo.model';
import {SpinnerComponent} from '../spinner/spinner.component';
import {SpinnerService} from '../../services/spinner.service';


@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AsyncPipe,
    SpinnerComponent
  ],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.css'
})
export class TodoList {
  private readonly api = inject(TodoService);

  todos = signal<Todo[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  newTitle = '';

  constructor(public spinnerService: SpinnerService) {
    this.load();
  }

  load(): void {
    this.spinnerService.show();
    this.loading.set(true);
    this.error.set(null);
    this.api.list().subscribe({
      next: items => {
        this.todos.set(items);
        this.loading.set(false);
      },
      error: err => {
        this.error.set('Failed to load TODOs');
        console.error(err);
        this.loading.set(false);
        this.spinnerService.hide()
      },
      complete: () => {
        this.spinnerService.hide()
      },
    });
  }

  canAdd = computed(() => this.newTitle.trim().length > 0);

  onAdd(): void {
    // const todo : new Todo(){}; // this.newTitle.trim();
    // if (!todo) return;
    //
    // this.api.add(todo).subscribe({
    //   next: created => {
    //     this.todos.update(list => [...list, created]);
    //     this.newTitle = '';
    //   },
    //   error: err => {
    //     this.error.set('Failed to add TODO');
    //     console.error(err);
    //   },
    // });
  }

  onDelete(id: string): void {
    this.spinnerService.show();
    this.api.delete(id).subscribe({
      next: () => {
        this.todos.update(list => list.filter(i => i.id !== id));
      },
      error: err => {
        this.error.set('Failed to delete TODO');
        console.error(err);
        this.spinnerService.hide()
      },
      complete: () => {
        this.spinnerService.hide()
      },
    });
  }

  trackById(_: number, item: Todo) {
    return item.id;
  }
}
