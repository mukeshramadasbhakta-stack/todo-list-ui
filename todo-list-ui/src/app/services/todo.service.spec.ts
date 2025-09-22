import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpHeaders } from '@angular/common/http';
import { TodoService } from './todo.service';
import { Todo } from '../models/todo.model';

describe('TodoService', () => {
  let service: TodoService;
  let httpMock: HttpTestingController;

  const API_URL = 'http://localhost:5105/todo';
  const apiKeyHeader = 'x-api-key';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TodoService],
    });

    service = TestBed.inject(TodoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll should GET todos with api key header', () => {
    const mock: Todo[] = [
      { id: '1', title: 'A', appointment: '2024-01-01T10:00:00Z' },
      { id: '2', title: 'B', appointment: '2024-01-02T10:00:00Z' },
    ];

    let result: Todo[] | undefined;
    service.getAll().subscribe((data) => (result = data));

    const req = httpMock.expectOne(`${API_URL}/getAll`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.has(apiKeyHeader)).toBeTrue();

    req.flush(mock);
    expect(result).toEqual(mock);
  });

  it('get should GET by id with api key header', () => {
    const mock: Todo = { id: '42', title: 'Answer', appointment: '2024-01-03T10:00:00Z' };
    let result: Todo | undefined;

    service.get('42').subscribe((data) => (result = data));
    const req = httpMock.expectOne(`${API_URL}?id=42`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.has(apiKeyHeader)).toBeTrue();

    req.flush(mock);
    expect(result).toEqual(mock);
  });

  it('upsert should POST todo and return id as string', () => {
    const input: Todo = { id: undefined, title: 'New', appointment: '2024-02-01T09:00:00Z' };
    let result: string | undefined;

    service.upsert(input).subscribe((id) => (result = id));
    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(input as any);
    expect(req.request.headers.has(apiKeyHeader)).toBeTrue();

    req.flush('new-id');
    expect(result).toBe('new-id');
  });

  it('delete should DELETE by id', () => {
    let completed = false;

    service.delete('7').subscribe({
      next: () => {},
      complete: () => (completed = true),
    });

    const req = httpMock.expectOne(`${API_URL}?id=7`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.has(apiKeyHeader)).toBeTrue();

    req.flush(null);
    expect(completed).toBeTrue();
  });

  it('should map http errors to Error with message in getAll', (done) => {
    service.getAll().subscribe({
      next: () => fail('expected error'),
      error: (err: Error) => {
        expect(err).toBeTruthy();
        expect(err.message).toBeTruthy();
        done();
      },
    });

    const req = httpMock.expectOne(`${API_URL}/getAll`);
    req.flush({ message: 'Failed to fetch items' }, { status: 500, statusText: 'Server Error' });
  });

  it('should map http errors to Error with message in upsert', (done) => {
    const todo: Todo = { id: 'x', title: 'X', appointment: '2024-03-01T10:00:00Z' };

    service.upsert(todo).subscribe({
      next: () => fail('expected error'),
      error: (err: Error) => {
        expect(err).toBeTruthy();
        expect(err.message).toBeTruthy();
        done();
      },
    });

    const req = httpMock.expectOne(API_URL);
    req.flush({ message: 'Failed to upsert' }, { status: 400, statusText: 'Bad Request' });
  });
});
