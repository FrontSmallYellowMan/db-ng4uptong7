import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScNoticeModalComponent } from './sc-notice-modal.component';

describe('ScNoticeModalComponent', () => {
  let component: ScNoticeModalComponent;
  let fixture: ComponentFixture<ScNoticeModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScNoticeModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScNoticeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
