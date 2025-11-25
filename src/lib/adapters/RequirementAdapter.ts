import { Requirement as DomainRequirement } from "@/smartspecs/lib/domain";
import { Requirement as AppRequirement, Status as AppStatus, Priority } from "@/smartspecs/app-lib/interfaces/requirement";
import { Status as DomainStatus } from "@/smartspecs/lib/domain/entities/Status";
import { Timestamp } from "firebase/firestore";

export class RequirementAdapter {
  static toDomain(appRequirement: AppRequirement): DomainRequirement {
    return {
      id: appRequirement.id,
      projectId: appRequirement.projectId,
      title: appRequirement.title,
      description: appRequirement.description,
      createdAt: Timestamp.fromDate(new Date(appRequirement.createdAt)),
      updatedAt: Timestamp.fromDate(new Date(appRequirement.updatedAt)),
      clientRepName: appRequirement.responsible || "",
      source: (appRequirement.origin || "text") as "text" | "audio" | "integration",
      status: appRequirement.status as DomainStatus,
      priority: appRequirement.priority,
      reason: appRequirement.reason,
      tags: appRequirement.tags || [],
      items: [],
      audioUrl: undefined,
      text: undefined,
      integration: undefined,
      transcription: undefined,
    };
  }

  static toApp(domainRequirement: DomainRequirement): AppRequirement {
    return {
      id: domainRequirement.id,
      projectId: domainRequirement.projectId,
      title: domainRequirement.title,
      description: domainRequirement.description,
      createdAt: domainRequirement.createdAt.toDate().toISOString(),
      updatedAt: domainRequirement.updatedAt.toDate().toISOString(),
      responsible: domainRequirement.clientRepName,
      origin: domainRequirement.source,
      reason: domainRequirement.reason || "",
      status: domainRequirement.status as AppStatus,
      priority: domainRequirement.priority,
      tags: domainRequirement.tags || [],
    };
  }
} 