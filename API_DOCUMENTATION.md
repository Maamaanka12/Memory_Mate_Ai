# MemoryMate AI — API Documentation

Base URL: `http://localhost:5000`

All protected routes require header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Auth

### POST /auth/register
Create a new account.

**Body:**
```json
{ "name": "Alex Johnson", "email": "alex@example.com", "password": "secret123" }
```

**Response 201:**
```json
{
  "success": true,
  "message": "Account created.",
  "token": "<jwt>",
  "user": { "id": 1, "name": "Alex Johnson", "email": "alex@example.com", "created_at": "..." }
}
```

**Errors:** `400` missing fields · `409` email already registered

---

### POST /auth/login
**Body:**
```json
{ "email": "alex@example.com", "password": "secret123" }
```

**Response 200:**
```json
{ "success": true, "message": "Login successful.", "token": "<jwt>", "user": { "id": 1, "name": "...", "email": "...", "role": "student" } }
```

**Errors:** `400` missing fields · `401` invalid credentials

---

## Dashboard (protected)

### GET /dashboard
**Response 200:**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "notes_uploaded": 4,
    "quizzes_completed": 6,
    "avg_score": 78.5,
    "strongest_topic": "Biology",
    "weakest_topic": "Chemistry"
  }
}
```

---

## Notes (protected)

### POST /notes/upload
Multipart form-data.

**Form fields:**
| field | type | required |
|---|---|---|
| file  | File (pdf/doc/docx/ppt/pptx, max 20MB) | yes |
| topic | string | no |

**Response 201:**
```json
{ "success": true, "message": "Note uploaded.", "data": { "id": 1, "file_name": "...", "file_type": "pdf", "extracted_text": null, "summary": null, "created_at": "..." } }
```

**Errors:** `400` no file / invalid type

---

### GET /notes
List all notes for the logged-in user.

**Response 200:**
```json
{ "success": true, "data": [ { "id": 1, "file_name": "chapter1.pdf", "file_type": "pdf", "topic": "Biology", "summary": null, "has_text": 0, "created_at": "..." } ] }
```

---

### GET /notes/:id
**Response 200:** full note record. `404` if not found / not owned by user.

---

### DELETE /notes/:id
**Response 200:** `{ "success": true, "message": "Note deleted." }`

---

## Quiz (protected)

### POST /quiz/generate
**Body:**
```json
{
  "title": "Chapter 3 Review",
  "topic": "Biology",
  "quiz_type": "mixed",
  "num_questions": 5,
  "note_id": 1
}
```
`quiz_type`: `mixed | mcq | true_false | direct`. `note_id` optional.

**Response 201:**
```json
{
  "success": true,
  "data": {
    "quiz": { "id": 10, "title": "...", "status": "pending", "total_questions": 5 },
    "questions": [ { "question_type": "mcq", "question_text": "...", "options": ["A","B","C","D"], "correct_answer": "A" } ]
  }
}
```
> Currently uses placeholder question generator (see Future Integration in INSTALLATION.md).

---

### POST /quiz/submit
**Body:**
```json
{
  "quiz_id": 10,
  "time_taken_seconds": 180,
  "answers": [ { "question_id": 41, "user_answer": "Option A" } ]
}
```

**Response 200:**
```json
{ "success": true, "message": "Quiz submitted.", "data": { "score_percentage": 80, "correct": 4, "wrong": 1, "total": 5 } }
```

---

### GET /quiz/history
**Response 200:**
```json
{ "success": true, "data": [ { "id": 10, "title": "...", "status": "completed", "score_percentage": 80, "completed_at": "..." } ] }
```

---

### GET /quiz/:id
Full quiz with questions and the user's submitted answers (if any).

**Response 200:**
```json
{ "success": true, "data": { "quiz": {...}, "questions": [...], "answers": [...] } }
```

---

### GET /quiz/export/:quizId
Returns a downloadable PDF (`Content-Type: application/pdf`) containing questions, user answers, correct answers, and score.

---

## Reports (protected)

### GET /reports
**Response 200:**
```json
{
  "success": true,
  "data": {
    "progression": [ { "quiz_id": 10, "quiz_title": "...", "topic": "Biology", "score_percentage": 80, "completed_at": "..." } ],
    "topics": [ { "topic": "Biology", "attempts": 3, "avg_score": 78.5, "best_score": 90 } ],
    "history": [ { "id": 1, "quiz_id": 10, "title": "...", "score_percentage": 80, "completed_at": "..." } ]
  }
}
```

---

## Standard Error Format
```json
{ "success": false, "message": "Description of the error." }
```
Status codes used: `400` bad request · `401` unauthorized · `404` not found · `409` conflict · `500` server error.

---

## Health Check

### GET /health
```json
{ "status": "ok", "app": "MemoryMate AI", "timestamp": "..." }
```
