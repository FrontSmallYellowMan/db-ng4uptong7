import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectSearchBuyerComponent } from './select-search-buyer.component';

describe('SelectSearchBuyerComponent', () => {
  let component: SelectSearchBuyerComponent;
  let fixture: ComponentFixture<SelectSearchBuyerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectSearchBuyerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectSearchBuyerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
