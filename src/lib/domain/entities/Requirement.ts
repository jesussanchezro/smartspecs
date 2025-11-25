import { Timestamp } from "firebase/firestore";
import { RequirementItem } from "./RequirementItem";
import { Status } from "./Status";
import { Priority } from "@/smartspecs/app-lib/interfaces/requirement";

export type Requirement = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: Status;
  clientRepName?: string;
  source?: "audio" | "text" | "integration";
  audioUrl?: string;
  text?: string;
  integration?: {
    id: string;
    name: string;
  };
  transcription?: string;
  items?: RequirementItem[];
  priority: Priority;
  reason?: string;
  tags?: string[];
};
