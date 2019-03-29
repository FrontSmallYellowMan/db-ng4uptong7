import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseinfoComponent } from './baseinfo.component';

describe('BaseinfoComponent', () => {
  let component: BaseinfoComponent;
  let fixture: ComponentFixture<BaseinfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseinfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
