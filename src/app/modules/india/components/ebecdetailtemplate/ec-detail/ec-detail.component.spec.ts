import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcDetailComponent } from './ec-detail.component';

describe('EcDetailComponent', () => {
  let component: EcDetailComponent;
  let fixture: ComponentFixture<EcDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
