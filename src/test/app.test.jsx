import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'
import { DataProvider, useData } from '../context/DataContext'
import ProtectedRoute from '../components/common/ProtectedRoute'
import LoginPage from '../pages/LoginPage'
import StudentDashboard from '../pages/StudentDashboard'
import AdminDashboard from '../pages/AdminDashboard'
import AssignmentForm from '../components/admin/AssignmentForm'
import ProgressBar from '../components/common/ProgressBar'
import { initialUsers, initialAssignments, initialSubmissions } from '../data/seedData'

describe('Assignment & Review Dashboard Test Suite', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  // 1. useLocalStorage: reads initial value
  it('useLocalStorage initializes with fallback value on empty storage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-val'))
    expect(result.current[0]).toBe('default-val')
  })

  // 2. useLocalStorage: writes and persists value
  it('useLocalStorage writes and updates state in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    act(() => {
      result.current[1]('updated-value')
    })
    expect(result.current[0]).toBe('updated-value')
    expect(JSON.parse(localStorage.getItem('test-key'))).toBe('updated-value')
  })

  // 3. useLocalStorage: falls back on invalid JSON without crashing
  it('useLocalStorage gracefully falls back to initialValue on corrupted JSON', () => {
    localStorage.setItem('corrupted-key', '{invalid-json')
    const onError = vi.fn()
    const { result } = renderHook(() => useLocalStorage('corrupted-key', { safe: true }, onError))

    expect(result.current[0]).toEqual({ safe: true })
    expect(onError).toHaveBeenCalled()
  })

  // 4. Login & Protected Routes: Student lands on student dashboard
  it('allows a student to log in and access student dashboard', async () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <MemoryRouter initialEntries={['/']}>
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route
                  path="/student"
                  element={
                    <ProtectedRoute allowedRole="student">
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </MemoryRouter>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    )

    // Click Alex Johnson (Student)
    const alexBtn = screen.getByText('Alex Johnson')
    fireEvent.click(alexBtn)

    // Expect Student Dashboard welcome message
    expect(await screen.findByText(/Welcome back, Alex Johnson!/i)).toBeInTheDocument()
  })

  // 5. Protected Route: Redirects unauthorized user
  it('redirects unauthenticated users trying to access protected routes', () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/admin']}>
            <Routes>
              <Route path="/" element={<div>Login Page Mock</div>} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <div>Admin Secret Area</div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    )

    expect(screen.getByText('Login Page Mock')).toBeInTheDocument()
    expect(screen.queryByText('Admin Secret Area')).not.toBeInTheDocument()
  })

  // 6. Data Isolation: Student sees only their own assignments
  it('ensures students see only assignments assigned to them', () => {
    const studentUser = initialUsers.find((u) => u.id === 'student-1')
    localStorage.setItem('current_user', JSON.stringify(studentUser))

    let studentAssignments = []
    function TestConsumer() {
      const { getStudentAssignments } = useData()
      studentAssignments = getStudentAssignments('student-1')
      return <div>Assignments count: {studentAssignments.length}</div>
    }

    render(
      <AuthProvider>
        <DataProvider>
          <TestConsumer />
        </DataProvider>
      </AuthProvider>
    )

    // Alex Johnson is assigned to 6 assignments
    expect(studentAssignments.length).toBe(6)
    studentAssignments.forEach((a) => {
      expect(a.assignedTo).toContain('student-1')
    })
  })

  // 7. Data Isolation: Admin sees only assignments they created
  it('ensures admins see only assignments created by them', () => {
    let admin1Assignments = []
    function TestAdminConsumer() {
      const { getAdminAssignments } = useData()
      admin1Assignments = getAdminAssignments('admin-1')
      return <div>Admin assignments: {admin1Assignments.length}</div>
    }

    render(
      <AuthProvider>
        <DataProvider>
          <TestAdminConsumer />
        </DataProvider>
      </AuthProvider>
    )

    expect(admin1Assignments.length).toBe(4)
    admin1Assignments.forEach((a) => {
      expect(a.createdBy).toBe('admin-1')
    })
  })

  // 8. Submit flow: Confirm marks submitted and double click creates only one submission
  it('submitAssignment changes status to Submitted and avoids duplicate entries', () => {
    let submitFn
    let subs = []
    function TestSubmitConsumer() {
      const { submitAssignment, submissions } = useData()
      submitFn = submitAssignment
      subs = submissions
      return <div>Submissions: {submissions.length}</div>
    }

    render(
      <AuthProvider>
        <DataProvider>
          <TestSubmitConsumer />
        </DataProvider>
      </AuthProvider>
    )

    const initialLen = subs.length
    // Submit assign-3 for student-1
    act(() => {
      submitFn('assign-3', 'student-1')
    })
    expect(subs.length).toBe(initialLen + 1)
    expect(subs.some((s) => s.assignmentId === 'assign-3' && s.studentId === 'student-1')).toBe(true)

    // Second submit call with same params must not duplicate
    act(() => {
      submitFn('assign-3', 'student-1')
    })
    expect(subs.length).toBe(initialLen + 1)
  })

  // 9. Admin form validation: empty form shows errors and blocks submit
  it('validates empty assignment form and rejects javascript: URLs', () => {
    const onSubmit = vi.fn()
    render(
      <AssignmentForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        students={initialUsers.filter((u) => u.role === 'student')}
      />
    )

    // Submit empty form
    const submitBtn = screen.getByRole('button', { name: /Create Assignment/i })
    fireEvent.click(submitBtn)

    expect(screen.getByText('Title is required')).toBeInTheDocument()
    expect(screen.getByText('Due date is required')).toBeInTheDocument()
    expect(screen.getByText('Drive link is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()

    // Test malicious javascript: link injection
    const driveInput = screen.getByLabelText(/Drive Materials Link/i)
    fireEvent.change(driveInput, { target: { value: 'javascript:alert(1)' } })
    fireEvent.click(submitBtn)

    expect(
      screen.getByText('Please enter a valid web URL starting with http:// or https://')
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  // 10. Progress percentage helper: returns 0 for 0 students (no NaN or divide-by-zero)
  it('ProgressBar handles 0 of 0 safely with 0% and no division by zero', () => {
    const { container } = render(<ProgressBar value={0} max={0} />)
    const progressbar = container.querySelector('[role="progressbar"]')
    expect(progressbar).toBeInTheDocument()
    expect(progressbar.getAttribute('aria-valuenow')).toBe('0')
  })

  // 11. Overdue Date calculation: Due today is NOT overdue, past date is overdue, submitted is never overdue
  it('isAssignmentOverdue handles dates safely without timezone bugs', async () => {
    const { isAssignmentOverdue, getTodayDateString } = await import('../utils/dateUtils')
    const today = getTodayDateString()

    // Due today: NOT overdue
    expect(isAssignmentOverdue(today, false)).toBe(false)

    // Due yesterday: IS overdue if not submitted
    const yesterday = '2020-01-01'
    expect(isAssignmentOverdue(yesterday, false)).toBe(true)

    // Due yesterday but marked submitted: NOT overdue
    expect(isAssignmentOverdue(yesterday, true)).toBe(false)

    // Future date: NOT overdue
    expect(isAssignmentOverdue('2099-12-31', false)).toBe(false)
  })

  // 12. Multi-tab sync: useLocalStorage updates when a storage event fires
  it('useLocalStorage syncs across tabs on storage event', () => {
    const { result } = renderHook(() => useLocalStorage('shared-tab-key', 'tab-initial'))
    expect(result.current[0]).toBe('tab-initial')

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'shared-tab-key',
          newValue: JSON.stringify('tab-updated-from-other-window'),
        })
      )
    })

    expect(result.current[0]).toBe('tab-updated-from-other-window')
  })
})

