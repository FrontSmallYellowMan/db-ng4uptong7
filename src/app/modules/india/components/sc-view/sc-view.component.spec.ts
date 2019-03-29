import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScViewComponent } from './sc-view.component';

describe('ScViewComponent', () => {
  let component: ScViewComponent;
  let fixture: ComponentFixture<ScViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
