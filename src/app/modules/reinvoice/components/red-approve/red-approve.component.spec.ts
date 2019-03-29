import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedApplyComponent } from './red-apply.component';

describe('RedApplyComponent', () => {
  let component: RedApplyComponent;
  let fixture: ComponentFixture<RedApplyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RedApplyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedApplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
