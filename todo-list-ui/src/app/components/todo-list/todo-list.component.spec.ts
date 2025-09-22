import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TodoListComponent } from './todo-list.component';
import { TodoService } from '../../services/todo.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const mockTodos = Array.from({ length: 25 }).map((_, i) => ({
  id: String(i + 1),
  title: `Task ${i + 1}`,
  appointment: new Date().toISOString(),
}));

class TodoServiceStub {
  getAll = jasmine.createSpy('getAll').and.returnValue(of(mockTodos));
  upsert = jasmine.createSpy('upsert').and.returnValue(of('ok'));
  delete = jasmine.createSpy('delete').and.returnValue(of(void 0));
}

class MatDialogStub {
  open() {
    return { afterClosed: () => of(undefined) };
  }
}

describe('TodoListComponent', () => {
  let component: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;
  let todoService: TodoServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoListComponent, MatDialogModule, CommonModule, FormsModule],
      providers: [
        { provide: TodoService, useClass: TodoServiceStub },
        { provide: MatDialog, useClass: MatDialogStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoListComponent);
    component = fixture.componentInstance;
    todoService = TestBed.inject(TodoService) as unknown as TodoServiceStub;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(todoService.getAll).toHaveBeenCalled();
  });

  it('should compute filteredTodos by searchTerm', () => {
    component.searchTerm.set('task 2');
    const filtered = component.filteredTodos;
    expect(filtered.every((t) => t.title?.toLowerCase().includes('task 2'))).toBeTrue();
  });

  it('should initialize pagination values', () => {
    expect(component.pageIndex()).toBe(0);
    expect(component.pageSize()).toBe(10);
    expect(component.totalItems()).toBe(mockTodos.length);
  });

  it('should return pagedTodos of length pageSize for first page', () => {
    const page = component.pagedTodos;
    expect(page.length).toBe(10);
    expect(page[0].title).toBe('Task 1');
  });

  it('should navigate to next and last page correctly', () => {
    component.nextPage();
    expect(component.pageIndex()).toBe(1);
    component.lastPage();
    expect(component.pageIndex()).toBe(
      Math.ceil(component.totalItems() / component.pageSize()) - 1,
    );
  });

  it('should not go below first page on prevPage', () => {
    component.firstPage();
    component.prevPage();
    expect(component.pageIndex()).toBe(0);
  });

  it('should change page size and reset to first page', () => {
    component.pageIndex.set(2);
    component.changePageSize(5);
    expect(component.pageSize()).toBe(5);
    expect(component.pageIndex()).toBe(0);
    expect(component.pagedTodos.length).toBe(5);
  });

  it('should reset to first page when searchTerm changes', () => {
    component.pageIndex.set(2);
    component.searchTerm.set('Task 1');
    expect(component.pageIndex()).toBe(0);
  });

  it('should update totalItems after delete and keep page in range', () => {
    // Move to last page then delete one item
    component.lastPage();
    const beforeLastPageIndex = component.pageIndex();
    const lastItem = component.pagedTodos[component.pagedTodos.length - 1];
    (todoService.delete as any).and.returnValue(of(void 0));

    // simulate confirmDelete flow without dialog: call service then adjust state
    component['todos'].set(component['todos']().filter((t) => t.id !== lastItem.id));
    component['updateTotalItems']();

    expect(component.totalItems()).toBe(mockTodos.length - 1);
    expect(component.pageIndex()).toBeLessThanOrEqual(beforeLastPageIndex);
  });

  it('should set error on loadTodos failure', fakeAsync(() => {
    (todoService.getAll as any).and.returnValue(throwError(() => new Error('boom')));
    component.loadTodos();
    tick();
    expect(component.error()).toContain('boom');
    flush();
  }));
});
