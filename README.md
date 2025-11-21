# ScribeAI – Deployable Version (Next.js + Socket.io + Gemini)

This is a clean, deployment-ready version of the ScribeAI prototype:

- **Next.js 14 App Router** frontend
- **Node.js + Express + Socket.io** backend
- **Google Gemini** for AI meeting summaries
- **TailwindCSS** for styling
- Designed so frontend (Vercel) and backend (Render/Fly/railway) can be deployed separately.

---

## 1. Local Development

### 1.1. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 1.2. Configure environment

Copy the example env file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and put your real Gemini key:

```bash
GEMINI_API_KEY=YOUR_REAL_KEY_HERE
```

> **Important:** Do not commit `.env.local`.

### 1.3. Run backend + frontend together

```bash
npm run dev
```

This will:

- start **Next.js** dev server on `http://localhost:3000` (or 3001)
- start **Socket.io backend** on `http://localhost:4000`

Open:

```text
http://localhost:3000
```

Go to **Dashboard** and click:

- **Start** → simulates streaming partial transcript via Socket.io
- **Stop & summarize** → sends transcript to backend, calls Gemini, returns a structured summary

---

## 2. Project Structure

```text
.
├─ app/
│  ├─ layout.tsx        # Root layout
│  ├─ page.tsx          # Landing page
│  └─ dashboard/
│     └─ page.tsx       # Main dashboard with Socket.io client
├─ server/
│  └─ index.mjs         # Express + Socket.io + Gemini backend
├─ .env.example         # Example env file
├─ package.json
├─ tailwind.config.js
├─ postcss.config.js
└─ next.config.mjs
```

---

## 3. Deployment Guide

### 3.1. Deploy Backend (Render example)

1. Push this project to a GitHub repo.
2. On Render:
   - Create a new **Web Service**
   - Connect the repo
   - Set **Root Directory** to `/` (root)
   - Set **Build Command**:
     ```bash
     npm install --legacy-peer-deps
     ```
   - Set **Start Command**:
     ```bash
     node server/index.mjs
     ```
   - Set **Environment Variable**:
     - `GEMINI_API_KEY=your_real_key`
     - `PORT=4000` (or use Render's default and change in code to `process.env.PORT`)
3. Deploy and note the public URL, e.g.:
   ```text
   https://scribeai-backend.onrender.com
   ```

### 3.2. Deploy Frontend (Vercel example)

1. On **Vercel**, import the same GitHub repo.
2. Set **Framework**: Next.js
3. Set environment variables:
   - `NEXT_PUBLIC_SOCKET_URL=https://scribeai-backend.onrender.com`
4. Build & deploy.

Now the deployed Next.js app will connect to the deployed backend via Socket.io using `NEXT_PUBLIC_SOCKET_URL`.

---

## 4. How the Data Flows

1. User clicks **Start** on `/dashboard`:
   - For now, the app **simulates** streaming transcript chunks to demonstrate
     the Socket.io pipeline and state handling.

2. The frontend sends `socket.emit("transcript", line)` for each line.

3. The backend (`server/index.mjs`):
   - Collects transcript lines per `socket.id`
   - On `"stop"` event:
     - Concatenates the full transcript
     - Calls Gemini with a structured prompt
     - Emits `"summary"` back to the client

4. The frontend listens to `"summary"` and renders the AI summary.

---

## 5. Notes and Extensions

You can extend this baseline to:

- Replace simulated transcript with **real microphone + STT (e.g., Whisper, Deepgram, etc.)**
- Add **download buttons** for TXT/PDF
- Store session history in a database (supabase / postgres + Prisma)
- Add auth and multi-user rooms

This repo is intentionally kept minimal and clean so it:
- Runs locally without heavy extra setup
- Is easy to deploy to Vercel + Render
- Demonstrates the core streaming + summarization architecture.
