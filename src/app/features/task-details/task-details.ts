import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TaskDetailResponse } from '../../core/model/task-detail-response';
import { TaskCommentDetailDto } from '../../core/model/task-comment-detail-dto';
import { TaskActivityDto } from '../../core/model/task-activity-dto';
import { AssigneeDetailDto } from '../../core/model/assignee-detail-dto';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskDetailService } from '../../core/services/task-detail-service';
import { TaskImageDto } from '../../core/model/task-image-dto';
import { TaskFileDto } from '../../core/model/task-file-dto';
import { PagedResponse } from '../../core/model/paged-response';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Team } from '../../core/model/team';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSliderModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css',
})
export class TaskDetails implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
    
  showShareDialog = false;
  newComment = '';
  shareLink = 'https://app.nic.ao/tasks/12345';

  currentUser = {
    initials: '',
    color: '',
  };

  // -----------------------------------------------------------------------
  // Estado Principal
  // -----------------------------------------------------------------------
  task: TaskDetailResponse | null = null;
  loadingMain = true;
  errorMain = '';

  // -----------------------------------------------------------------------
  // Comments
  // -----------------------------------------------------------------------
  comments: TaskCommentDetailDto[] = [];
  commentsPage = 0;
  commentsTotal = 0;
  commentsTotalPages = 0;
  loadingComments = false;

  // -----------------------------------------------------------------------
  // Activities
  // -----------------------------------------------------------------------
  activityLog: TaskActivityDto[] = [];
  activitiesPage = 0;
  activitiesTotal = 0;
  activitiesTotalPages = 0;
  loadingActivities = false;

  // -----------------------------------------------------------------------
  // Assignees
  // -----------------------------------------------------------------------
  teamMembers: AssigneeDetailDto[] = [];
  assigneesPage = 0;
  assigneesTotal = 0;
  assigneesTotalPages = 0;
  loadingAssignees = false;

  // -----------------------------------------------------------------------
  // Images
  // -----------------------------------------------------------------------
  images: TaskImageDto[] = [];
  imagesPage = 0;
  imagesTotal = 0;
  imagesTotalPages = 0;
  loadingImages = false;

  // -----------------------------------------------------------------------
  // Files
  // -----------------------------------------------------------------------
  files: TaskFileDto[] = [];
  filesPage = 0;
  filesTotal = 0;
  filesTotalPages = 0;
  loadingFiles = false;

  progress = 0;

  private taskId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskDetailService: TaskDetailService,
    private cd: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.taskId) {
      this.router.navigate(['/tasks']);
      return;
    }

    this.loadDetail();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  get currentUserColor(): string {
    return this.currentUser.color;
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      'Em Progresso': 'chip--progress',
      'Concluída': 'chip--done',
      'Pendente': 'chip--pending',
    };
    return map[status] ?? '';
  }

  priorityClass(priority: string): string {
    const map: Record<string, string> = {
      'Alta': 'chip--high',
      'Média': 'chip--medium',
      'Baixa': 'chip--low',
    };
    return map[priority] ?? '';
  }

  statusIconBgClass(status: string): string {
    const map: Record<string, string> = {
      'Em Progresso': 'icon-bg--blue',
      'Concluída': 'icon-bg--green',
      'Pendente': 'icon-bg--amber',
    };
    return map[status] ?? '';
  }

  statusIconColorClass(status: string): string {
    const map: Record<string, string> = {
      'Em Progresso': 'icon--blue',
      'Concluída': 'icon--green',
      'Pendente': 'icon--amber',
    };
    return map[status] ?? '';
  }

  progressColor(progress: number): string {
    if (progress === 100) return '#22c55e';
    if (progress >= 50) return '#3d5af1';
    if (progress > 0) return '#f59e0b';
    return '#e2e8f0';
  }

  updateProgress(value: number): void {
    if (!this.task) return;
    this.task.progressPercent = value;
  }

  onProgressChange(): void {
    if (!this.task) return;

    const value = Math.max(0, Math.min(100, this.task.progressPercent));

    this.taskDetailService.updateProgress(this.taskId, { progressPercent: value }).subscribe({
      next: (res) => {
        console.log("SUCCESS");
        if (this.task) this.task.progressPercent = res.progressPercent;
      },
      error: () => {
        console.error("ERROR UPDATING PROGRESS");
      }
    });
  }

  onImageUpload(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Handle image upload
      console.log('Uploading images:', files);
    }
  }

  viewImage(img: TaskImageDto): void {
    console.log('Viewing image:', img);
  }

  downloadImage(img: TaskImageDto): void {
    console.log('Downloading image:', img);
  }

  deleteImage(img: TaskImageDto): void {
    if (!this.task) return;
    const index = this.images.findIndex(i => i.id === img.id);
    if (index > -1) {
      this.images.splice(index, 1);
    }
  }

  postComment(): void {
    // if (this.newComment.trim()) {
    //   const newCommentObj: Comment = {
    //     id: this.comments.length + 1,
    //     userName: 'Você',
    //     userInitials: this.currentUser.initials,
    //     userColor: this.currentUser.color,
    //     text: this.newComment,
    //     time: 'Agora',
    //   };
    //   this.comments.unshift(newCommentObj);
    //   this.newComment = '';
    // }
  }

  openShareDialog(): void {
    this.showShareDialog = true;
  }

  closeShareDialog(): void {
    this.showShareDialog = false;
  }

  copyLink(input: HTMLInputElement): void {
    input.select();
    document.execCommand('copy');
  }

  shareViaEmail(): void {
    if (!this.task) return;
    const subject = encodeURIComponent(`Atividade: ${this.task.title}`);
    const body = encodeURIComponent(`Confira esta atividade: ${this.shareLink}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  }

  shareViaWhatsApp(): void {
    if (!this.task) return;
    const text = encodeURIComponent(`Atividade: ${this.task.title}\n${this.shareLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  shareViaTelegram(): void {
    if (!this.task) return;
    const text = encodeURIComponent(`Atividade: ${this.task.title}\n${this.shareLink}`);
    window.open(`https://t.me/share/url?url=${this.shareLink}&text=${text}`, '_blank');
  }

  shareViaTeams(): void {
    const text = encodeURIComponent(this.shareLink);
    window.open(`https://teams.microsoft.com/share?msgText=${text}`, '_blank');
  }

  sendShare(): void {
    // Handle sending share to selected team members
    console.log('Sharing with selected members');
    this.closeShareDialog();
  }

  loadDetail(): void {
    this.loadingMain = true;
    this.errorMain = '';
    
    this.taskDetailService.getDetail(this.taskId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('DATA RECEIVED: ', data);
          this.task = data;
          this.progress = data.progressPercent;
          this.loadingMain = false;
          this.cd.detectChanges();
    
          this.appendPage(data.assignees, 'assignees');
          this.appendPage(data.images, 'images');
          this.appendPage(data.attachments, 'attachments');
          this.appendPage(data.comments, 'comments');
          this.appendPage(data.activityLog, 'activityLog');
        },
        error: (err) => {
          console.error('ERROR FETCHING TASK DETAILS');
          this.loadingMain = false;
          this.errorMain = err?.error?.message ?? 'Erro ao carregar tarefa.';
        }
    });
  }

  loadMoreAssignees(): void {
    if (this.loadingAssignees || this.assigneesPage + 1 >= this.assigneesTotalPages) return;
    this.loadingAssignees = true;

    this.taskDetailService.getAssignees(this.taskId, this.assigneesPage + 1)
      .pipe(takeUntil(this.destroy$), finalize(() => this.loadingAssignees = false))
      .subscribe({
        next: (page) => {
          this.assigneesPage++;
          this.appendPage(page, 'assignees');
          this.cd.detectChanges();
        },
      });
  }

  loadMoreImages(): void {
    if (this.loadingImages || this.imagesPage + 1 >= this.imagesTotalPages) return;
    this.loadingImages = true;

    this.taskDetailService.getTaskImages(this.taskId, this.imagesPage + 1)
      .pipe(takeUntil(this.destroy$), finalize(() => this.loadingImages = false))
      .subscribe({
        next: (page) => {
          this.imagesPage++;
          this.appendPage(page, 'images');
          this.cd.detectChanges();
        },
      });
  }

  loadMoreFiles(): void {
    if (this.loadingFiles || this.filesPage + 1 >= this.filesTotalPages) return;
    this.loadingFiles = true;

    this.taskDetailService.getTaskFiles(this.taskId, this.filesPage + 1)
      .pipe(takeUntil(this.destroy$), finalize(() => this.loadingFiles = false))
      .subscribe({
        next: (page) => {
          this.filesPage++;
          this.appendPage(page, 'attachments');
          this.cd.detectChanges();
        },
      });
  }

  loadMoreComments(): void {
    if (this.loadingComments || this.commentsPage + 1 >= this.commentsTotalPages) return;
    this.loadingComments = true;

    this.taskDetailService.getComments(this.taskId, this.commentsPage + 1)
      .pipe(takeUntil(this.destroy$), finalize(() => this.loadingComments = false))
      .subscribe({
        next: (page) => {
          this.commentsPage++;
          this.appendPage(page, 'comments');
          this.cd.detectChanges();
        },
      });
  }

  loadMoreActivities(): void {
      if (this.loadingActivities || this.activitiesPage + 1 >= this.activitiesTotalPages) return;
      this.loadingActivities = true;
  
      this.taskDetailService.getActivities(this.taskId, this.activitiesPage + 1)
        .pipe(takeUntil(this.destroy$), finalize(() => this.loadingActivities = false))
        .subscribe({
          next: (page) => {
            this.activitiesPage++;
            this.appendPage(page, 'activityLog');
            this.cd.detectChanges();
          },
        });
    }

  private appendPage(page: PagedResponse<any>, section: 'assignees' | 'activityLog' | 'attachments' | 'images' | 'comments'): void {
      switch (section) {
        case 'assignees':
          this.teamMembers = [...this.teamMembers, ...page.content];
          this.assigneesTotal = page.totalElements;
          this.assigneesTotalPages = page.totalPages;
          break;
        case 'activityLog':
          this.activityLog = [...this.activityLog, ...page.content];
          this.activitiesTotal = page.totalElements;
          this.activitiesTotalPages = page.totalPages;
          break;
        case 'images':
          this.images = [...this.images, ...page.content];
          this.imagesTotal = page.totalElements;
          this.imagesTotalPages = page.totalPages;
          break;
        case 'attachments':
          this.files = [...this.files, ...page.content];
          this.filesTotal = page.totalElements;
          this.filesTotalPages = page.totalPages;
          break;
        case 'comments':
          this.comments = [...this.comments, ...page.content];
          this.commentsTotal = page.totalElements;
          this.commentsTotalPages = page.totalPages;
          break;
      }
    }

  get hasMoreImages(): boolean { return this.imagesPage + 1 < this.imagesTotalPages; }
  get hasMoreActivities(): boolean { return this.activitiesPage + 1 < this.activitiesTotalPages; }
  get hasMoreAssignees(): boolean { return this.assigneesPage + 1 < this.assigneesTotalPages; }
  get hasMoreFiles(): boolean { return this.filesPage + 1 < this.filesTotalPages; } 
  get hasMoreComments(): boolean { return this.commentsPage + 1 < this.commentsTotalPages; }
}