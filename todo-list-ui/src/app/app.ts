import {Component, OnInit, signal} from '@angular/core';
import {TodoList} from './components/todo-list/todo-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TodoList, TodoList],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit{
  protected readonly title = signal('todo-list-ui');

  constructor() {}
  ngOnInit(): void {
  }
}
