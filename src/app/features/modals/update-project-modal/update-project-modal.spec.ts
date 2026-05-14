import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateProjectModal } from './update-project-modal';

describe('UpdateProjectModal', () => {
  let component: UpdateProjectModal;
  let fixture: ComponentFixture<UpdateProjectModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateProjectModal],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateProjectModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
