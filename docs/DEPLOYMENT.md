# Deployment Guide (MongoDB Atlas + GitHub + Vercel)

## 1. MongoDB Atlas Setup (Free M0 Tier)

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free **M0** cluster.
2. Under **Database Access**, create a database user with `readWrite` permission on the `careeriq` database and save the username/password securely.
3. Under **Network Access**, restrict IP access appropriately (or allow Vercel serverless IPs `0.0.0.0/0` paired with strong credentials and TLS).
4. Copy the `mongodb+srv://...` connection string. Never commit it to Git.

> **Free-Tier Limitation Note**: MongoDB Atlas M0 provides 512 MB storage and shared RAM/vCPU with connection limits; CareerIQ caches the Mongoose connection in `server/config/db.ts` to minimize connection churn.

## 2. GitHub Repository Preparation

Ensure `.env` files are excluded via `.gitignore`. Verify no credentials are staged before pushing:
```bash
git status
git diff --cached
```

## 3. Vercel Deployment

1. Import your GitHub repository in [Vercel](https://vercel.com/).
2. Vercel detects `vercel.json`:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Serverless API rewrite: `/api/(.*)` → `/api/index.ts`
3. Add **Environment Variables** in Vercel Project Settings:
   - `MONGODB_URI` = your MongoDB Atlas SRV string
   - `AUTH_SECRET` = 32+ character random hex string (`openssl rand -hex 32`)
   - `ADMIN_PASSCODE` = secure passcode for unlocking Administrator Console
   - `APP_URL` = your production Vercel URL (`https://your-app.vercel.app`)
4. Deploy and verify:
   - `GET /api/health` returns `{ status: "ok", databaseConfigured: true }`
   - Browser loads `/models/employability_model.onnx` and `/ort/ort-wasm-simd-threaded.wasm` cleanly.
   - Register a student account, submit an assessment, update roadmap status, and test resume upload (`< 4.5 MB` recommended under Vercel Hobby request body limits).

> **Vercel Free-Tier Note**: Vercel Hobby serverless functions enforce a 4.5 MB request body limit and 10s default execution timeout. CareerIQ caps resumes at 5 MB (recommended `<= 4 MB` on Vercel) and performs ML inference directly in the browser via `onnxruntime-web`, keeping server latency fast.
