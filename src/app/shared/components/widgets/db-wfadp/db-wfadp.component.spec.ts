import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbWfadpComponent } from './db-wfadp.component';

describe('DbWfadpComponent', () => {
  let component: DbWfadpComponent;
  let fixture: ComponentFixture<DbWfadpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbWfadpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbWfadpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
