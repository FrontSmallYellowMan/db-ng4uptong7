import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScCreatComponent } from './sc-creat.component';

describe('ScCreatComponent', () => {
  let component: ScCreatComponent;
  let fixture: ComponentFixture<ScCreatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScCreatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScCreatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
