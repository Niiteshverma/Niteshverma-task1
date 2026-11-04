# Technical Interview Notes & Cheat Sheet

This guide is designed to help you explain every architectural decision, data flow, and file in plain English during an interview without hesitation.

---

## 1. Folder Structure Explained Simply

- **`src/components/common/`**: Reusable UI elements used throughout the entire app (Modal, ProgressBar, Header, EmptyState, Loader, ErrorState, ProtectedRoute).
- **`src/components/student/`**: Components specifically built for the student view (AssignmentCard, StudentProgress).
- **`src/components/admin/`**: Components specifically built for professor management (AssignmentForm, AdminAssignmentCard, StudentStatusList).
- **`src/context/`**: React Context providers that share global state across the app without prop drilling (AuthContext, DataContext, ThemeContext).
- **`src/hooks/`**: Custom hooks encapsulating reusable logic (`useLocalStorage` for storage synchronization).
- **`src/data/`**: Initial mock seed data (2 professors, 5 students, 8 assignments, pre-filled submissions).
- **`src/pages/`**: Top-level page views rendered by React Router (LoginPage, StudentDashboard, AdminDashboard).
- **`src/utils/`**: Shared helper functions (`formatDate`, `isOverdue`, `getPercentage`, `isValidUrl`) and application constants (`ROLES`, `STATUS`, `STORAGE_KEYS`).
- **`src/test/`**: Automated unit and integration test suite using Vitest and React Testing Library.

---

## 2. File-by-File Summary (What Each File Does)

### Core
- **`src/main.jsx`**: The application entry point that mounts the root React component into the HTML DOM.
- **`src/App.jsx`**: Defines application routes (`/`, `/student`, `/admin`), role-based guards, and wraps the app with Context providers.
- **`src/index.css`**: Injects Tailwind CSS directives (`base`, `components`, `utilities`).

### Utils & Data
- **`src/utils/constants.js`**: Central place for common strings and numbers (`ROLES`, `STATUS`, `STORAGE_KEYS`, `LOADING_DELAY`) to avoid magic values.
- **`src/utils/helpers.js`**: Pure utility functions for date formatting, safe percentage calculation, overdue detection, and HTTP URL validation.
- **`src/data/seedData.js`**: Provides initial realistic mock data for users, assignments, and submissions when localStorage is empty.

### Hooks & Context
- **`src/hooks/useLocalStorage.js`**: Custom hook that reads state from `localStorage` on load, saves updates automatically, and syncs across multiple open tabs.
- **`src/context/AuthContext.jsx`**: Manages the logged-in user session, role verification, and login/logout functions.
- **`src/context/DataContext.jsx`**: Central state store for assignments and submissions with helper methods for CRUD operations and student status queries.
- **`src/context/ThemeContext.jsx`**: Manages light and dark mode toggling by syncing a `.dark` class on the root HTML element and saving the preference in `localStorage`.

### Common Components
- **`src/components/common/Header.jsx`**: Persistent navigation bar displaying branding, active user info, role badge, theme toggle, and logout button.
- **`src/components/common/ProtectedRoute.jsx`**: Route wrapper that blocks unauthenticated visitors and redirects users if their role does not match the page.
- **`src/components/common/Modal.jsx`**: Accessible dialog overlay that traps keyboard focus, closes on Escape/backdrop click, and restores focus on close.
- **`src/components/common/ProgressBar.jsx`**: Accessible visual progress bar with clamped percentages and zero-division protection.
- **`src/components/common/EmptyState.jsx`**: Friendly empty message with an optional action button when no assignments match.
- **`src/components/common/Loader.jsx`**: Centered animated loading spinner displayed during brief simulated delays.
- **`src/components/common/ErrorState.jsx`**: Warning screen displayed if localStorage data is corrupted, complete with a "Reset data" button.

### Student Components
- **`src/components/student/AssignmentCard.jsx`**: Displays assignment title, description, formatted due date, overdue indicator, Drive materials link, and two-step submission trigger.
- **`src/components/student/StudentProgress.jsx`**: Summarizes the student's personal completion rate (e.g. "3 of 5 submitted") with a progress bar.

### Admin Components
- **`src/components/admin/AdminAssignmentCard.jsx`**: Displays professor assignment details with Edit and Delete actions and an embedded student tracking list.
- **`src/components/admin/AssignmentForm.jsx`**: Form for creating or editing assignments with field validation, Drive URL checks, and student targeting checkboxes.
- **`src/components/admin/StudentStatusList.jsx`**: Lists all enrolled students with live "Submitted" / "Not submitted" badges and an overall class completion bar.

### Pages
- **`src/pages/LoginPage.jsx`**: Mock user selector grouped into Admins and Students for passwordless instant sign-in.
- **`src/pages/StudentDashboard.jsx`**: Main student workspace featuring progress overview, filter tabs (All/Pending/Submitted), due date sorting, and assignment grid.
- **`src/pages/AdminDashboard.jsx`**: Main professor workspace for creating, editing, and deleting assignments and reviewing student submission rates.

---

## 3. The Full Data Flow (Step-by-Step)

