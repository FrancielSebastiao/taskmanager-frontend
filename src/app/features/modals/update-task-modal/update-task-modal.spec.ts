import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTaskModal } from './update-task-modal';

describe('UpdateTaskModal', () => {
  let component: UpdateTaskModal;
  let fixture: ComponentFixture<UpdateTaskModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateTaskModal],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateTaskModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
