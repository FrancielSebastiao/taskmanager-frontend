export interface TaskCommentDetailDto {
    id: string;
    userName: string;
    userInitials: string;
    userColor: string;
    text: string;
    categoryLabel: string;
    timeRelative: string;
    attachmentName: string // null se sem anexo
    attachmentUrl: string; // null se sem anexo
}
