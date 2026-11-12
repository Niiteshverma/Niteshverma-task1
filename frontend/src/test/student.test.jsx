import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { DataProvider } from '../context/DataContext'
import { AuthProvider } from '../context/AuthContext'
import { ToastProvider } from '../context/ToastContext'
import StudentDashboard from '../pages/StudentDashboard'
import CourseAssignmentsPage from '../pages/CourseAssignmentsPage'
import CourseCard from '../components/student/CourseCard'
import AssignmentCard from '../components/student/AssignmentCard'
import { createToken } from '../utils/auth'
import { STORAGE_KEYS, ROLES } from '../utils/constants'

describe('Phase 4: Student Dashboard & Course Assignments Page Test Suite', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  const loginAsStudent1 = () => {
    const studentUser = {
      id: 'student-1',
      name: 'Alex Johnson',
      role: ROLES.STUDENT,
      email: 'student1@demo.com',
    }
    const token = createToken(studentUser)
    localStorage.setItem(
      STORAGE_KEYS.SESSION,
      JSON.stringify({ token, user: studentUser })
    )
  }

  // 1. CourseCard rendering & progress calculation
  it('renders CourseCard with professor name, assignment count, and acknowledgement progress', () => {
    loginAsStudent1()
    const mockCourse = {
      id: 'course-1',
      name: 'Web Architecture & Frontend Systems',
      code: 'CS301',
      professorId: 'prof-1',
      studentIds: ['student-1', 'student-2'],
    }

    render(
      <MemoryRouter>
        <DataProvider>
          <AuthProvider>
            <CourseCard course={mockCourse} studentId="student-1" />
          </AuthProvider>
        </DataProvider>
      </MemoryRouter>
    )

    expect(screen.getByText('Web Architecture & Frontend Systems')).toBeInTheDocument()
    expect(screen.getByText('CS301')).toBeInTheDocument()
    expect(screen.getByText('Dr. Ritesh Verma')).toBeInTheDocument()
    // Course 1 has 3 assignments, student-1 has 1 seed acknowledgement (assign-1)
    expect(screen.getByText('1 of 3 acknowledged')).toBeInTheDocument()
  })

  // 2. StudentDashboard renders only enrolled courses
  it('renders only courses enrolled by the active student on dashboard', async () => {
    loginAsStudent1()

    render(
      <MemoryRouter initialEntries={['/student']}>
        <DataProvider>
          <AuthProvider>
            <ToastProvider>
              <StudentDashboard />
            </ToastProvider>
          </AuthProvider>
        </DataProvider>
      </MemoryRouter>
    )

    // student-1 is enrolled in course-1, course-2, and course-4 (not course-3)
    expect(
      await screen.findByText('Web Architecture & Frontend Systems')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Algorithms & Advanced Computing')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Cloud Infrastructure & Microservices')
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Database Engineering & Distributed Stores')
    ).not.toBeInTheDocument()
  })

  // 3. CourseAssignmentsPage: Overdue, Due-soon, and Acknowledged badges
  it('displays accurate status badges and OneDrive external link on assignment cards', () => {
    const mockOverdue = {
      id: 'test-1',
      title: 'Past Assignment',
      description: 'Past task instructions',
      deadline: '2026-10-01T23:59:00.000Z',
      oneDriveLink: 'https://onedrive.live.com/test-spec',
      submissionType: 'individual',
    }

    const { rerender } = render(
      <AssignmentCard assignment={mockOverdue} acknowledgement={null} />
    )

    expect(screen.getByText('Past Assignment')).toBeInTheDocument()
    // Overdue badge and highlight
    expect(screen.getByText('Overdue')).toBeInTheDocument()
    // External link
    const link = screen.getByRole('link', { name: /onedrive materials/i })
    expect(link).toHaveAttribute('href', 'https://onedrive.live.com/test-spec')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')

    // Acknowledged state
    const mockAck = {
      id: 'ack-test',
      acknowledgedAt: '2026-10-02T12:00:00.000Z',
    }
    rerender(<AssignmentCard assignment={mockOverdue} acknowledgement={mockAck} />)
    expect(screen.getByText('Acknowledged')).toBeInTheDocument()
    expect(screen.queryByText('Overdue')).not.toBeInTheDocument()
  })

  // 4. Course enrollment guard on CourseAssignmentsPage
  it('renders access denied empty state when a student opens an unenrolled course id', async () => {
    loginAsStudent1()

    render(
      // Course-3 is taught by Prof Turing and enrolled by students 2, 4, 5, 6 (not student-1)
      <MemoryRouter initialEntries={['/student/courses/course-3']}>
        <DataProvider>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route
                  path="/student/courses/:courseId"
                  element={<CourseAssignmentsPage />}
                />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </DataProvider>
      </MemoryRouter>
    )

    expect(
      await screen.findByText('Course Not Found or Access Denied')
    ).toBeInTheDocument()
    expect(
      screen.getByText(/you do not have permission to view this course/i)
    ).toBeInTheDocument()
  })
})

