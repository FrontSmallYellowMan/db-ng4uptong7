import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContplCreatComponent } from './contpl-creat.component';

describe('ContplCreatComponent', () => {
  let component: ContplCreatComponent;
  let fixture: ComponentFixture<ContplCreatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContplCreatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContplCreatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
