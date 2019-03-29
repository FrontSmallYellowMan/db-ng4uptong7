import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PcViewComponent } from './pc-view.component';

describe('PcViewComponent', () => {
  let component: PcViewComponent;
  let fixture: ComponentFixture<PcViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PcViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PcViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
