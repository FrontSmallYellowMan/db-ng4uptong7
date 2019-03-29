import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScWfApprovalComponent } from './sc-wf-approval.component';

describe('ScWfApprovalComponent', () => {
  let component: ScWfApprovalComponent;
  let fixture: ComponentFixture<ScWfApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScWfApprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScWfApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
