# ScopeSeal AI — Production Deployment Guide

## 1. Architecture Overview
- **Frontend**: Single-Page Application built with React, Vite, TypeScript, and Tailwind CSS. Hosted on **Vercel**.
- **Backend**: Express REST API built with Node.js and TypeScript, hardened with Helmet, CORS, and rate-limiters. Hosted on **Render**.
- **Database & Auth**: PostgreSQL database with Row Level Security (RLS) managed by **Supabase**.
- **AI Intelligence**: Google Gemini 2.5 Flash via `@google/genai` (Server-side only).

---

## 2. Supabase Database Setup
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase dashboard.
3. Paste and run the entire migration file located at:
   `supabase/migrations/001_initial_schema.sql`
4. Confirm all 13 tables (`agents`, `purpose_passports`, `data_flow_events`, `incidents`, `approvals`, etc.) and Row Level Security policies are active.
5. In **Project Settings -> API**, copy:
   - Project URL (`SUPABASE_URL`)
   - `anon` / `public` Key (`SUPABASE_PUBLISHABLE_KEY`)
   - `service_role` Secret Key (`SUPABASE_SECRET_KEY`)

---

## 3. Backend Deployment (Render)
1. In [Render](https://render.com), create a **New Web Service** connected to your repository.
2. Root Directory: `server` (or run from root with workspaces).
3. Build Command:
   ```bash
   npm install && npm run build --workspace=shared && npm run build --workspace=server
   ```
4. Start Command:
   ```bash
   node server/dist/index.js
   ```
5. Environment Variables:
   ```env
   PORT=5000
   NODE_ENV=production
   CLIENT_URL=https://your-scopeseal-frontend.vercel.app
   GEMINI_API_KEY=your_gemini_api_key_here
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SECRET_KEY=your_supabase_service_role_key
   AUDIT_SIGNING_SECRET=secure_random_signing_secret_min_32_chars
   ```

---

## 4. Frontend Deployment (Vercel)
1. In [Vercel](https://vercel.com), create a **New Project** connected to the repository.
2. Root Directory: `client`
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=https://your-scopeseal-backend.onrender.com/api/v1
   ```

---

## 5. Local Development Quickstart
```bash
# 1. Clone repository
git clone https://github.com/your-org/scopeseal-ai.git
cd scopeseal-ai

# 2. Install monorepo dependencies
npm install

# 3. Build shared types
npm run build --workspace=shared

# 4. Start local development (Server: 5000, Client: 5173)
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to access the ScopeSeal Gateway.
