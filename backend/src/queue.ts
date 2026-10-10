import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

let connection: IORedis | null = null;
let reminderQueue: Queue | null = null;
let reminderWorker: Worker | null = null;
let isRedisAvailable = false;

try {
  connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      if (times > 3) {
        console.warn("[Redis] Could not connect to Redis server. Running in offline-queue mode.");
        return null; // Stop retrying to avoid spamming logs
      }
      return Math.min(times * 500, 2000);
    },
  });

  connection.on("connect", () => {
    console.log("[Redis] Connected to Redis successfully.");
    isRedisAvailable = true;
  });

  connection.on("error", (err) => {
    console.warn(`[Redis] Connection warning: ${err.message}. Queue tasks will be logged locally.`);
    isRedisAvailable = false;
  });

  reminderQueue = new Queue("reminders", { connection });

  reminderWorker = new Worker(
    "reminders",
    async (job) => {
      console.log(`[Worker] Processing reminder job #${job.id} for Application: ${job.data.applicationId}`);
      console.log(`[Worker] Reminder Message: "${job.data.message}"`);
      // Extensible: Integrate SendGrid email, Twilio SMS, or Webhook notification here
    },
    { connection },
  );

  reminderWorker.on("completed", (job) => {
    console.log(`[Worker] Reminder #${job.id} processed successfully!`);
  });

  reminderWorker.on("failed", (job, err) => {
    console.error(`[Worker] Reminder #${job?.id} failed: ${err.message}`);
  });
} catch (error) {
  console.warn("[Redis] Failed to initialize BullMQ queue:", error);
}

/**
 * Safely schedule an approval follow-up reminder.
 * Gracefully logs if Redis is unavailable rather than crashing.
 */
export async function scheduleApprovalReminder(applicationId: string, companyName: string, jobTitle: string) {
  const message = `Follow-up required for ${jobTitle} at ${companyName}: Send CV, transcripts, or required onboarding documents!`;

  if (reminderQueue && isRedisAvailable) {
    try {
      const job = await reminderQueue.add(
        "send-approval-followup",
        { applicationId, message },
        { delay: 1000 * 60 * 60 * 24 } // 24-hour delayed job
      );
      console.log(`[Queue] Scheduled BullMQ reminder job #${job.id} for application ${applicationId} (24h delay)`);
      return { scheduled: true, jobId: job.id, message };
    } catch (err: any) {
      console.warn(`[Queue] Failed to enqueue reminder: ${err.message}`);
    }
  }

  // Graceful fallback: log reminder locally
  console.log(`[Mock Queue] Registered follow-up reminder for ${companyName} (${jobTitle}): "${message}"`);
  return { scheduled: true, mock: true, message };
}

export { reminderQueue, reminderWorker, isRedisAvailable };
