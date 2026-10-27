# 🏥 IntelliPriority — AI-Based Clinical & Business Impact Prioritiser

> **An intelligent MSP ticket prioritisation system that identifies urgent patient-facing and business-critical failures using a weighted composite scoring engine.**

---

## 📋 Project Overview

IntelliPriority is a full-stack web application developed for **Managed Service Providers (MSPs)** serving multiple customer organisations including healthcare providers and businesses.

Traditional ticket systems prioritise based only on severity or SLA tier. This system improves on that by applying a **6-factor AI scoring engine** that considers clinical safety, business disruption, service criticality, user scale, operating schedule, and contract priority to assign evidence-based ticket priorities.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite 8 |
| Styling | Tailwind CSS 4 + Custom Animations |
| Backend | Node.js 22 + Express 5 |
| Database | SQLite (native `node:sqlite`) |
| Icons | Lucide React |
| Dev Tools | Concurrently, Oxlint |

---

## 🗂️ Project Structure

```
project1/
├── server/
│   ├── index.cjs              # Express API server (14 endpoints)
│   ├── db.cjs                 # SQLite schema + seed data
│   ├── scoringEngine.cjs      # AI scoring engine (baseline + improved)
│   ├── generate5000Tickets.cjs # Synthetic dataset generator
│   └── msp_prioritiser.sqlite # SQLite database (4MB, 5000 records)
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Navigation + role switcher
│   │   ├── Toast.tsx           # Global notification system
│   │   ├── ErrorBoundary.tsx   # Global error handler
│   │   ├── TicketList.tsx
│   │   ├── PerformanceDashboard.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── DashboardPage.tsx   # Analytics overview
│   │   ├── TicketListPage.tsx  # Paginated ticket queue + CSV export
│   │   ├── TicketDetailPage.tsx
│   │   ├── CreateTicketPage.tsx
│   │   ├── OverridePage.tsx    # Manual priority override
│   │   ├── AuditTrailPage.tsx  # Immutable audit log + CSV export
│   │   ├── PerformancePage.tsx # Confusion matrix + metrics
│   │   ├── FalsePositivePage.tsx
│   │   ├── FalseNegativePage.tsx
│   │   ├── ConfigurationPage.tsx
│   │   ├── EdgeCasesPage.tsx
│   │   └── ...
│   ├── api/client.ts           # Typed API client
│   ├── utils/exportCSV.ts      # CSV export utility
│   └── engine/prioritisationEngine.ts
└── package.json
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js 22+
- npm 10+

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Start both backend + frontend together
npm run dev:all
```

| Service | URL |
|---------|-----|
| 🔵 Frontend | http://localhost:5173 |
| 🟢 Backend API | http://localhost:3001 |

### Individual Commands

```bash
npm run dev      # Frontend only (Vite)
npm run server   # Backend only (Express)
npm run build    # Production build
```

---

## 🧠 AI Scoring Engine

The improved prioritisation engine calculates a **composite score out of 100** across 6 weighted factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| Clinical Impact | 30% | Detects patient-facing failures, clinical keywords |
| Business Disruption | 25% | Identifies revenue/operational impact |
| Service Criticality | 20% | Tier-1 (EHR, Emergency) vs Tier-2 (Auth, Network) |
| Affected Users | 10% | Scale from 1 user to 200+ users |
| Operating Schedule | 10% | 24/7 vs business hours context |
| Contract Priority | 5% | Platinum (15min SLA) / Gold / Standard |

**Priority Thresholds (configurable):**
- 🔴 **Critical**: Score ≥ 80
- 🟠 **High**: Score ≥ 60
- 🔵 **Medium**: Score ≥ 30
- ⚪ **Low**: Score < 30

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/users` | List all users |
| GET | `/api/organisations` | List organisations |
| GET | `/api/tickets` | Paginated tickets (RBAC filtered) |
| GET | `/api/tickets/:id` | Single ticket + audit history |
| POST | `/api/tickets` | Create ticket (auto-scored) |
| POST | `/api/tickets/:id/override` | Manual priority override |
| GET | `/api/audit-logs` | Full audit trail |
| GET/PUT | `/api/config/thresholds` | Scoring configuration |
| GET | `/api/analytics/dashboard` | Summary analytics |
| GET | `/api/analytics/evaluation` | Confusion matrix |
| GET | `/api/analytics/false-positives` | Over-prioritised tickets |
| GET | `/api/analytics/false-negatives` | Under-prioritised tickets |
| GET | `/api/edge-cases` | Edge case tickets |

---

## 👥 User Roles & Access Control

| Role | Access |
|------|--------|
| MSP Administrator | Full access + override + configuration |
| MSP Support Analyst | Full view + override |
| Customer Organisation User | Own organisation tickets only |
| External Partner | Network/Authentication tickets only |

---

## 📊 Dataset

- **5,000 synthetic tickets** generated across 4 organisations
- Covers clinical emergencies, business failures, routine requests, and edge cases
- Used for performance evaluation, confusion matrix, and false positive/negative analysis

---

## 📁 Organisations

| Organisation | Contract | SLA Target | Schedule |
|-------------|----------|-----------|----------|
| CityCare Hospital | Platinum | 15 min | 24/7 |
| Metro Health Clinic | Gold | 30 min | Extended |
| MedTech Partner Services | Gold | 30 min | 24/7 |
| Retail Business Services | Standard | 60 min | Business Hours |

---

## 🎓 Academic Context

**Project:** AI-Based Critical Incident Prioritisation  
**System:** Clinical & Business Impact Prioritiser (IntelliPriority)  
**Progress:** 100% Complete  
**Repository:** [github.com/ranjith-k42/AI-Based-Critical-Incident-Prioritisation](https://github.com/ranjith-k42/AI-Based-Critical-Incident-Prioritisation)

---

## 📄 License

This project is developed for academic purposes.
