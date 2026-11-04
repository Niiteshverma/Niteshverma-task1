# Assignment & Review Dashboard

A responsive, client-side student-assignment and review platform built with React, Vite, and Tailwind CSS. The application supports two distinct user roles—**Students** and **Admins (Professors)**—with zero backend dependencies by persisting state directly in `localStorage`.

---

## Features Overview

### Role-Based Access & Authentication
- **Mock User Switcher**: Quickly sign in as any of the 2 pre-seeded professors or 5 students with a single click.
- **Protected Routing**: Role-specific dashboards (`/student` and `/admin`). Students cannot access the admin area and professors cannot access student views. Logged-out users are redirected to `/`.
- **Session Persistence**: Active user session is saved in `localStorage` and persists across page reloads.

### Student Experience
- **Personalized Assignment Feed**: Students see only the assignments specifically assigned to them.
- **Two-Step Submission Flow**: Click *"Yes, I have submitted"* to trigger a modal confirmation dialog. Confirmed submissions update status immediately and hide the submission button.
- **Overall Progress Tracker**: Visual progress bar indicating completed tasks (e.g., *"3 of 5 submitted (60%)"*).
- **Status Filter & Sorting (Bonus)**: Filter assignments by *All*, *Pending*, or *Submitted*, and sort by due date (*Soonest first* / *Latest first*).
- **Overdue Indicator (Bonus)**: Unsubmitted assignments with past due dates are highlighted with an *Overdue* badge.
- **External Resources**: Open Google Drive assignment materials in a new tab with secure `rel="noopener noreferrer"`.

### Admin (Professor) Experience
- **Author Isolation**: Professors view and manage only assignments they created (`createdBy === admin.id`).
- **Assignment Creation & Editing**: Create new assignments or edit existing ones using a modal form with title, description, due date, Google Drive link, and targeted student selection.
- **Selective Audience Targeting**: Assign to all students with one click or pick specific students using individual checkboxes.
- **Cascade Deletion**: Confirmation dialog before deleting an assignment; cascades to remove all associated student submission records.
- **Class Submission Tracking**: Expandable per-student status list and completion progress bar (e.g., *"3 of 5 students submitted (60%)"*).

### General & Polish
- **Dark Mode (Bonus)**: Seamless theme switcher toggling between light and dark modes with persistent user preference in `localStorage`.
- **Loading & Empty States**: Simulated ~500ms loader and tailored empty states for both roles.
- **Storage Corruption Recovery**: Error state if `localStorage` data is corrupted, complete with a *"Reset data"* button to safely reload seeds.
- **Accessibility**: Semantic HTML, visible focus styles, ARIA roles for dialogs (`role="dialog"`, `aria-modal="true"`) and progress bars (`role="progressbar"`), and labeled form controls.
- **Responsive Layout**: Designed for mobile (360px), tablet (768px), and desktop (1280px+).

---

## Tech Stack

- **React 18** (JavaScript, functional components, hooks)
- **Vite** (Build tool and fast local dev server)
- **Tailwind CSS** (Utility-first styling with dark mode support)
- **React Router v6** (`BrowserRouter`, `Routes`, `Route`, `Navigate`)
- **Context API** (`AuthContext`, `DataContext`, `ThemeContext`)
- **Web Storage API** (`localStorage` via custom `useLocalStorage` hook)
- **Native Web Crypto** (`crypto.randomUUID()` for unique identifiers)

---

