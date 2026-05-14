export interface TaskCommentResponse {
    id: string;
    taskId: string;
    taskTitle: string;
    authorName: string;
    category: string;
    categoryLabel: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}
