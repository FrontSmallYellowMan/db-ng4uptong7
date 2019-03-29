import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScRelieveComponent } from './sc-relieve.component';

describe('ScRelieveComponent', () => {
  let component: ScRelieveComponent;
  let fixture: ComponentFixture<ScRelieveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScRelieveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScRelieveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
