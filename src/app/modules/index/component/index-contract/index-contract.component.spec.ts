import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexContractComponent } from './index-contract.component';

describe('IndexContractComponent', () => {
  let component: IndexContractComponent;
  let fixture: ComponentFixture<IndexContractComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndexContractComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndexContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
