export enum Status {
    IN_PROGRESS = "in progress",
    TO_DO = "to do",
    DONE = "done",
    PENDING = "pending",
    REJECTED = "rejected",
}

export enum Priority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
}

export type RequirementAction = 'approve' | 'reject' | 'refine' | null;

export interface Requirement {
    id: string;
    projectId: string;
    title: string;
    description: string;
    priority: Priority;
    status: Status;
    responsible?: string;   // ✅ nuevo
    reason?: string;        // ✅ nuevo
    origin?: string;        // ✅ nuevo
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}