import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface Todo {
  id: string;
  title: string;
  completed?: boolean;
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  // TODO: add these to config
  private apiUrl = 'http://localhost:5105/todo';
  private readonly apiKey = 'B9680321-3913-499B-87AB-C4CE4A7E435D';

  private opts(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        'x-api-key': this.apiKey,
      }),
    };
  }

  constructor(private http: HttpClient) {}

  getAll(): Observable<Todo[]> {
    return this.http
      .get<Todo[]>(`${this.apiUrl}/getAll`, this.opts())
      .pipe(
        catchError((err) => throwError(() => new Error(err.message || 'Failed to fetch items'))),
      );
  }

  get(id: string): Observable<Todo> {
    return this.http
      .get<Todo>(`${this.apiUrl}?id=${id}`, this.opts())
      .pipe(
        catchError((err) => throwError(() => new Error(err.message || 'Failed to fetch item'))),
      );
  }

  upsert(todo: Todo): Observable<string> {
    return this.http
      .post<string>(`${this.apiUrl}`, { todo }, this.opts())
      .pipe(catchError((err) => throwError(() => new Error(err.message || 'Failed to upsert'))));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}?id=${id}`, this.opts())
      .pipe(catchError((err) => throwError(() => new Error(err.message || 'Failed to delete'))));
  }
}
