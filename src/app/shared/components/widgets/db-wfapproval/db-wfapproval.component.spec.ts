import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbWfapprovalComponent } from './db-wfapproval.component';

describe('DbWfapprovalComponent', () => {
  let component: DbWfapprovalComponent;
  let fixture: ComponentFixture<DbWfapprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbWfapprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbWfapprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
