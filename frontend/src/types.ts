export type Status = "WAITING" | "INTERVIEWING" | "APPROVED" | "REJECTED";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface Reminder {
  id: string;
  remindAt: string;
  message: string;
  isSent: boolean;
}

export interface Application {
  id: string;
  companyName: string;
  jobTitle: string;
  status: Status;
  priority: Priority;
  location?: string | null;
  salary?: string | null;
  url?: string | null;
  notes?: string | null;
  tags?: string | null;
  appliedAt?: string;
  updatedAt?: string;
  reminderScheduled?: boolean;
  reminders?: Reminder[];
}

export interface ApplicationStats {
  total: number;
  breakdown: {
    WAITING: number;
    INTERVIEWING: number;
    APPROVED: number;
    REJECTED: number;
  };
  rates: {
    interviewRate: number;
    offerRate: number;
    responseRate: number;
  };
}
