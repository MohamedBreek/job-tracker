/// <reference types="vite/client" />
import axios from "axios";
import { Application, ApplicationStats, Status } from "../types";

const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";

const DEFAULT_DEMO_APPLICATIONS: Application[] = [
  {
    id: "demo-1",
    companyName: "Stripe",
    jobTitle: "Senior Full-Stack Engineer",
    status: "INTERVIEWING",
    priority: "HIGH",
    location: "Remote (Global)",
    salary: "$165,000 - $190,000",
    url: "https://stripe.com/jobs",
    notes: "Passed recruiter screen and coding assessment. Architecture deep-dive next Tuesday.",
    tags: "React, TypeScript, Node.js, Distributed Systems",
    appliedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    reminderScheduled: false,
  },
  {
    id: "demo-2",
    companyName: "Google",
    jobTitle: "Software Engineer III",
    status: "WAITING",
    priority: "HIGH",
    location: "Mountain View, CA (Hybrid)",
    salary: "$180,000 - $210,000",
    url: "https://careers.google.com",
    notes: "Submitted application with internal referral. Waiting for hiring manager review.",
    tags: "Go, Kubernetes, Cloud Architecture",
    appliedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    reminderScheduled: false,
  },
  {
    id: "demo-3",
    companyName: "Vercel",
    jobTitle: "Frontend Platform Engineer",
    status: "APPROVED",
    priority: "HIGH",
    location: "Remote",
    salary: "$150,000 - $175,000",
    url: "https://vercel.com/careers",
    notes: "Offer accepted! BullMQ background queue scheduled 24h document submission reminder.",
    tags: "Next.js, React 19, Turbopack, Tailwind CSS",
    appliedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    reminderScheduled: true,
  },
  {
    id: "demo-4",
    companyName: "Linear",
    jobTitle: "Product Engineer",
    status: "INTERVIEWING",
    priority: "MEDIUM",
    location: "Remote",
    salary: "$140,000 - $160,000",
    url: "https://linear.app/careers",
    notes: "Design challenge submitted. Waiting on founder chat.",
    tags: "React, GraphQL, Sync Engine, Tailwind",
    appliedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    reminderScheduled: false,
  },
  {
    id: "demo-5",
    companyName: "OpenAI",
    jobTitle: "Fullstack Solutions Engineer",
    status: "WAITING",
    priority: "HIGH",
    location: "San Francisco, CA",
    salary: "$190,000 - $230,000",
    url: "https://openai.com/careers",
    notes: "Application submitted through career portal. Focused on enterprise API tooling.",
    tags: "Python, FastAPI, TypeScript, LLM Tooling",
    appliedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    reminderScheduled: false,
  },
  {
    id: "demo-6",
    companyName: "Meta",
    jobTitle: "Production Engineer",
    status: "REJECTED",
    priority: "LOW",
    location: "Menlo Park, CA",
    salary: "$160,000",
    url: "https://metacareers.com",
    notes: "Position filled internally. Encouraged to re-apply next cycle.",
    tags: "Linux, Python, Systems, Observability",
    appliedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    reminderScheduled: false,
  },
];

const STORAGE_KEY = "job_tracker_applications_v1";

function getLocalApplications(): Application[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_APPLICATIONS));
      return DEFAULT_DEMO_APPLICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DEMO_APPLICATIONS;
  }
}

function saveLocalApplications(apps: Application[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
  }
}

