export enum Status {
  IN_PROGRESS = "in progress",
  TO_DO = "to do",
  DONE = "done",
  PENDING = "pending",
}

export function stringToStatus(status: string): Status {
  switch (status) {
    case "in progress":
      return Status.IN_PROGRESS;
    case "done":
      return Status.DONE;
    case "pending":
      return Status.PENDING;
    default:
      return Status.IN_PROGRESS;
  }
}

export function colorByStatus(status: Status): string {
  switch (status) {
    case Status.IN_PROGRESS:
      return "blue";
    case Status.DONE:
      return "green";
    case Status.PENDING:
      return "orange";
    default:
      return "blue";
  }
}
