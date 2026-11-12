# Student, Group & Assignment Management System
### Round 2 Frontend Enhancement — Clean UI/UX & Role-Based Workflows

A responsive, client-side academic coursework, group collaboration, and assignment acknowledgement platform built with **React 18**, **Vite**, **Tailwind CSS**, and **React Router v6**. 

The application delivers tailored role-based workflows for **Students** and **Professors** with real-time tracking, group workspaces, simulated JWT sessions, and zero third-party UI or toast dependencies.

---

## 🔗 Live Links & Submission Details

- **Live Deployment (Vercel)**: [https://niteshverma-task1.vercel.app/](https://niteshverma-task1.vercel.app/)
- **GitHub Repository**: [https://github.com/Niiteshverma/Niteshverma-task1](https://github.com/Niiteshverma/Niteshverma-task1)
- **Demo Video Walkthrough**: [Google Drive Demo Video](https://drive.google.com/file/d/1XtpOdhxhspeAQxfheXryY_Xdnn56gW4-/view?usp=drive_link)
- **Candidate Name**: Nitesh Verma
- **Registered Email**: `niiteshverma@gmail.com`

---

## 🔑 Demo Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Student (Leader)** | `priya@gmail.com` | `password123` | Priya Verma. Enrolled in CS301, CS401, CS450. Leader of *Frontend Pioneers*. |
| **Student (Member)** | `ashish@gmail.com` | `password123` | Ashish. Enrolled in CS301, CS305, CS450. Member of *Frontend Pioneers*. |
| **Student (Unassigned)**| `sagar@gmail.com` | `password123` | Sagar. Enrolled in CS401, CS305, CS450. |
| **Professor (Ritesh)**| `ritesh@gmail.com` | `password123` | Dr. Ritesh Verma. Teaches CS301 and CS401. |
| **Professor (Anil)**  | `anil@gmail.com`   | `password123` | Prof. Anil Rawat. Teaches CS305 and CS450. |

*You can also register brand-new Student and Professor accounts directly on the `/register` page.*

---

## 🛠️ Tech Stack & Philosophy

- **Framework**: React 18 (Functional Components, Custom Hooks)
- **Build Tool**: Vite (Lightning-fast HMR and optimized production chunks)
- **Styling**: Tailwind CSS (Clean utility design system, no CSS sprawl, custom colors, focus rings)
- **Navigation**: React Router v6 (Nested routes, layout preservation, dynamic splats)
- **State Management**: React Context API (`AuthContext`, `DataContext`, `ToastContext`, `ThemeContext`)
- **Mock Database / Persistence**: Web Storage API (`localStorage` with JSON validation and fallback recovery)
- **ID Generation**: Native Web Crypto (`crypto.randomUUID()`)
- **Testing**: Vitest + React Testing Library (67 automated unit and integration tests across 10 test suites)
- **Zero Heavy UI Libraries**: Built without MUI, Chakra UI, Ant Design, or external toast libraries. Every component (`Button`, `Card`, `Modal`, `ConfirmDialog`, `Input`, `Select`, `Textarea`, `Badge`, `ProgressBar`, `EmptyState`, `Toast`) is custom-crafted in `src/components/ui/`.

---

## 🚀 Key Architectural & Product Decisions

### 1. Plain Text Mock Password Rationale
> [!NOTE]
> In this client-side prototype, user passwords are stored in plain text inside `localStorage` for mock authentication. In any production software, passwords must never be stored in plain text or handled client-side; they must be securely salted and hashed using Argon2 or bcrypt on an isolated backend service.

### 2. Simulated JWT Token Session
- Upon successful login or registration, a simulated JWT-style session token is generated: a base64-encoded payload containing `{ userId, role, expiresAt }` with a **1-hour expiration**.
- On application load and on every protected route transition, the token is verified for integrity and expiration. Expired or tampered tokens immediately purge the session and redirect to `/login`.

### 3. Normalized Client-Side Data Architecture
The data model mimics a relational SQL/NoSQL schema stored in separate `localStorage` keys:
- `users`: `{ id, name, email, password, role }`
- `courses`: `{ id, name, code, professorId, studentIds: [] }`
- `assignments`: `{ id, courseId, title, description, deadline, oneDriveLink, submissionType, createdAt }`
- `groups`: `{ id, courseId, name, leaderId, memberIds: [] }`
- `acknowledgements`: `{ id, assignmentId, studentId, groupId, acknowledgedBy, acknowledgedAt }`

### 4. Registration & Auto-Enrollment Workflow
- **New Student**: Auto-enrolled into all existing courses upon registration so they immediately have access to course materials.
- **New Professor**: Starts with an empty dashboard and can create courses (`+ Create Course`). Whenever a course is created, all registered students are automatically enrolled.

### 5. Group Assignment & Leadership Flow
- A student can belong to **at most one group per course**.
- For group assignments, **only the designated group leader** can submit the acknowledgement on behalf of their group.
- Submissions require a two-step `ConfirmDialog` detailing group name and member count.
- Once submitted, the acknowledgement is instantly synchronized for all other group members, displaying who acknowledged it and when.
- Late submissions (submitted after the ISO deadline) automatically display a `"Submitted late"` warning badge for both individual and group coursework.

---

## 💻 Quick Start & Running Locally

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or pnpm

### 1. Clone the repository
```bash
git clone https://github.com/Niiteshverma/Niteshverma-task1.git
cd "NITESH VERMA taskno-1/frontend"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Run automated test suites
```bash
npm test
```
Executes all 67 unit and integration tests with Vitest in headless JSDOM.

### 5. Build for production
```bash
npm run build
```
Generates minified, production-ready assets inside the `frontend/dist` directory.

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/       # Navbar, ProtectedRoute
│   │   ├── professor/    # CourseCard, AssignmentForm, AssignmentTracking
│   │   ├── student/      # CourseCard, AssignmentCard, GroupPanel
│   │   └── ui/           # Button, Card, Input, Select, Textarea, Modal, ConfirmDialog,
│   │                     # Badge, ProgressBar, Loader, EmptyState, PageHeader, Toast
│   ├── context/          # AuthContext, DataContext, ToastContext, ThemeContext
│   ├── data/             # seedData.js (Professors, Students, Courses, Groups, Assignments)
│   ├── hooks/            # useLocalStorage
│   ├── pages/            # LoginPage, RegisterPage, StudentDashboard, ProfessorDashboard,
│   │                     # CourseAssignmentsPage
│   ├── test/             # 10 comprehensive Vitest test suites (67 tests)
│   ├── utils/            # constants.js, helpers.js, auth.js
│   ├── App.jsx           # Main application routing and providers
│   └── main.jsx          # React DOM entrypoint
├── vercel.json           # SPA rewrites configuration for clean URL routing
└── package.json
```

---

## 🧪 Test Suite Summary

Vitest automated test coverage includes:
1. `app.test.jsx` — Core routing, fallback redirects, and base layout rendering.
2. `ui.test.jsx` — Reusable UI library behaviors (variants, focus, modal keyboard traps).
3. `auth.test.jsx` — Form validation, email duplication checks, token generation, role guards.
4. `student.test.jsx` — Dashboard course filtering, access barriers, progress calculation.
5. `acknowledgement.test.jsx` — Individual submission modal confirmation, double-click lock, late badge.
6. `groups.test.jsx` — Group creation, uniqueness validation, membership joining limits.
7. `groupAcknowledgement.test.jsx` — Leader-exclusive submission, member synchronization, dialogs.
8. `professor.test.jsx` — Professor course creation, assignment publishing, edit pre-fill, cascade delete.
9. `tracking.test.jsx` — Drill-down modal, roster breakdown, real-time search, status filter.
10. `polishFilters.test.jsx` — Course-level search and filter synergy, empty reset states.

**Result: 67 / 67 passing (100% test pass rate).**

---

## 📄 License
MIT License. Submitted as part of Frontend Internship Assignment (Round 2).
