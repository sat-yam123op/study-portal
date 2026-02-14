# Family Study Portal

A full-stack study portal where an Admin uploads study materials (subjects → topics → notes/files/videos) and Students log in to view and study.

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS v4
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas with Mongoose
- **Auth:** JWT + bcrypt
- **File Uploads:** Multer (local `/uploads` directory)
- **Rich Text:** React Quill
- **Video:** YouTube link embedding

---

## Project Structure

```
vision/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── api/          # Axios instance
│       ├── components/   # Reusable UI components
│       ├── context/      # Auth context
│       └── pages/        # All page components
├── server/          # Express backend
│   ├── config/      # DB connection
│   ├── controllers/ # Route handlers
│   ├── middleware/   # Auth, upload, error handler
│   ├── models/      # Mongoose schemas
│   ├── routes/      # API routes
│   ├── uploads/     # Uploaded files directory
│   ├── seed.js      # Admin creation script
│   └── server.js    # Entry point
└── README.md
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- npm

### 1. Clone & Install

```bash
# Backend
cd server
cp .env.example .env     # Edit with your MongoDB URI & JWT secret
npm install

# Frontend
cd ../client
cp .env.example .env     # Leave VITE_API_URL empty for local dev
npm install
```

### 2. Configure Environment Variables

**server/.env:**
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/study-portal
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@studyportal.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Admin
```

**client/.env:**
```
VITE_API_URL=
```

### 3. Seed Admin User

```bash
cd server
npm run seed
```

This creates the admin account using credentials from `.env`.

### 4. Run Development

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### 5. Default Login

- **Admin:** admin@studyportal.com / Admin@123
- **Students:** Register via the Register page

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Register student |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/subjects` | Yes | List subjects |
| POST | `/api/subjects` | Admin | Create subject |
| PUT | `/api/subjects/:id` | Admin | Update subject |
| DELETE | `/api/subjects/:id` | Admin | Delete subject + cascade |
| GET | `/api/topics?subjectId=x` | Yes | List topics |
| POST | `/api/topics` | Admin | Create topic |
| PUT | `/api/topics/:id` | Admin | Rename topic |
| DELETE | `/api/topics/:id` | Admin | Delete topic + cascade |
| GET | `/api/materials/:topicId` | Yes | Get all material |
| PUT | `/api/materials/:topicId/notes` | Admin | Save notes |
| POST | `/api/materials/:topicId/files` | Admin | Upload file |
| DELETE | `/api/materials/:topicId/files/:fileId` | Admin | Delete file |
| POST | `/api/materials/:topicId/videos` | Admin | Add video |
| DELETE | `/api/materials/:topicId/videos/:videoId` | Admin | Delete video |
| GET | `/api/announcements` | Yes | List announcements |
| POST | `/api/announcements` | Admin | Create announcement |
| DELETE | `/api/announcements/:id` | Admin | Delete announcement |
| GET | `/api/search?q=keyword` | Yes | Search everything |

---

## Deployment

### Backend → Render / Railway

1. Push `server/` to a Git repo
2. Create a new Web Service on [Render](https://render.com)
3. Set root directory to `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables (MONGO_URI, JWT_SECRET, CLIENT_URL)
7. Note the deployed URL (e.g. `https://study-portal-api.onrender.com`)

### Frontend → Vercel

1. Push `client/` to a Git repo
2. Import on [Vercel](https://vercel.com)
3. Framework: Vite
4. Root directory: `client`
5. Environment variable: `VITE_API_URL=https://your-backend-url.onrender.com`
6. Add `vercel.json` for SPA routing (already works with Vite defaults)

### Post-Deploy

- Update `CLIENT_URL` in backend env to your Vercel URL
- Run seed script once: connect to your Render shell and run `node seed.js`

---

## Features

- **Admin:** Create subjects, topics, upload files, add notes (rich text), embed YouTube videos, post announcements
- **Student:** Browse subjects, view topics, read notes, download files, watch videos, see announcements
- **Search:** Global search across subjects, topics, notes, filenames, video titles
- **Security:** JWT auth, bcrypt hashing, role-based access, file type validation
- **UI:** Clean modern design, sidebar navigation, mobile responsive, loading states, confirmation dialogs
