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
import { Todo } from '../../models/todo.model';
import { OnDestroy, OnInit } from '@angular/core';
import { interval, Subject, switchMap, takeUntil } from 'rxjs';

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
export class TodoListComponent implements OnInit, OnDestroy {
  todos = signal<Todo[]>([]);
  searchTerm = signal('');
  loading = signal(false);
  error = signal('');
  private destroy$ = new Subject<void>();

  // Pagination state
  pageIndex = signal(0); // zero-based
  pageSize = signal(10);
  totalItems = signal(0);

  constructor(
    private todoService: TodoService,
    private dialog: MatDialog,
  ) {
    this.loadTodos();
  }

  ngOnInit(): void {
    // Poll every 15s
    interval(15000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.todoService.getAll()),
      )
      .subscribe({
        next: (data) => {
          this.todos.set(data);
          this.updateTotalItems();
          this.ensurePageInRange();
        },
        error: (err) => this.error.set(err.message || 'Failed to load TODOs'),
      });

    const onVisibility = () => {
      if (document.visibilityState === 'visible') this.loadTodos();
    };
    document.addEventListener('visibilitychange', onVisibility);
    (this as any)._onVisibility = onVisibility;

    // Reset to first page when search term changes
    const origSet = this.searchTerm.set.bind(this.searchTerm);
    this.searchTerm.set = (v: string) => {
      origSet(v);
      this.pageIndex.set(0);
      this.updateTotalItems();
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if ((this as any)._onVisibility) {
      document.removeEventListener('visibilitychange', (this as any)._onVisibility);
    }
  }

  // Filtered by search
  get filteredTodos() {
    const term = this.searchTerm().toLowerCase();
    const items = this.todos().filter((todo) => todo.title?.toLowerCase().includes(term));
    // Keep totalItems in sync
    if (this.totalItems() !== items.length) {
      this.totalItems.set(items.length);
      this.ensurePageInRange();
    }
    return items;
  }

  // Current page slice
  get pagedTodos(): Todo[] {
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredTodos.slice(start, end);
  }

  get totalPages(): number {
    const size = this.pageSize();
    return size > 0 ? Math.max(1, Math.ceil(this.totalItems() / size)) : 1;
  }

  private ensurePageInRange(): void {
    const lastIndex = Math.max(0, this.totalPages - 1);
    if (this.pageIndex() > lastIndex) this.pageIndex.set(lastIndex);
  }

  private updateTotalItems(): void {
    this.totalItems.set(this.filteredTodos.length);
    this.ensurePageInRange();
  }

  loadTodos() {
    this.loading.set(true);
    this.todoService.getAll().subscribe({
      next: (data) => {
        this.todos.set(data);
        this.updateTotalItems();
      },
      error: (err) => this.error.set(err.message || 'Failed to load TODOs'),
      complete: () => this.loading.set(false),
    });
  }

  private saveDataAndRefresh(data: any) {
    this.todoService.upsert(data).subscribe({
      next: () => {
        this.todoService.getAll().subscribe({
          next: (data) => {
            this.todos.set(data);
            this.updateTotalItems();
          },
          error: (err) => this.error.set(err.message),
        });
      },
      error: (err) => this.error.set(err.message),
    });
  }
  openAddDialog() {
    const dialogRef = this.dialog.open(TodoDialogComponent, {
      data: {
        id: undefined,
        title: '',
        // Preselect now + 30 minutes
        appointment: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      } as Todo,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.saveDataAndRefresh(result);
      }
    });
  }

  openEditDialog(todo: Todo) {
    const dialogRef = this.dialog.open(TodoDialogComponent, { data: { todo: todo } });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.saveDataAndRefresh(result);
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
          next: () => {
            this.todos.set(this.todos().filter((t) => t.id !== todo.id));
            this.updateTotalItems();
          },
          error: (err) => this.error.set(err.message),
        });
      }
    });
  }

  // Pagination controls
  firstPage(): void {
    this.pageIndex.set(0);
  }
  prevPage(): void {
    this.pageIndex.set(Math.max(0, this.pageIndex() - 1));
  }
  nextPage(): void {
    this.pageIndex.set(Math.min(this.totalPages - 1, this.pageIndex() + 1));
  }
  lastPage(): void {
    this.pageIndex.set(this.totalPages - 1);
  }
  changePageSize(size: number): void {
    const parsed = Number(size) || 10;
    this.pageSize.set(parsed);
    this.pageIndex.set(0);
    this.updateTotalItems();
  }

  trackById(index: number, todo: Todo) {
    return todo.id;
  }
}
