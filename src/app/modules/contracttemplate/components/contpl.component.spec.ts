import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContplComponent } from './contpl.component';

describe('ContplComponent', () => {
  let component: ContplComponent;
  let fixture: ComponentFixture<ContplComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContplComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContplComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
