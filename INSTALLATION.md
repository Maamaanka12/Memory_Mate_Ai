# MemoryMate AI — Installation Guide

## Prerequisites
- Node.js 18+
- Microsoft SQL Server (local instance, Docker, or Azure SQL)
- SSMS or Azure Data Studio (recommended for running schema.sql)

---

## 1. Database Setup

1. Open `backend/database/sql/schema.sql` in SSMS or Azure Data Studio.
2. Connect to your SQL Server instance.
3. Execute the script. It creates:
   - Database `MemoryMateAI`
   - Tables: users, notes, quizzes, quiz_questions, quiz_answers, reports
   - Views: vw_user_dashboard_stats, vw_score_progression

```bash
# Or via sqlcmd:
sqlcmd -S localhost -U sa -P YourPassword -i backend/database/sql/schema.sql
```

---

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your SQL Server credentials:

```env
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=MemoryMateAI
DB_USER=sa
DB_PASSWORD=YourPassword
JWT_SECRET=generate_a_long_random_string_here
```

Run the backend:

```bash
npm run dev      # nodemon, auto-restart
# or
npm start        # production
```

Backend runs on `http://localhost:5000`. Test with:

```bash
curl http://localhost:5000/health
```

---

## 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` (Vite proxies API calls to backend `:5000`, see `vite.config.js`).

---

## 4. Verify End-to-End

1. Open `http://localhost:5173`
2. Register a new account
3. Upload a note (PDF/DOC/DOCX/PPT/PPTX)
4. Generate a quiz
5. Take the quiz, submit, review results
6. Export PDF
7. Check Dashboard and Reports update

---

## Folder Reference

```
memorymate/
├── backend/
│   ├── server.js
│   ├── .env.example
│   ├── config/db.js
│   ├── middleware/        auth.js, errorHandler.js, upload.js
│   ├── controllers/       auth, dashboard, notes, quiz, reports
│   ├── routes/            auth, dashboard, notes, quiz, reports
│   ├── services/
│   │   ├── pdfService.js
│   │   ├── summary/       extractionService.js, summaryService.js  (placeholders)
│   │   ├── quiz_generator/quizGeneratorService.js                  (placeholder)
│   │   └── memory/        cogneeService.js                         (placeholder)
│   ├── uploads/           (auto-created, per-user subfolders)
│   └── database/sql/schema.sql
└── frontend/
    └── src/
        ├── pages/          Auth, Dashboard, Notes, Quiz, Reports
        ├── components/     common/, layout/
        ├── services/       api.js, authService.js, dataService.js
        ├── context/        AuthContext.jsx
        └── styles/         global.css
```

---

## Future Integration Notes

**OpenAI (not yet wired):**
- `backend/services/summary/summaryService.js` → plug GPT call, return summary text
- `backend/services/quiz_generator/quizGeneratorService.js` → replace sample questions with GPT-generated ones from `sourceText`
- Add `OPENAI_API_KEY` to `.env`, install `openai` package

**Cognee (not yet wired):**
- `backend/services/memory/cogneeService.js` → implement `ingestDocument`, `queryMemory`, `deleteMemory`
- Call `ingestDocument` after note upload (in `notesController.uploadNote`)
- Call `queryMemory` before quiz generation to enrich context
- No schema changes needed — `notes`, `reports` tables already have comment placeholders for future Cognee ID columns
