import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevokedListComponent } from './revoked-list.component';

describe('RevokedListComponent', () => {
  let component: RevokedListComponent;
  let fixture: ComponentFixture<RevokedListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RevokedListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevokedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
