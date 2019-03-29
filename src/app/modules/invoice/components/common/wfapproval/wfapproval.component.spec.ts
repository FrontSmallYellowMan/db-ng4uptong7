import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WfapprovalComponent } from './wfapproval.component';

describe('WfapprovalComponent', () => {
  let component: WfapprovalComponent;
  let fixture: ComponentFixture<WfapprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WfapprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WfapprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