```
[1. User clicks profile on LoginPage]
               ↓
[2. AuthContext sets currentUser in localStorage]
               ↓
[3. Router navigates to /student or /admin]
               ↓
[4. ProtectedRoute verifies user.role matches route]
               ↓
[5. Dashboard reads assignments from DataContext]
               ↓
[6. Student clicks "Yes, I have submitted" -> Modal -> Confirm]
               ↓
[7. DataContext.submitAssignment updates submissions state & localStorage]
               ↓
[8. React re-renders: Student badge turns green, Progress increments]
               ↓
[9. Admin logs in or views card: DataContext calculates matching submissions live]
```

---

## 4. Why These Architectural Decisions? (Answers You Can Say Out Loud)

1. **Why separate `submissions` from `assignments` instead of nesting submissions inside each assignment?**
   > *"In real database design, assignments and student submissions have a many-to-many relationship. If 5 students are assigned one project, each student has their own unique status and submission timestamp. Keeping `submissions` as an independent collection `[{ assignmentId, studentId, status, submittedAt }]` prevents concurrent update conflicts, mirrors relational best practices, and makes querying and cascade deletion clean."*

2. **Why Context API instead of Redux or Zustand?**
   > *"For a frontend application of this size with two primary entities (auth and assignments), native React Context provides clean, global state without adding unnecessary third-party dependencies, extra boilerplate, or bundle overhead."*

3. **Why `localStorage` with a custom hook?**
   > *"Since there is no backend server, `localStorage` provides persistent state that survives page reloads. Wrapping it in a single `useLocalStorage` hook keeps state updates reactive in React while automatically serializing to JSON and catching corrupted data with fallback seeds."*

4. **Why React Router with `ProtectedRoute`?**
   > *"React Router provides declarative client-side navigation. The custom `ProtectedRoute` component ensures role-based authorization so students cannot accidentally or intentionally browse to admin URLs and vice versa."*

---

## 5. 10 Likely Interview Questions with Simple Answers

### Q1: How did you prevent duplicate submissions if a student double-clicks "Confirm"?
**Answer:** In `DataContext.submitAssignment`, we perform an existence check (`prev.some(...)`) before appending to the array. If a submission for that `assignmentId` and `studentId` already exists, the state is returned unchanged. Additionally, the confirm button is temporarily disabled while executing.

### Q2: How do you handle division by zero in your progress bar?
**Answer:** In `getPercentage(value, total)`, we check `if (!total || total <= 0) return 0`. This guarantees that if a professor assigns 0 students or a student has 0 assignments, the component renders `0%` cleanly without producing `NaN` or crashing.

### Q3: How do you prevent timezone bugs when calculating overdue assignments?
**Answer:** We compare standardized local calendar date strings formatted as `YYYY-MM-DD` (e.g. `'2026-10-15' < '2026-11-04'`). Lexicographical string comparison on ISO dates is 100% timezone-safe and avoids UTC vs local midnight offsets. If an assignment is due today, it is not marked overdue until tomorrow.

### Q4: How is data isolation enforced between users?
**Answer:** In the student dashboard, we filter `assignments.filter(a => a.assignedTo.includes(studentId))`. In the admin dashboard, we filter `assignments.filter(a => a.createdBy === adminId)`. In `DataContext`, mutations like `updateAssignment` and `deleteAssignment` also verify creator ownership.

### Q5: What happens if a user's localStorage contains corrupted or invalid JSON?
**Answer:** `useLocalStorage` wraps `JSON.parse` in a `try/catch` block. If parsing throws an error, it logs a warning, falls back to the default seed data, and invokes an `onError` callback that surfaces a user-friendly `ErrorState` card with a "Reset data" button.

### Q6: How did you ensure accessibility (a11y) in the Modal component?
**Answer:** The modal has `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`. On mount, it focuses the first interactive element and intercepts Tab/Shift+Tab to trap keyboard focus inside the dialog. When closed, it automatically restores focus back to the button that originally triggered it.

### Q7: Why didn't you store filtered lists and percentage progress in React `useState`?
**Answer:** Storing derived data in `useState` creates redundant state and synchronization bugs. Instead, we calculate filtered lists (`visibleAssignments`) and progress counts as plain derived variables directly during component render from existing `assignments` and `submissions`.

### Q8: How did you protect against XSS when students open Drive links?
**Answer:** We validated all input links with `isValidUrl` ensuring the protocol is strictly `http:` or `https:`, which rejects dangerous protocols like `javascript:alert(1)`. When rendering links, we use `target="_blank"` with `rel="noopener noreferrer"`.

### Q9: What happens to submissions when an admin edits an assignment and removes a student?
**Answer:** In `updateAssignment`, whenever `assignedTo` is modified, we filter the submissions list to prune any records where `assignmentId` matches and the student is no longer in the new `assignedTo` array. This ensures zero orphaned submission data.

### Q10: How does multi-tab synchronization work?
**Answer:** In `useLocalStorage`, we attach a listener to `window.addEventListener('storage', ...)`. When a change occurs in another browser tab, the event listener parses the new value and updates React state so all open tabs stay in sync without requiring a page refresh.

---

## 6. Known Limitations & Future Improvements

1. **Client-Side Storage Quota**: `localStorage` has a ~5MB quota and is scoped to a single browser. In a production app, this would be backed by a REST or GraphQL API and PostgreSQL database.
2. **Mock Authentication**: There is no password verification or JWT session token. In production, we would integrate OAuth2, Auth0, or Supabase Auth.
3. **Real File Attachments**: The system records submission confirmation timestamps rather than uploading binary PDF/ZIP files. With more time, we could integrate AWS S3 or Cloudinary for direct student file uploads.
