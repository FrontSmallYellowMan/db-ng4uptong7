import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcHardwareComponent } from './ec-hardware.component';

describe('EcHardwareComponent', () => {
  let component: EcHardwareComponent;
  let fixture: ComponentFixture<EcHardwareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcHardwareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcHardwareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
