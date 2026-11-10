import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { createToken, parseToken, isTokenExpired, validateSession } from '../utils/auth'
import { DataProvider, useData } from '../context/DataContext'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { ToastProvider } from '../context/ToastContext'
import ProtectedRoute from '../components/layout/ProtectedRoute'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import { ROLES, STORAGE_KEYS } from '../utils/constants'

describe('Phase 3: Authentication & Token Session Test Suite', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  // 1. Token Helpers
  it('creates, parses, and validates tokens correctly', () => {
    const mockUser = { id: 'test-1', role: 'student', email: 'test@demo.com' }
    const token = createToken(mockUser)
    expect(token).toBeTruthy()

    const parsed = parseToken(token)
    expect(parsed.userId).toBe('test-1')
    expect(parsed.role).toBe('student')
    expect(isTokenExpired(token)).toBe(false)

    // Expired token
    const expiredPayload = { userId: 'test-1', role: 'student', expiresAt: Date.now() - 1000 }
    const expiredToken = btoa(JSON.stringify(expiredPayload))
    expect(isTokenExpired(expiredToken)).toBe(true)

    // Tampered token does not crash
    expect(parseToken('invalid-base64-!@#$%')).toBeNull()
    expect(isTokenExpired('tampered-token')).toBe(true)
  })

  // 2. Validate Session
  it('validates active session against users collection', () => {
    const users = [{ id: 'user-1', role: 'student', name: 'User One' }]
    const validToken = createToken({ id: 'user-1', role: 'student' })

    const validSession = { token: validToken, user: users[0] }
    expect(validateSession(validSession, users)).toEqual(users[0])

    // Expired token session
    const expiredToken = btoa(JSON.stringify({ userId: 'user-1', role: 'student', expiresAt: Date.now() - 5000 }))
    expect(validateSession({ token: expiredToken, user: users[0] }, users)).toBeNull()

    // Non-existent user
    expect(validateSession(validSession, [])).toBeNull()
  })

  // 3. Login with credentials & demo accounts
  it('authenticates seed users and rejects invalid credentials', () => {
    const wrapper = ({ children }) => (
      <DataProvider>
        <AuthProvider>{children}</AuthProvider>
      </DataProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    // Invalid credentials
    act(() => {
      const res = result.current.login('student1@demo.com', 'wrongpassword')
      expect(res.success).toBe(false)
      expect(res.error).toContain('Invalid email or password')
    })
    expect(result.current.currentUser).toBeNull()

    // Valid student login (case insensitive and trimmed)
    act(() => {
      const res = result.current.login('  STUDENT1@demo.com ', 'password123')
      expect(res.success).toBe(true)
      expect(res.user.role).toBe(ROLES.STUDENT)
    })
    expect(result.current.currentUser).not.toBeNull()
    expect(result.current.currentUser.name).toBe('Alex Johnson')

    // Logout
    act(() => {
      result.current.logout()
    })
    expect(result.current.currentUser).toBeNull()
  })

  // 4. Registration with validation & auto-enrollment
  it('registers new student, auto-enrolls in courses, and rejects duplicate email', () => {
    const wrapper = ({ children }) => (
      <DataProvider>
        <AuthProvider>{children}</AuthProvider>
      </DataProvider>
    )

    const { result } = renderHook(
      () => {
        const auth = useAuth()
        const data = useData()
        return { auth, data }
      },
      { wrapper }
    )

    // Reject duplicate email
    act(() => {
      const res = result.current.auth.register({
        name: 'Alex Duplicate',
        email: 'student1@demo.com',
        password: 'password123',
        role: ROLES.STUDENT,
      })
      expect(res.success).toBe(false)
      expect(res.error).toContain('already exists')
    })

    // Register new unique student
    act(() => {
      const res = result.current.auth.register({
        name: 'New Student',
        email: 'newstudent@demo.com',
        password: 'password123',
        role: ROLES.STUDENT,
      })
      expect(res.success).toBe(true)
      expect(res.user.name).toBe('New Student')
    })

    expect(result.current.auth.currentUser.email).toBe('newstudent@demo.com')

    // Check student was auto-enrolled in existing courses
    const studentCourses = result.current.data.getCoursesForStudent(
      result.current.auth.currentUser.id
    )
    expect(studentCourses.length).toBe(4) // auto-enrolled in all 4 seed courses
  })

  // 5. ProtectedRoute guards unauthorized access
  it('redirects unauthenticated and wrong-role visits', () => {
    render(
      <MemoryRouter initialEntries={['/professor']}>
        <DataProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<div>Login Screen</div>} />
              <Route
                path="/professor"
                element={
                  <ProtectedRoute allowedRole={ROLES.PROFESSOR}>
                    <div>Professor Secret Area</div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </DataProvider>
      </MemoryRouter>
    )

    // Should redirect to Login
    expect(screen.getByText('Login Screen')).toBeInTheDocument()
    expect(screen.queryByText('Professor Secret Area')).not.toBeInTheDocument()
  })

  // 6. Cross-role redirection (Student typing /professor in URL)
  it('redirects student typing /professor to /student', () => {
    const studentUser = { id: 'student-1', name: 'Alex', role: ROLES.STUDENT, email: 'student1@demo.com' }
    const token = createToken(studentUser)
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ token, user: studentUser }))

    render(
      <MemoryRouter initialEntries={['/professor']}>
        <DataProvider>
          <AuthProvider>
            <Routes>
              <Route path="/student" element={<div>Student Home Area</div>} />
              <Route
                path="/professor"
                element={
                  <ProtectedRoute allowedRole={ROLES.PROFESSOR}>
                    <div>Professor Secret Area</div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </DataProvider>
      </MemoryRouter>
    )

    expect(screen.getByText('Student Home Area')).toBeInTheDocument()
    expect(screen.queryByText('Professor Secret Area')).not.toBeInTheDocument()
  })

  // 7. Form UI validation on LoginPage
  it('validates required fields on login form submit', async () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <AuthProvider>
            <ToastProvider>
              <LoginPage />
            </ToastProvider>
          </AuthProvider>
        </DataProvider>
      </MemoryRouter>
    )

    const submitBtn = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitBtn)

    expect(await screen.findByText('Email address is required')).toBeInTheDocument()
    expect(await screen.findByText('Password is required')).toBeInTheDocument()
  })
})
