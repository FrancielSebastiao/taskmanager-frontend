import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DeleteModalData } from '../../../core/model/delete-modal-data';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './delete-modal.html',
  styleUrl: './delete-modal.css',
})
export class DeleteModal {
  constructor(
    public dialogRef: MatDialogRef<DeleteModal>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteModalData
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  onDeleteClick(): void {
    this.dialogRef.close(this.data.id);
  }
}
