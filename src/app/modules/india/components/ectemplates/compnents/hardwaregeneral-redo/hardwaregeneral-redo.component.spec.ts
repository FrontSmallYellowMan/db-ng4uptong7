import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HardwaregeneralRedoComponent } from './hardwaregeneral-redo.component';

describe('HardwaregeneralRedoComponent', () => {
  let component: HardwaregeneralRedoComponent;
  let fixture: ComponentFixture<HardwaregeneralRedoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HardwaregeneralRedoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HardwaregeneralRedoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
