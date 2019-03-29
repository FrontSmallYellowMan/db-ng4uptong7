import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceQueryResultComponent } from './invoice-query-result.component';

describe('InvoiceQueryResultComponent', () => {
  let component: InvoiceQueryResultComponent;
  let fixture: ComponentFixture<InvoiceQueryResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceQueryResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceQueryResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
