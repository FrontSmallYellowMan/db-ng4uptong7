import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScListComponent } from './sc-list.component';

describe('ScListComponent', () => {
  let component: ScListComponent;
  let fixture: ComponentFixture<ScListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
