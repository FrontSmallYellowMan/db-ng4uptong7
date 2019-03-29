import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScChangeComponent } from './sc-change.component';

describe('ScChangeComponent', () => {
  let component: ScChangeComponent;
  let fixture: ComponentFixture<ScChangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScChangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
