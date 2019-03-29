import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodotaskComponent } from './todotask.component';

describe('TodotaskComponent', () => {
  let component: TodotaskComponent;
  let fixture: ComponentFixture<TodotaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TodotaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodotaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
