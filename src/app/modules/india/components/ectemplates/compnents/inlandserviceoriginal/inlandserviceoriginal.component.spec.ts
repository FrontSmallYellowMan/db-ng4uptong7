import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlandserviceoriginalComponent } from './inlandserviceoriginal.component';

describe('InlandserviceoriginalComponent', () => {
  let component: InlandserviceoriginalComponent;
  let fixture: ComponentFixture<InlandserviceoriginalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlandserviceoriginalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlandserviceoriginalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
