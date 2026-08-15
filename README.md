<p align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-00D18A?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-4-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" />
  <img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" />
</p>

# 🏛️ Nagrik — Smart Citizen Grievance System

> **A full-stack civic grievance management platform** that bridges the gap between citizens and government departments. Citizens can report infrastructure issues, track complaint progress in real-time, and rate resolutions — while admins and employees manage, assign, and resolve complaints through dedicated dashboards.

## 🌐 Live Deployments

The system is fully deployed and ready for testing. You can explore the citizen, admin, and employee portals using the live application link below.

| Component | Status | Environment | Access Details |
|-----------|--------|-------------|----------------|
| **Frontend UI (App)** | Active & Deployed | Vercel | Publicly accessible at: [smart-citizen-grievance-system.vercel.app](https://smart-citizen-grievance-system.vercel.app) |
| **Backend (API)** | Active & Deployed | Render | Publicly accessible at: [smart-citizen-grievance-system.onrender.com](https://smart-citizen-grievance-system.onrender.com) |
| **Database** | Secured & Connected | MongoDB Atlas | Private Cluster (URL restricted for security purposes) |

> **Note:** The backend API is hosted on Render's free tier, which sleeps after 15 minutes of inactivity. **The first request might take 30-50 seconds** to wake up the server. Subsequent requests will be fast.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Three-Portal System](#-three-portal-system)
- [API Reference](#-api-reference)
- [Database Models](#-database-models)
- [Complaint Lifecycle](#-complaint-lifecycle)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)

---

## ✨ Key Features

| Category | Features |
|----------|----------|
| **Citizen Portal** | File complaints with photo evidence & GPS location, track status in real-time, view complaint history timeline, join existing complaints, rate resolved complaints, manage profile & notification preferences |
| **Admin Portal** | Comprehensive dashboard with analytics & KPIs, manage complaints (assign, escalate, resolve), department & employee CRUD management, geo-mapped complaint visualization (Leaflet), user management with status toggle, publish announcements, handle support tickets, export reports (PDF/Excel) |
| **Employee Portal** | View assigned complaints, update complaint status with notes, personal dashboard with workload stats, profile management |
| **Gamification** | Karma System where citizens earn points for reporting valid civic issues, dynamically showcased on a public "Wall of Fame" Leaderboard widget |
| **AI Integration** | Smart Priority Detection via Groq API (llama-3-8b) parsing complaint title/description to accurately assign structural priority (Low to Emergency) automatically |
| **Authentication** | OTP-based registration & login via Email (Brevo API), JWT access tokens with middleware protection, forgot password flow with OTP verification, role-based access control (Citizen / Admin / Employee) |
| **Real-Time** | Socket.io powered live notification delivery, instant complaint status update push to citizens |
| **Smart Features** | Duplicate complaint detection, SLA tracking (7-day overdue alerts), emergency mode for critical complaints, community feed for public complaints |
| **UX/UI** | Enterprise Dark Mode (Tailwind v4 variables), Multi-language Support (i18next with English/Hindi offline persistence) |
| **PWA** | Installable as a mobile app, service worker for offline support, responsive design for all devices |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2 | UI framework with functional components & hooks |
| Vite | 8.1 | Lightning-fast dev server & optimized builds |
| Tailwind CSS | 4.3 | Utility-first styling with custom design tokens |
| React Router | 7.18 | Client-side routing with protected routes |
| Axios | 1.18 | HTTP client with JWT interceptors |
| Socket.io Client | 4.8 | Real-time bidirectional communication |
| Recharts | 3.10 | Data visualization for analytics dashboards |
| Leaflet + React Leaflet | 1.9 / 5.0 | Interactive geo-mapped complaint visualization |
| Lucide React | 1.25 | Modern icon library |
| i18next | 24.2 | Internationalization (English/Hindi Support) |
| jsPDF + ExcelJS | 4.2 / 4.4 | PDF & Excel report generation |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 24.x | JavaScript runtime |
| Express | 5.2 | Web framework with modular routing |
| Mongoose | 9.8 | MongoDB ODM with schema validation |
| Socket.io | 4.8 | Real-time event broadcasting |
| JSON Web Token | 9.0 | Stateless authentication |
| bcrypt.js | 3.0 | Password hashing |
| Multer | 2.2 | Multipart file upload handling |
| Cloudinary | HTTP API | Permanent Image Storage for Complaints |
| Brevo | HTTP API | Email OTP delivery (Bypasses local SMTP blocks) |
| Groq SDK | 0.15 | AI LLM Integration for smart priority detection |
| node-cron | 4.6 | Scheduled task management |

### Infrastructure

| Service | Purpose |
|---------|---------|
| MongoDB Atlas | Cloud database (free tier) |
| Vercel | Frontend hosting with global CDN |
| Render | Backend hosting with auto-deploy |
| GitHub | Source control & CI/CD triggers |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Vercel)                    │
│                                                       │
│  React 19 + Vite 8 + Tailwind CSS 4                  │
│  ┌─────────┐  ┌──────────┐  ┌────────────────────┐   │
│  │ Citizen  │  │  Admin   │  │    Employee         │   │
│  │ Portal   │  │  Portal  │  │    Portal           │   │
│  └────┬─────┘  └────┬─────┘  └────────┬───────────┘   │
│       │              │                 │               │
│       └──────────────┼─────────────────┘               │
│                      │                                 │
│              Axios + Socket.io Client                  │
└──────────────────────┼─────────────────────────────────┘
                       │ HTTPS / WSS
┌──────────────────────┼─────────────────────────────────┐
│                SERVER (Render)                          │
│                                                        │
│  Express 5 + Socket.io 4                               │
│  ┌──────────┐ ┌────────────┐ ┌──────────────────────┐  │
│  │ Auth     │ │ Complaint  │ │ Admin / Dashboard    │  │
│  │ Module   │ │ Module     │ │ Module               │  │
│  ├──────────┤ ├────────────┤ ├──────────────────────┤  │
│  │ JWT +    │ │ CRUD +     │ │ Analytics + User     │  │
│  │ OTP +    │ │ History +  │ │ Mgmt + Departments   │  │
│  │ RBAC     │ │ SLA Track  │ │ + Employees          │  │
│  └──────────┘ └────────────┘ └──────────────────────┘  │
│  ┌──────────┐ ┌────────────┐ ┌──────────────────────┐  │
│  │ Notif.   │ │ Support    │ │ Announcement         │  │
│  │ Module   │ │ Module     │ │ Module               │  │
│  └──────────┘ └────────────┘ └──────────────────────┘  │
│                      │                                 │
│              Mongoose ODM                              │
└──────────────────────┼─────────────────────────────────┘
                       │
            ┌──────────┴──────────┐
            │   MongoDB Atlas     │
            │   (Cloud Database)  │
            └─────────────────────┘
```

---

## 🚪 Three-Portal System

### 👤 Citizen Portal — `/dashboard`

| Page | Description |
|------|-------------|
| Dashboard | Overview with complaint stats, recent activity, and quick actions |
| New Complaint | Multi-step form with category selection, photo upload, GPS location, and priority level |
| My Complaints | Filterable list of all filed complaints with status badges |
| Complaint Detail | Full timeline, status history, rating system, and join feature |
| Notifications | Real-time notification center (Socket.io powered) |
| Profile | Edit personal information and avatar |
| Settings | Notification preferences and account settings |
| Help & Support | Submit support tickets and view FAQs |

### 🛡️ Admin Portal — `/admin`

| Page | Description |
|------|-------------|
| Dashboard | KPIs, charts, system status, recent complaints overview |
| Complaints | Full complaint management with search, filter, assign, and escalate |
| Complaint Detail | Complete history, employee assignment, status updates, and resolution |
| Departments | CRUD management for 6 government departments |
| Employees | Add/manage department employees with role assignments |
| Users | Citizen management with account status toggle |
| Map View | Geographic complaint visualization using Leaflet clustering |
| Analytics | Recharts-powered data visualization (trends, category distribution, resolution times) |
| Announcements | Create and publish public announcements |
| Support Tickets | Manage citizen support requests |
| Settings | System configuration and preferences |

### 👷 Employee Portal — `/employee`

| Page | Description |
|------|-------------|
| Dashboard | Assigned workload stats and pending actions |
| Complaints | View and manage assigned complaints |
| Complaint Detail | Update status, add resolution notes |
| Profile | Personal information management |
| Settings | Account preferences |

---

## 📡 API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/send-otp` | Public | Send OTP for registration |
| `POST` | `/verify-otp` | Public | Verify registration OTP |
| `POST` | `/register` | Public | Complete registration |
| `POST` | `/login/send-otp` | Public | Send OTP for login |
| `POST` | `/login/verify-otp` | Public | Verify login OTP & get JWT |
| `POST` | `/forgot-password/send-otp` | Public | Send password reset OTP |
| `POST` | `/forgot-password/reset` | Public | Reset password with OTP |
| `GET` | `/me` | Protected | Get current user profile |
| `PUT` | `/me` | Protected | Update profile |
| `PUT` | `/change-password` | Protected | Change password |
| `PUT` | `/notification-preferences` | Protected | Update notification settings |

### Complaints — `/api/complaints`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/` | Protected | File new complaint (with photo upload) |
| `GET` | `/my` | Protected | Get my complaints |
| `GET` | `/search` | Protected | Search complaints |
| `GET` | `/check-duplicate` | Protected | AI duplicate detection |
| `POST` | `/:id/join` | Protected | Join existing complaint |
| `POST` | `/:id/rate` | Protected | Rate resolved complaint |
| `GET` | `/:id` | Protected | Get complaint details |
| `GET` | `/:id/history` | Protected | Get complaint status history |

### Admin — `/api/admin`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/dashboard/summary` | Admin | Dashboard KPIs & stats |
| `GET` | `/dashboard/recent-complaints` | Admin | Latest complaints overview |
| `GET` | `/dashboard/system-status` | Admin | System health check |
| `GET` | `/complaints-map` | Admin | Geo-data for map visualization |
| `GET` | `/analytics` | Admin | Charts & trend data |
| `GET` | `/search` | Admin | Global search |
| `GET` | `/citizens` | Admin | List all citizens |
| `GET` | `/citizens/:id` | Admin | Citizen detail view |
| `PUT` | `/citizens/:id/toggle-status` | Admin | Enable/disable citizen account |

### Additional API Groups

| Base Path | Access | Description |
|-----------|--------|-------------|
| `/api/dashboard` | Protected | Citizen dashboard stats |
| `/api/notifications` | Protected | CRUD notifications |
| `/api/support` | Protected | Create support tickets |
| `/api/departments` | Admin | Department CRUD |
| `/api/employees` | Admin | Employee CRUD |
| `/api/admin/complaints` | Admin | Admin complaint management |
| `/api/admin/support-tickets` | Admin | Manage support tickets |
| `/api/admin/announcements` | Admin | Announcement CRUD |
| `/api/announcements` | Public | View announcements |
| `/api/employee` | Employee | Employee self-service |
| `/api/public` | Public | Community feed data |

---

## 🗄️ Database Models

| Model | Key Fields | Description |
|-------|-----------|-------------|
| **Citizen** | name, email, phone, password, role, isVerified, notificationPrefs | Registered user (Citizen/Admin/Employee) |
| **Complaint** | title, description, category, location (GeoJSON), photo, status, priority, department, assignedTo, rating | Core grievance entity |
| **ComplaintHistory** | complaint, status, changedBy, notes, timestamp | Immutable audit trail of status changes |
| **Notification** | citizen, title, message, type, isRead | Real-time notification record |
| **SupportTicket** | citizen, subject, message, status, adminReply | Citizen support request |
| **Announcement** | title, content, isActive, createdBy | Admin-published announcements |
| **Department** | name, description, isActive | Government department |
| **OTP** | phone, otp, expiresAt | Temporary OTP storage (auto-expires) |

---

## 🔄 Complaint Lifecycle

```
  ┌──────────┐     ┌──────────────┐     ┌──────────┐
  │ Submitted │────▶│ Under Review │────▶│ Assigned │
  └──────────┘     └──────────────┘     └────┬─────┘
                                             │
                                             ▼
  ┌──────────┐     ┌────────────────────┐  ┌──────────┐
  │  Closed  │◀────│ Citizen Confirmation│◀─│ Resolved │
  └──────────┘     └────────────────────┘  └──────────┘
       ▲                    │
       │                    ▼
       │              ┌──────────┐     ┌─────────────┐
       └──────────────│ Reopened │────▶│ In Progress │
                      └──────────┘     └─────────────┘
```

| Status | Description |
|--------|-------------|
| **Submitted** | Citizen filed the complaint |
| **Under Review** | Admin is reviewing the complaint |
| **Assigned** | Complaint assigned to a department employee |
| **Accepted** | Employee accepted the assignment |
| **In Progress** | Work is actively underway |
| **Resolved** | Employee marked as resolved |
| **Citizen Confirmation** | Awaiting citizen satisfaction confirmation |
| **Closed** | Citizen confirmed resolution OR auto-closed |
| **Reopened** | Citizen reopened an unsatisfactory resolution |

### SLA Tracking

Complaints remaining in **"Submitted"** status for more than **7 days** are flagged as **overdue** — triggering alerts on the admin dashboard.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas) free cluster)
- **npm** ≥ 9.x

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/kasimshah19/smart-citizen-grievance-system.git
cd smart-citizen-grievance-system

# 2. Install server dependencies
cd server
npm install

# 3. Install client dependencies
cd ../client
npm install
```

### Running Locally

```bash
# Terminal 1 — Start the backend (port 5000)
cd server
npm run dev

# Terminal 2 — Start the frontend (port 5173)
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔐 Environment Variables

### Server (`server/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `JWT_SECRET` | Secret key for JWT signing | `your_super_secret_key` |
| `BREVO_API_KEY` | API Key for Brevo HTTP Email Service | `xkeysib-your_api_key` |
| `BREVO_SENDER_EMAIL` | Verified sender email on Brevo | `your_email@gmail.com` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Account Cloud Name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary Account API Key | `your_api_key` |
| `CLOUDINARY_API_SECRET`| Cloudinary Account API Secret| `your_api_secret` |
| `CLIENT_URL` | Frontend URL for CORS | `https://your-frontend.vercel.app` |

### Client (`.env` or Vercel Dashboard)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://your-backend.onrender.com` |

> 💡 Copy `server/.env.example` to `server/.env` and fill in your values.

---

## 🌐 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | **Vercel** | [smart-citizen-grievance-system.vercel.app](https://smart-citizen-grievance-system.vercel.app) |
| Backend | **Render** | [smart-citizen-grievance-system.onrender.com](https://smart-citizen-grievance-system.onrender.com) |
| Database | **MongoDB Atlas** | Cloud-hosted free tier |

### Deploy Your Own

1. **Fork** this repository
2. **Backend** → [Render](https://render.com) → New Web Service → Root: `server` → Build: `npm install` → Start: `node index.js`
3. **Frontend** → [Vercel](https://vercel.com) → Import repo → Root: `client` → Add `VITE_API_URL` env var
4. **Connect** → Set `CLIENT_URL` on Render pointing to your Vercel URL

---

## 📁 Project Structure

```
smart-citizen-grievance-system/
├── client/                          # React Frontend
│   ├── public/                      # Static assets, PWA manifest, service worker
│   ├── src/
│   │   ├── assets/                  # Images and SVGs
│   │   ├── components/
│   │   │   ├── common/              # ProtectedRoute, AdminRoute, EmployeeRoute
│   │   │   └── layout/              # Sidebar, TopNav, AdminLayout, EmployeeLayout
│   │   ├── constants/               # Complaint categories, statuses, priorities
│   │   ├── contexts/                # AuthContext (JWT state management)
│   │   ├── pages/                   # 32 page components (Citizen/Admin/Employee)
│   │   ├── services/                # Axios API client, Socket.io client
│   │   ├── shared/constants/        # Shared enums (roles, departments, statuses)
│   │   └── utils/                   # Helper functions
│   ├── index.html                   # Entry HTML
│   ├── vercel.json                  # SPA rewrite rules for Vercel
│   └── vite.config.js               # Vite + Tailwind configuration
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── config/                  # MongoDB connection
│   │   ├── middleware/              # JWT auth guard, Multer file upload
│   │   ├── modules/
│   │   │   ├── admin/               # Admin dashboard, analytics, user management
│   │   │   ├── announcement/        # CRUD announcements
│   │   │   ├── auth/                # Registration, login, OTP, password reset
│   │   │   ├── complaint/           # Complaint CRUD, admin & employee controllers
│   │   │   ├── dashboard/           # Citizen dashboard aggregation
│   │   │   ├── department/          # Department management
│   │   │   ├── employee/            # Employee CRUD & self-service
│   │   │   ├── notification/        # Notification system
│   │   │   ├── public/              # Community feed
│   │   │   └── support/             # Support ticket system
│   │   ├── shared/
│   │   │   ├── constants/           # Roles, departments, priorities, statuses
│   │   │   ├── services/            # Email service (Brevo HTTP API via fetch)
│   │   │   └── utils/               # SLA tracking utility
│   │   ├── server.js                # Express app setup, CORS, routes
│   │   └── socket.js                # Socket.io initialization & helpers
│   ├── uploads/                     # Complaint photo storage
│   ├── .env.example                 # Environment variable template
│   └── index.js                     # Entry point
│
└── README.md                        # You are here 📍
```

---

## 📸 Screenshots

> 🚧 *Screenshots coming soon — visit the [live demo](https://smart-citizen-grievance-system.vercel.app) to experience the platform.*

---

## 🤝 Contributing

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push the branch: `git push origin feature/amazing-feature`
5. Open a **Pull Request**

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Author

**Kasim Shah** — *Full-Stack Developer*

A passionate Full-Stack Developer specializing in the MERN stack. I focus on building scalable web applications, robust APIs, and modern, interactive user interfaces that solve real-world problems.

| 🌐 Contact & Profiles | 🔗 Link / Detail |
|-----------------------|------------------|
| **GitHub**            | [@kasimshah19](https://github.com/kasimshah19) |
| **Email**             | [kasimshah998@gmail.com](mailto:kasimshah998@gmail.com) |
| **Role**              | Full-Stack MERN Developer |

---

<p align="center">
  <sub>Built with ❤️ using the MERN Stack</sub>
</p>
