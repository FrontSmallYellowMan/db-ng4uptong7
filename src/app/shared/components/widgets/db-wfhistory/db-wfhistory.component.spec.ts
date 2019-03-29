import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbWfhistoryComponent } from './db-wfhistory.component';

describe('DbWfhistoryComponent', () => {
  let component: DbWfhistoryComponent;
  let fixture: ComponentFixture<DbWfhistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbWfhistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbWfhistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
