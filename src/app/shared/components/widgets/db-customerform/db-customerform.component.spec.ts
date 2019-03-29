import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbCustomerformComponent } from './db-customerform.component';

describe('DbCustomerformComponent', () => {
  let component: DbCustomerformComponent;
  let fixture: ComponentFixture<DbCustomerformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbCustomerformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbCustomerformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