export const apiService = {
  /**
   * Check if the real Express backend is accessible
   */
  async checkBackendHealth(): Promise<{ online: boolean; message: string }> {
    try {
      const res = await axios.get(`${API_BASE}/health`, { timeout: 1500 });
      return { online: true, message: `Backend online (${res.data.status})` };
    } catch {
      return { online: false, message: "Local demo mode (backend offline)" };
    }
  },

  /**
   * Fetch all applications with optional query params
   */
  async getApplications(isOnline: boolean): Promise<Application[]> {
    if (isOnline) {
      try {
        const res = await axios.get<Application[]>(`${API_BASE}/applications`);
        return res.data;
      } catch (err) {
        console.warn("Backend request failed, using local storage fallback", err);
      }
    }
    return getLocalApplications();
  },

  /**
   * Create a new application
   */
  async createApplication(
    data: Omit<Application, "id" | "appliedAt" | "updatedAt">,
    isOnline: boolean
  ): Promise<Application> {
    if (isOnline) {
      try {
        const res = await axios.post<Application>(`${API_BASE}/applications`, data);
        return res.data;
      } catch (err) {
        console.warn("Backend create failed, saving locally", err);
      }
    }

    const newApp: Application = {
      ...data,
      id: "local-" + Date.now(),
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reminderScheduled: data.status === "APPROVED",
    };

    const current = getLocalApplications();
    const updated = [newApp, ...current];
    saveLocalApplications(updated);
    return newApp;
  },

  /**
   * Update full application details
   */
  async updateApplication(
    id: string,
    data: Partial<Application>,
    isOnline: boolean
  ): Promise<Application> {
    if (isOnline) {
      try {
        const res = await axios.put<Application>(`${API_BASE}/applications/${id}`, data);
        return res.data;
      } catch (err) {
        console.warn("Backend update failed, saving locally", err);
      }
    }

    const current = getLocalApplications();
    const index = current.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Application not found");

    const updatedApp: Application = {
      ...current[index],
      ...data,
      updatedAt: new Date().toISOString(),
      reminderScheduled: data.status === "APPROVED" ? true : current[index].reminderScheduled,
    };

    current[index] = updatedApp;
    saveLocalApplications(current);
    return updatedApp;
  },

  /**
   * Update application status (Kanban drag and drop)
   */
  async updateStatus(
    id: string,
    newStatus: Status,
    isOnline: boolean
  ): Promise<{ application: Application; reminderScheduled: boolean }> {
    if (isOnline) {
      try {
        const res = await axios.put(`${API_BASE}/applications/${id}/status`, { status: newStatus });
        return {
          application: res.data,
          reminderScheduled: Boolean(res.data.reminderScheduled),
        };
      } catch (err) {
        console.warn("Backend status update failed, saving locally", err);
      }
    }

    const current = getLocalApplications();
    const index = current.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Application not found");

    const wasApproved = current[index].status === "APPROVED";
    const nowApproved = newStatus === "APPROVED";
    const shouldScheduleReminder = nowApproved && !wasApproved;

    const updatedApp: Application = {
      ...current[index],
      status: newStatus,
      updatedAt: new Date().toISOString(),
      reminderScheduled: shouldScheduleReminder || current[index].reminderScheduled,
    };

    current[index] = updatedApp;
    saveLocalApplications(current);
    return { application: updatedApp, reminderScheduled: shouldScheduleReminder };
  },

  /**
   * Delete an application
   */
  async deleteApplication(id: string, isOnline: boolean): Promise<boolean> {
    if (isOnline) {
      try {
        await axios.delete(`${API_BASE}/applications/${id}`);
        return true;
      } catch (err) {
        console.warn("Backend delete failed, removing locally", err);
      }
    }

    const current = getLocalApplications();
    const updated = current.filter((a) => a.id !== id);
    saveLocalApplications(updated);
    return true;
  },

  /**
   * Calculate statistics from applications
   */
  calculateStats(applications: Application[]): ApplicationStats {
    const total = applications.length;
    const waiting = applications.filter((a) => a.status === "WAITING").length;
    const interviewing = applications.filter((a) => a.status === "INTERVIEWING").length;
    const approved = applications.filter((a) => a.status === "APPROVED").length;
    const rejected = applications.filter((a) => a.status === "REJECTED").length;

    const interviewRate = total > 0 ? Math.round(((interviewing + approved) / total) * 100) : 0;
    const offerRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    const responseRate = total > 0 ? Math.round(((total - waiting) / total) * 100) : 0;

    return {
      total,
      breakdown: {
        WAITING: waiting,
        INTERVIEWING: interviewing,
        APPROVED: approved,
        REJECTED: rejected,
      },
      rates: {
        interviewRate,
        offerRate,
        responseRate,
      },
    };
  },

  /**
   * Reset local demo data to defaults
   */
  resetLocalData(): Application[] {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_APPLICATIONS));
    return DEFAULT_DEMO_APPLICATIONS;
  },
};
