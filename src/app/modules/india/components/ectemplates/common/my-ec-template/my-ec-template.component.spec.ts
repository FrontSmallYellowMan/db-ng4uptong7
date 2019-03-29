import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyEcTemplateComponent } from './my-ec-template.component';

describe('MyEcTemplateComponent', () => {
  let component: MyEcTemplateComponent;
  let fixture: ComponentFixture<MyEcTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyEcTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyEcTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
