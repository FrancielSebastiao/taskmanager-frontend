// task-card-skeleton.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TaskCardSkeletonComponent } from './task-card-skeleton.component';

@Component({
  selector: 'app-task-skeleton',
  standalone: true,
  imports: [CommonModule, MatCardModule, TaskCardSkeletonComponent],
  templateUrl: './tasks-skeleton.component.html',
  styleUrls: ['./skeleton.scss'],
})
export class TaskSkeletonComponent {

}
