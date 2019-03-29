import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceinfoComponent } from './financeinfo.component';

describe('FinanceinfoComponent', () => {
  let component: FinanceinfoComponent;
  let fixture: ComponentFixture<FinanceinfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinanceinfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
