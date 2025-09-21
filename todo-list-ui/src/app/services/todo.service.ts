import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo } from '../models/todo.model';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http: HttpClient = inject(HttpClient);

  // Update the port if your backend exposes a different one
  private readonly baseUrl = 'http://localhost:5105/todo';
  private readonly apiKey = "B9680321-3913-499B-87AB-C4CE4A7E435D";

  private opts() : {headers: HttpHeaders} {
    return {
      headers: new HttpHeaders({
        'x-api-key': this.apiKey
      })
    };
  }

  list(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.baseUrl + '/getAll', this.opts());
  }

  get(id: string): Observable<Todo> {
    return this.http.get<Todo>(this.baseUrl + '?id=' + id, this.opts());
  }

  add(todo: Todo): Observable<Todo> {
    return this.http.post<Todo>(this.baseUrl, { todo }, this.opts());
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.opts());
  }
}
