import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Todo } from '../models/todo.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private apiUrl = environment.apiUrl;
  private readonly apiKey = environment.apiKey;

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
      .post<string>(`${this.apiUrl}`, todo, this.opts())
      .pipe(catchError((err) => throwError(() => new Error(err.message || 'Failed to upsert'))));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}?id=${id}`, this.opts())
      .pipe(catchError((err) => throwError(() => new Error(err.message || 'Failed to delete'))));
  }
}
