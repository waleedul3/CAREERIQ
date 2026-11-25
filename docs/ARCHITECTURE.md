# System Architecture (`CareerIQ`)

## Overview

CareerIQ separates **ML-based employability estimation** (trained offline in Python, exported to ONNX, executed in the browser via `onnxruntime-web`) from **rule-based career analytics** (skill gap matrices, role scoring, deterministic roadmaps, and resume scoring) and **persistent MongoDB Atlas storage** via Node.js/Express API routes.

```
Browser Client (React 19 + TypeScript + Tailwind v4)
  ├── ONNX Runtime Web (WASM) ──▶ /models/employability_model.onnx
  ├── Recharts Visualizations
  └── API Client (HttpOnly Cookie + In-Memory Bearer JWT)
         │
         ▼
Express API Layer (server.ts / Vercel api/index.ts)
  ├── /api/auth/*   (Register, Login, Logout, Admin Passcode Claim)
  ├── /api/profile, /api/assessments, /api/predictions, /api/roadmap, /api/resume/*
  └── /api/admin/*  (RBAC-protected Cohort Analytics & Student Roster)
         │
         ▼
MongoDB Atlas (Mongoose ODM: careeiq database)
```

## Runtime Adaptation Note

In this workspace, CareerIQ runs as a **React + Vite + Express** full-stack TypeScript application (`server.ts`) paired with a Vercel serverless adapter (`api/index.ts` + `vercel.json`), rather than Next.js App Router, so it executes seamlessly both on port 3000 in AI Studio preview and on Vercel without changing the API surface or database models.

## Free-First & Privacy Boundaries

- **Zero Paid AI Keys**: Core features require no OpenAI, Gemini, or paid job/resume APIs.
- **Browser ONNX Inference**: Eliminates the need for a separate Python inference server in production.
- **Private Student Scope**: All student queries filter by authenticated `req.user.id`; admin endpoints enforce `requireAdmin` on the server and omit student emails and raw resume text.
