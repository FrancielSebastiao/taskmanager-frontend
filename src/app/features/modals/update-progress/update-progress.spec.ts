import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateProgress } from './update-progress';

describe('UpdateProgress', () => {
  let component: UpdateProgress;
  let fixture: ComponentFixture<UpdateProgress>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateProgress],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateProgress);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
