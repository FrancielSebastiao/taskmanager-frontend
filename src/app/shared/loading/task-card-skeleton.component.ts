// task-card-skeleton.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-task-card-skeleton',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './task-card-skeleton.component.html',
  styleUrls: ['./skeleton.scss'],
})
export class TaskCardSkeletonComponent {
  // Controls how many skeleton cards to show — adjust to match your typical page size
  skeletonItems = Array(6);
}
