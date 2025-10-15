export interface Project {
    id: string;
    title: string;
    client: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    userId?: string;
}