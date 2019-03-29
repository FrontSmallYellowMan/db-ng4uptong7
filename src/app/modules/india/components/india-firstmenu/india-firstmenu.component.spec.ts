import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndiaFirstmenuComponent } from './india-firstmenu.component';

describe('IndiaFirstmenuComponent', () => {
  let component: IndiaFirstmenuComponent;
  let fixture: ComponentFixture<IndiaFirstmenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndiaFirstmenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndiaFirstmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
