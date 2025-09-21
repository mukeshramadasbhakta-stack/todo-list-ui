import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoListComponent } from './todo-list.component';
import { of } from 'rxjs';
import { Todo } from '../../models/todo.model';
import { TodoService } from '../../services/todo.service';

class MockTodoService {
  list = jasmine.createSpy().and.returnValue(of([{ id: '1', title: 'First' } as Todo]));
  add = jasmine.createSpy().and.returnValue(of({ id: '2', title: 'New' } as Todo));
  delete = jasmine.createSpy().and.returnValue(of(void 0));
}

describe('TodoList', () => {
  let component: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;
  let service: MockTodoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoListComponent],
      providers: [{ provide: TodoService, useClass: MockTodoService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoListComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(TodoService) as unknown as MockTodoService;
    fixture.detectChanges(); // triggers load()
  });

  it('loads items on init', () => {
    expect(service.list).toHaveBeenCalled();
    expect(component.todos().length).toBe(1);
  });

  it('adds item', () => {
    component.newTitle = 'New';
    component.onAdd();
    expect(service.add).toHaveBeenCalledWith('New');
  });

  it('deletes item', () => {
    component.onDelete('1');
    expect(service.delete).toHaveBeenCalledWith('1');
  });
});
