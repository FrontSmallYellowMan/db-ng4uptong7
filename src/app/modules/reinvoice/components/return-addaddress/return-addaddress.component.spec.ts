import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnAddaddressComponent } from './return-addaddress.component';

describe('ReturnAddaddressComponent', () => {
  let component: ReturnAddaddressComponent;
  let fixture: ComponentFixture<ReturnAddaddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReturnAddaddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReturnAddaddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
