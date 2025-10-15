export interface Meeting {
    id: string;
    title: string;
    description: string;
    transcription: string;
    createdAt: string;
    updatedAt: string;
    projectId: string;
    deletedAt?: string;
}