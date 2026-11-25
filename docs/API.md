# CareerIQ REST API Reference

All protected routes require either an `HttpOnly` session cookie (`careeriq_session`) with `X-Requested-With: CareerIQ` / matching `Origin` on mutations, or an `Authorization: Bearer <jwt>` header.

## Health
- `GET /api/health` — Returns `{ status, databaseConfigured, modelPath }`.

## Authentication (`/api/auth/*`)
- `POST /api/auth/register` — Creates a student account (`role: 'student'` enforced), initializes default profile & roadmap, sets session cookie & returns `{ user, token }`.
- `POST /api/auth/login` — Authenticates email/password via `bcryptjs.compare` and issues JWT + cookie.
- `POST /api/auth/logout` — Clears session cookie.
- `GET /api/auth/me` — Returns current authenticated `{ user }`.
- `GET /api/auth/admin-status` — Reports whether `ADMIN_PASSCODE` or first-run claim is available.
- `POST /api/auth/claim-admin` — Verifies server `ADMIN_PASSCODE` (or claims first-run passcode) and elevates current user to `admin`.

## Student Workspace (`/api/*`, requires auth)
- `GET /api/profile` — Fetch current student's profile.
- `PUT /api/profile` — Validate with Zod, update profile & sync roadmap tasks.
- `GET /api/assessments` — List student's submitted assessments.
- `POST /api/assessments` — Validate assessment + ONNX prediction, compute feature factors & strengths, save `Assessment` + `Prediction`, sync profile & roadmap.
- `GET /api/predictions` — List student's prediction history.
- `GET /api/roadmap?role=...` — Load or generate deterministic roadmap tasks preserving prior statuses.
- `PATCH /api/roadmap/progress` — Update `Not Started | In Progress | Completed` status for a `taskId`.
- `POST /api/resume/analyze` — Validate PDF/DOCX/TXT (<= 5 MB, magic-byte verified), extract text via `unpdf`/`mammoth`, score via deterministic rubric, persist summary.
- `GET /api/resume/history` — List past resume analysis summaries.

## Administrator Console (`/api/admin/*`, requires `role === 'admin'`)
- `GET /api/admin/dashboard` — Aggregated student counts, readiness distribution, common missing skills, popular roles, assessment trends, and recent activity logs.
- `GET /api/admin/students?page=1&limit=10&search=...` — Paginated, sanitized student readiness roster (excludes emails and private resumes).
- `GET /api/admin/analytics` — Prediction counts, average probability, and inference engine breakdown.
