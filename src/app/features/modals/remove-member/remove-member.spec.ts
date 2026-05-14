import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveMember } from './remove-member';

describe('RemoveMember', () => {
  let component: RemoveMember;
  let fixture: ComponentFixture<RemoveMember>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoveMember],
    }).compileComponents();

    fixture = TestBed.createComponent(RemoveMember);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
