import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndiaMainComponent } from './india-main.component';

describe('IndiaMainComponent', () => {
  let component: IndiaMainComponent;
  let fixture: ComponentFixture<IndiaMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndiaMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndiaMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
