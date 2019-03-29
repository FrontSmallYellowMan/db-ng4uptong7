import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbWfviewComponent } from './db-wfview.component';

describe('DbWfviewComponent', () => {
  let component: DbWfviewComponent;
  let fixture: ComponentFixture<DbWfviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbWfviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbWfviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
