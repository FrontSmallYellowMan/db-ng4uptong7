import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadtitleComponent } from './headtitle.component';

describe('HeadtitleComponent', () => {
  let component: HeadtitleComponent;
  let fixture: ComponentFixture<HeadtitleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeadtitleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeadtitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
