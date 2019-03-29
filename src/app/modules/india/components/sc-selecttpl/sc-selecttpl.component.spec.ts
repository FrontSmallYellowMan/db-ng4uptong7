import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScSelecttplComponent } from './sc-selecttpl.component';

describe('ScSelecttplComponent', () => {
  let component: ScSelecttplComponent;
  let fixture: ComponentFixture<ScSelecttplComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScSelecttplComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScSelecttplComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
