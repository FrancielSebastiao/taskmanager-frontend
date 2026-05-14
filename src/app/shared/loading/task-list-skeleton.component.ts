// task-list-skeleton.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-task-list-skeleton',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './task-list-skeleton.component.html',
  styleUrls: ['./skeleton.scss'],
})
export class TaskListSkeletonComponent {
  // Controls how many skeleton rows to show
  skeletonRows = Array(8);
}
