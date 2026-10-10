# 💼 JobPulse — Full-Stack Job Application Tracker & Queue Automation

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3+-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22+-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![BullMQ](https://img.shields.io/badge/BullMQ-4.0+-CC3534?logo=redis&logoColor=white)](https://bullmq.io/)
[![Redis](https://img.shields.io/badge/Redis-7.0+-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

**A production-ready full-stack job application tracker featuring drag-and-drop Kanban workflow, PostgreSQL persistence with Prisma ORM, and asynchronous BullMQ background workers for automated follow-up scheduling.**

[Key Features](#-key-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [API Reference](#-api-reference) • [Docker Deployment](#-docker-compose-setup)

</div>

---

## 🌟 Overview

Job hunting requires structured follow-ups, timeline tracking, and organization across dozens of applications. **JobPulse** solves this by combining an intuitive visual Kanban board with an enterprise-grade backend:

* **Frontend:** Built with **React 18**, **TypeScript**, and **Tailwind CSS**, featuring fluid drag-and-drop interactions via `@dnd-kit`.
* **Backend:** REST API powered by **Node.js**, **Express**, and **Prisma ORM** targeting **PostgreSQL**.
* **Automation:** An asynchronous message queue powered by **BullMQ** and **Redis** automatically schedules delayed follow-up tasks (e.g., prompt for CV & document submission 24 hours after an offer is recorded).
* **Resilience:** Built with an **offline-first fallback**; if the PostgreSQL/Redis backend is not running, the web application seamlessly falls back to a reactive `localStorage` engine with realistic demo data, ensuring zero downtime for portfolio reviewers.

---

## 🚀 Key Features

### 1. 📋 Drag-and-Drop Kanban Pipeline
- Categorized into 4 distinct workflow stages:
  - ⏳ **Applied / Waiting:** Newly submitted applications awaiting review.
  - 💬 **Interviewing:** Active screening calls, technical evaluations, and system design interviews.
  - 🎉 **Offer / Approved:** Successful offers triggering automatic background reminder workflows.
  - 🛑 **Rejected / Archived:** Transparent tracking to calculate overall conversion metrics.
- Multi-device accessibility: Drag cards seamlessly or use the quick stage dropdown on mobile and touch devices.

### 2. ⚡ Background Queue Automation (BullMQ + Redis)
- Moving an application to **Offer / Approved** dispatches a delayed job (`send-approval-followup`) to a dedicated Redis queue.
- Worker process handles delayed execution, logging tasks and simulating email/SMS reminders for document submissions.
- Built with connection resilience so backend remains operable even during temporary Redis outages.

### 3. 📊 Real-Time Analytics & KPI Dashboard
- Instant metrics bar computing:
  - **Total Pipeline Volume** & stage counts.
  - **Interview Rate:** Percentage of applications reaching recruiter/tech screens.
  - **Offer Conversion Rate:** Ratio of offers secured against total applications.
  - **Response Rate:** Measure of recruiter engagement.
- Dedicated **Analytics Modal** displaying stage conversion progress bars and pipeline breakdown.

### 4. 🔍 Multi-Criteria Search & Filtering
- Instant search across **Company Name**, **Job Title**, **Location**, and **Tech Stack Tags**.
- Filter by column stage and priority level (`🔥 High`, `⚡ Medium`, `🌱 Low`).
- Sort dynamically by **Newest First**, **Company Alphabetical**, or **Priority Level**.

### 5. 💾 Data Portability & Seed Mode
- **Export Data:** 1-click export to **CSV** or structured **JSON**.
- **Interactive Reset:** 1-click restore to pre-seeded industry applications (Stripe, Google, Vercel, Linear, OpenAI).

---

## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Tier (React 18 + Vite + Tailwind)"]
        UI["Kanban Board (@dnd-kit)"]
        Store["State & Filter Engine"]
        Storage["LocalStorage (Offline Fallback)"]
    end

    subgraph Server ["API Tier (Node.js + Express + TypeScript)"]
        API["Express REST API"]
        PrismaClient["Prisma ORM"]
        QueueClient["BullMQ Producer"]
    end

    subgraph Data ["Data & Messaging Tier"]
        DB[(PostgreSQL 16)]
        Redis[(Redis 7)]
        Worker["BullMQ Worker Process"]
    end

    UI --> Store
    Store -.->|Offline / Static| Storage
    Store -->|HTTP / Axios| API
    API --> PrismaClient --> DB
    API --> QueueClient --> Redis
    Redis --> Worker
```

### Automated Job Approval Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as React Kanban Board
    participant API as Express API
    participant DB as PostgreSQL (Prisma)
    participant Redis as BullMQ & Redis
    participant Worker as Background Worker

    User->>Frontend: Drag card to "Offer / Approved"
    Frontend->>API: PUT /applications/:id/status { status: "APPROVED" }
    API->>DB: UPDATE application SET status = 'APPROVED'
    API->>Redis: enqueue("send-approval-followup", delay: 24h)
    API-->>Frontend: 200 OK { reminderScheduled: true }
    Frontend-->>User: Toast: "🎉 Offer Stage! 24h Reminder Queued via BullMQ"
    Note over Redis,Worker: 24 Hours Later (Delayed Job)
    Redis->>Worker: Dispatch job payload
    Worker->>Worker: Process reminder (Send email / CV document alert)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite | Fast, typed, reactive user interface |
| **Styling** | Tailwind CSS, Lucide Icons | Responsive modern SaaS design system |
| **Drag & Drop** | `@dnd-kit/core` | Accessible, performant drag-and-drop primitives |
| **Backend** | Node.js, Express, TypeScript | Scalable RESTful API |
| **Database** | PostgreSQL 16 | Relational data persistence |
| **ORM** | Prisma ORM | Type-safe queries and automated migrations |
| **Job Queue** | BullMQ & Redis | Asynchronous, delayed background tasks |
| **Containerization** | Docker, Docker Compose | Multi-container local & cloud deployment |

---

## ⚡ Quick Start

### Prerequisites
* **Node.js:** v18 or later
* **npm** or **yarn**
* *(Optional)* **PostgreSQL** & **Redis** (or run via Docker)

### 1. Clone the Repository
```bash
git clone https://github.com/MohamedBreek/job-tracker.git
cd job-tracker
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Return to root
cd ..
```

### 3. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/job-tracker?schema=public"
REDIS_URL="redis://localhost:6379"
```

### 4. Database Setup (Prisma)
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 5. Run the Application
Open two terminals or use the scripts:

```bash
# Terminal 1 - Backend API:
cd backend
npm run dev

# Terminal 2 - Frontend:
cd frontend
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 🐳 Docker Compose Setup

Run the entire distributed environment (**PostgreSQL**, **Redis**, and the **Node.js API**) with a single command:

```bash
docker compose up -d --build
```

* Express API: `http://localhost:3000`
* API Health Check: `http://localhost:3000/health`
* PostgreSQL: `localhost:5432`
* Redis: `localhost:6379`

---

## 📡 API Reference

### Applications

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health status (DB connection, Redis status) |
| `GET` | `/applications` | List applications (supports `search`, `status`, `priority`, `sortBy`) |
| `GET` | `/applications/stats` | Aggregate pipeline counts and conversion rates |
| `GET` | `/applications/:id` | Fetch specific application details |
| `POST` | `/applications` | Create a new job application |
| `PUT` | `/applications/:id` | Update application details |
| `PUT` | `/applications/:id/status` | Update stage & trigger BullMQ reminder if `APPROVED` |
| `DELETE` | `/applications/:id` | Delete application record |
| `POST` | `/applications/seed` | Seed default demo jobs for testing |

#### Sample Create Request:
```bash
curl -X POST http://localhost:3000/applications \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Stripe",
    "jobTitle": "Staff Software Engineer",
    "status": "INTERVIEWING",
    "priority": "HIGH",
    "location": "Remote",
    "salary": "$210,000",
    "tags": "TypeScript, Distributed Systems, Go"
  }'
```

---

## 👤 Author

**Mohamed Breek**
* **GitHub:** [@MohamedBreek](https://github.com/MohamedBreek)
* **Email:** [mohamedbreek1175@gmail.com](mailto:mohamedbreek1175@gmail.com)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
