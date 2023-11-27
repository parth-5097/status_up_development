import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionByUserIdComponent } from './submission-by-user-id.component';

describe('SubmissionByUserIdComponent', () => {
  let component: SubmissionByUserIdComponent;
  let fixture: ComponentFixture<SubmissionByUserIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmissionByUserIdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionByUserIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
