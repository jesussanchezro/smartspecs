export enum Status {
    IN_PROGRESS = "in progress",
    DONE = "done",
    PENDING = "pending",
    REJECTED = "rejected",
}

export enum Priority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
}

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
}