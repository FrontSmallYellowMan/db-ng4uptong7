import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PcApplyComponent } from './pc-apply.component';

describe('PcApplyComponent', () => {
  let component: PcApplyComponent;
  let fixture: ComponentFixture<PcApplyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PcApplyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PcApplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
