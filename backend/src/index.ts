import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { scheduleApprovalReminder, isRedisAvailable } from "./queue";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// HEALTH CHECK
// -------------------------------------------------------------
app.get("/health", async (_req: Request, res: Response) => {
  let dbStatus = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err: any) {
    dbStatus = `offline (${err.message})`;
  }

  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "job-tracker-backend",
    database: dbStatus,
    redisAvailable: isRedisAvailable,
  });
});

// -------------------------------------------------------------
// ANALYTICS & STATS
// -------------------------------------------------------------
app.get("/applications/stats", async (_req: Request, res: Response) => {
  try {
    const [total, waiting, interviewing, approved, rejected] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: "WAITING" } }),
      prisma.application.count({ where: { status: "INTERVIEWING" } }),
      prisma.application.count({ where: { status: "APPROVED" } }),
      prisma.application.count({ where: { status: "REJECTED" } }),
    ]);

    const interviewRate = total > 0 ? Math.round(((interviewing + approved) / total) * 100) : 0;
    const offerRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    const responseRate = total > 0 ? Math.round(((total - waiting) / total) * 100) : 0;

    res.json({
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
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    res.status(500).json({ error: "Failed to fetch analytics stats" });
  }
});

// -------------------------------------------------------------
// GET ALL APPLICATIONS (With Filtering & Search)
// -------------------------------------------------------------
app.get("/applications", async (req: Request, res: Response) => {
  try {
    const { status, priority, search, sortBy } = req.query;

    const where: any = {};

    if (status && typeof status === "string" && status !== "ALL") {
      where.status = status;
    }

    if (priority && typeof priority === "string" && priority !== "ALL") {
      where.priority = priority;
    }

    if (search && typeof search === "string" && search.trim() !== "") {
      const term = search.trim();
      where.OR = [
        { companyName: { contains: term, mode: "insensitive" } },
        { jobTitle: { contains: term, mode: "insensitive" } },
        { location: { contains: term, mode: "insensitive" } },
        { tags: { contains: term, mode: "insensitive" } },
      ];
    }

    let orderBy: any = { appliedAt: "desc" };
    if (sortBy === "company") orderBy = { companyName: "asc" };
    if (sortBy === "updated") orderBy = { updatedAt: "desc" };

    const applications = await prisma.application.findMany({
      where,
      orderBy,
      include: { reminders: true },
    });

    res.json(applications);
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// -------------------------------------------------------------
// GET SINGLE APPLICATION BY ID
// -------------------------------------------------------------
app.get("/applications/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const appRecord = await prisma.application.findUnique({
      where: { id },
      include: { reminders: true },
    });

    if (!appRecord) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(appRecord);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve application" });
  }
});

// -------------------------------------------------------------
// CREATE APPLICATION
// -------------------------------------------------------------
app.post("/applications", async (req: Request, res: Response) => {
  const {
    companyName,
    jobTitle,
    status = "WAITING",
    priority = "MEDIUM",
    location,
    salary,
    url,
    notes,
    tags,
    userId,
  } = req.body;

  if (!companyName || !jobTitle) {
    return res.status(400).json({ error: "companyName and jobTitle are required" });
  }

  try {
    const application = await prisma.application.create({
      data: {
        companyName: companyName.trim(),
        jobTitle: jobTitle.trim(),
        status,
        priority,
        location: location?.trim() || null,
        salary: salary?.trim() || null,
        url: url?.trim() || null,
        notes: notes?.trim() || null,
        tags: tags?.trim() || null,
        userId: userId || null,
      },
      include: { reminders: true },
    });

    // If created directly with APPROVED status, schedule reminder
    if (status === "APPROVED") {
      await scheduleApprovalReminder(application.id, application.companyName, application.jobTitle);
    }

    res.status(201).json(application);
  } catch (error: any) {
    console.error("Failed to create application:", error);
    res.status(500).json({ error: "Failed to create application", detail: error.message });
  }
});