## Setup & Running Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
1. Clone or extract the repository to your local machine.
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server
Run the local Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173/`.

### Testing
Run unit and integration tests with Vitest:
```bash
npm test
```

### Production Build & Preview
To create an optimized production build:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

---

## Folder Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── AdminAssignmentCard.jsx   # Assignment card for professors with tracking
│   │   ├── AssignmentForm.jsx        # Create & edit modal form with validation
│   │   └── StudentStatusList.jsx     # Per-student status checklist & completion bar
│   ├── common/
│   │   ├── EmptyState.jsx            # Friendly placeholder when no data exists
│   │   ├── ErrorState.jsx            # Fallback error card with Reset action
│   │   ├── Header.jsx                # Top navbar with user badge, theme toggle & logout
│   │   ├── Loader.jsx                # Animated loading spinner
│   │   ├── Modal.jsx                 # Accessible dialog with backdrop and Escape listener
│   │   ├── ProgressBar.jsx           # Reusable clamped progress indicator
│   │   └── ProtectedRoute.jsx        # Role-based route guard
│   └── student/
│       ├── AssignmentCard.jsx        # Student card with submission trigger & Drive link
│       └── StudentProgress.jsx       # Student overall completion summary & bar
├── context/
│   ├── AuthContext.jsx               # Current user session and login/logout handlers
│   ├── DataContext.jsx               # Assignments, submissions, CRUD & cascade actions
│   └── ThemeContext.jsx              # Light / Dark theme management
├── data/
│   └── seedData.js                   # Initial mock users, assignments, and submissions
├── hooks/
│   └── useLocalStorage.js            # Custom hook syncing state with localStorage
├── pages/
│   ├── AdminDashboard.jsx            # Admin control center
│   ├── LoginPage.jsx                 # Mock user picker (Admins & Students)
│   └── StudentDashboard.jsx          # Student assignment feed & submission workflow
├── test/
│   ├── app.test.jsx                  # Vitest unit and integration test suite
│   └── setup.js                      # Test setup and localStorage polyfill
├── utils/
│   ├── constants.js                  # Shared status, roles, and storage constants
│   └── helpers.js                    # Formatting, date calculations & URL validators
├── App.jsx                           # Application routing and provider tree
├── index.css                         # Tailwind CSS directives
└── main.jsx                          # React application root
```

---

## Component Architecture & Data Flow

```
+--------------------------------------------------------------------------+
|                              ThemeProvider                               |
+--------------------------------------------------------------------------+
|                              AuthProvider                                |
+--------------------------------------------------------------------------+
|                              DataProvider                                |
+--------------------------------------------------------------------------+
|                             BrowserRouter                                |
|                                                                          |
|   /                 -->  <LoginPage />                                   |
|   /student          -->  <ProtectedRoute allowedRole="student">          |
|                               <StudentDashboard />                       |
|                          </ProtectedRoute>                               |
|   /admin            -->  <ProtectedRoute allowedRole="admin">            |
|                               <AdminDashboard />                         |
|                          </ProtectedRoute>                               |
+--------------------------------------------------------------------------+
```

1. **`useLocalStorage`**: Custom hook that reads on initialization with `try/catch` fallback to seed defaults and automatically serializes state updates to `localStorage`.
2. **`AuthContext`**: Exposes `{ currentUser, login, logout }`. The `ProtectedRoute` component interrogates `currentUser` and redirects unauthorized visits using `{ replace: true }`.
3. **`DataContext`**: Serves as the single source of truth for assignments and submissions:
   - Separate state arrays for `assignments` and `submissions`.
   - Helper methods: `getStudentAssignments`, `getAdminAssignments`, `getStudentSubmission`.
   - Mutation methods: `submitAssignment`, `createAssignment`, `updateAssignment`, `deleteAssignment`, and `resetData`.

---

## Key Design Decisions

1. **Separation of Submissions and Assignments**:
   - Instead of nesting submission objects directly inside each assignment object, submissions are modeled in an independent collection `{ assignmentId, studentId, status, submittedAt }`.
   - *Why*: In a class where multiple students are assigned the same project, each student's submission status is distinct. Separating submissions mirrors relational and NoSQL best practices, prevents concurrency conflicts, and makes tracking and pruning clean.
2. **Context API over Redux/Zustand**:
   - For an application of this scope, native React Context API (`AuthContext`, `DataContext`, `ThemeContext`) provides simple, predictable state management without extra bundle weight or external dependencies.
3. **Robust LocalStorage Recovery**:
   - Any JSON parsing error (e.g. invalid or corrupted data in storage) is caught safely by `useLocalStorage`, falling back to initial seed data and surfacing an `ErrorState` banner with a one-click reset button.
4. **Mock User Switcher without Passwords**:
   - For interview assessment and reviewer testing, a mock user picker categorized into Admins and Students eliminates friction while still providing authentic role-based workflows and route guards.

---

## Known Limitations

- **Client-Side Only**: All persistence is confined to the local browser's `localStorage`. Opening the application in a different browser or incognito session starts with fresh seed data.
- **Simulated File Uploads**: The submission flow confirms student completion without accepting binary file uploads (Drive links are used for course materials).
- **Storage Limits**: `localStorage` has a typical quota of ~5MB, which is more than sufficient for text records but not suited for large binary payloads.
