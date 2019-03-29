import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyModulesComponent } from './apply-modules.component';

describe('ApplyModulesComponent', () => {
  let component: ApplyModulesComponent;
  let fixture: ComponentFixture<ApplyModulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplyModulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplyModulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