// -------------------------------------------------------------
// UPDATE APPLICATION DETAILS
// -------------------------------------------------------------
app.put("/applications/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    companyName,
    jobTitle,
    status,
    priority,
    location,
    salary,
    url,
    notes,
    tags,
  } = req.body;

  try {
    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Application not found" });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        ...(companyName && { companyName: companyName.trim() }),
        ...(jobTitle && { jobTitle: jobTitle.trim() }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(location !== undefined && { location: location?.trim() || null }),
        ...(salary !== undefined && { salary: salary?.trim() || null }),
        ...(url !== undefined && { url: url?.trim() || null }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        ...(tags !== undefined && { tags: tags?.trim() || null }),
      },
      include: { reminders: true },
    });

    // If transitioned into APPROVED
    if (status === "APPROVED" && existing.status !== "APPROVED") {
      await scheduleApprovalReminder(updated.id, updated.companyName, updated.jobTitle);
    }

    res.json(updated);
  } catch (error) {
    console.error("Failed to update application:", error);
    res.status(500).json({ error: "Failed to update application" });
  }
});

// -------------------------------------------------------------
// UPDATE STATUS (Kanban Drag and Drop)
// -------------------------------------------------------------
app.put("/applications/:id/status", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "status is required" });
  }

  try {
    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Application not found" });
    }

    const application = await prisma.application.update({
      where: { id },
      data: { status },
      include: { reminders: true },
    });

    let reminderInfo = null;
    if (status === "APPROVED" && existing.status !== "APPROVED") {
      reminderInfo = await scheduleApprovalReminder(
        id,
        application.companyName,
        application.jobTitle
      );
    }

    res.json({
      ...application,
      reminderScheduled: Boolean(reminderInfo),
      reminderDetail: reminderInfo,
    });
  } catch (error) {
    console.error("Failed to update status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// -------------------------------------------------------------
// DELETE APPLICATION
// -------------------------------------------------------------
app.delete("/applications/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.application.delete({ where: { id } });
    res.json({ success: true, message: `Application ${id} deleted successfully` });
  } catch (error) {
    console.error("Failed to delete application:", error);
    res.status(500).json({ error: "Failed to delete application" });
  }
});

// -------------------------------------------------------------
// SEED DEMO DATA
// -------------------------------------------------------------
app.post("/applications/seed", async (_req: Request, res: Response) => {
  try {
    const demoJobs = [
      {
        companyName: "Stripe",
        jobTitle: "Senior Full-Stack Engineer",
        status: "INTERVIEWING",
        priority: "HIGH",
        location: "Remote (US/EMEA)",
        salary: "$165,000 - $190,000",
        url: "https://stripe.com/jobs",
        notes: "Passed technical screen. System design interview scheduled next Thursday.",
        tags: "React, TypeScript, Node.js, Distributed Systems",
      },
      {
        companyName: "Google",
        jobTitle: "Software Engineer III",
        status: "WAITING",
        priority: "HIGH",
        location: "Mountain View, CA (Hybrid)",
        salary: "$180,000 - $210,000",
        url: "https://careers.google.com",
        notes: "Applied via employee referral from Alex.",
        tags: "Go, Kubernetes, Cloud Architecture",
      },
      {
        companyName: "Vercel",
        jobTitle: "Frontend Platform Engineer",
        status: "APPROVED",
        priority: "HIGH",
        location: "Remote",
        salary: "$150,000 - $175,000",
        url: "https://vercel.com/careers",
        notes: "Received offer letter! BullMQ reminder active for document submission.",
        tags: "Next.js, React 19, Turbopack, Tailwind",
      },
      {
        companyName: "Linear",
        jobTitle: "Product Engineer",
        status: "INTERVIEWING",
        priority: "MEDIUM",
        location: "Remote",
        salary: "$140,000 - $160,000",
        url: "https://linear.app/careers",
        notes: "Design challenge submitted. Waiting on founder chat.",
        tags: "React, GraphQL, Sync Engine",
      },
      {
        companyName: "Meta",
        jobTitle: "Production Engineer",
        status: "REJECTED",
        priority: "LOW",
        location: "Menlo Park, CA",
        salary: "$160,000",
        url: "https://metacareers.com",
        notes: "Position filled internally. Encouraged to re-apply in 6 months.",
        tags: "Linux, Python, Systems",
      },
    ];

    for (const job of demoJobs) {
      await prisma.application.create({ data: job });
    }

    res.json({ success: true, count: demoJobs.length, message: "Demo data seeded successfully!" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to seed demo data", detail: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Job Tracker API server listening on http://localhost:${port}`);
  console.log(`📊 Health check available at: http://localhost:${port}/health`);
});
