import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevokedApplyComponent } from './revoked-apply.component';

describe('RevokedApplyComponent', () => {
  let component: RevokedApplyComponent;
  let fixture: ComponentFixture<RevokedApplyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RevokedApplyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevokedApplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
