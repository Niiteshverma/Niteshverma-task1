import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { DataProvider, useData } from '../context/DataContext'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { ToastProvider, useToast } from '../context/ToastContext'
import CourseAssignmentsPage from '../pages/CourseAssignmentsPage'
import AssignmentCard from '../components/student/AssignmentCard'
import { createToken } from '../utils/auth'
import { STORAGE_KEYS, ROLES } from '../utils/constants'

describe('Phase 5: Individual Acknowledgement Test Suite', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  const loginAsStudent = (id = 'student-1', name = 'Alex Johnson') => {
    const studentUser = { id, name, role: ROLES.STUDENT, email: `${id}@demo.com` }
    const token = createToken(studentUser)
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ token, user: studentUser }))
  }

  // 1. Two-step confirmation: Cancel changes nothing
  it('opens confirmation dialog on "Yes, I have submitted" and cancel does nothing', () => {
    loginAsStudent()
    const mockAssignment = {
      id: 'assign-test-1',
      title: 'Individual React Lab',
      description: 'Build a component',
      deadline: '2026-11-20T23:59:00.000Z',
      oneDriveLink: 'https://onedrive.live.com/test',
      submissionType: 'individual',
    }

    render(
      <MemoryRouter>
        <DataProvider>
          <AuthProvider>
            <ToastProvider>
              <AssignmentCard assignment={mockAssignment} acknowledgement={null} />
            </ToastProvider>
          </AuthProvider>
        </DataProvider>
      </MemoryRouter>
    )

    const submitBtn = screen.getByRole('button', { name: /yes, i have submitted/i })
    expect(submitBtn).toBeInTheDocument()

    // Open confirmation dialog
    fireEvent.click(submitBtn)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Confirm Assignment Submission')).toBeInTheDocument()

    // Click Cancel
    const cancelBtn = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelBtn)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Submit button still available
    expect(screen.getByRole('button', { name: /yes, i have submitted/i })).toBeInTheDocument()
  })

  // 2. Confirm records acknowledgement with timestamp and triggers toast
  it('confirms acknowledgement, removes button, displays timestamp, and shows success toast', async () => {
    loginAsStudent('student-1', 'Alex Johnson')

    render(
      <MemoryRouter initialEntries={['/student/courses/course-1']}>
        <DataProvider>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route path="/student/courses/:courseId" element={<CourseAssignmentsPage />} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </DataProvider>
      </MemoryRouter>
    )

    // Course 1 has assign-3 (individual, due today, not yet acknowledged by student-1)
    expect(await screen.findByText('Accessibility (a11y) & ARIA Audit')).toBeInTheDocument()

    // Find submit button for assign-3
    const submitButtons = screen.getAllByRole('button', { name: /yes, i have submitted/i })
    expect(submitButtons.length).toBeGreaterThan(0)

    fireEvent.click(submitButtons[0])

    // Confirm dialog appears
    const confirmBtn = screen.getByRole('button', { name: /yes, confirm/i })
    fireEvent.click(confirmBtn)

    // Verify success toast appears
    expect(await screen.findByText('Assignment acknowledged successfully!')).toBeInTheDocument()

    // Both assign-1 and assign-3 are now acknowledged
    const acks = await screen.findAllByText(/acknowledged on/i)
    expect(acks.length).toBeGreaterThanOrEqual(2)
  })

  // 3. Late submission badge displayed when acknowledged after deadline
  it('displays "Submitted late" badge when acknowledged timestamp exceeds deadline', () => {
    loginAsStudent()
    const mockLateAssignment = {
      id: 'assign-late',
      title: 'Late Project Task',
      description: 'Past task instructions',
      deadline: '2026-10-10T12:00:00.000Z',
      submissionType: 'individual',
    }

    const mockLateAck = {
      id: 'ack-late-1',
      assignmentId: 'assign-late',
      studentId: 'student-1',
      acknowledgedAt: '2026-10-15T14:00:00.000Z', // 5 days after deadline
    }

    render(
      <MemoryRouter>
        <DataProvider>
          <AuthProvider>
            <ToastProvider>
              <AssignmentCard
                assignment={mockLateAssignment}
                acknowledgement={mockLateAck}
              />
            </ToastProvider>
          </AuthProvider>
        </DataProvider>
      </MemoryRouter>
    )

    expect(screen.getByText('Submitted late')).toBeInTheDocument()
    expect(screen.getByText(/acknowledged on/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /yes, i have submitted/i })).not.toBeInTheDocument()
  })

  // 4. One student's acknowledgement does not affect another student
  it('ensures student acknowledgements are strictly isolated', () => {
    const wrapper = ({ children }) => (
      <DataProvider>
        <AuthProvider>{children}</AuthProvider>
      </DataProvider>
    )

    const { result } = renderHook(
      () => {
        const data = useData()
        return data
      },
      { wrapper }
    )

    // Acknowledge assign-3 for student-1
    act(() => {
      result.current.acknowledgeAssignment({
        assignmentId: 'assign-3',
        studentId: 'student-1',
        userId: 'student-1',
      })
    })

    // student-1 has ack
    const student1Ack = result.current.getAcknowledgement('assign-3', 'student-1', null)
    expect(student1Ack).not.toBeNull()

    // student-2 does NOT have ack
    const student2Ack = result.current.getAcknowledgement('assign-3', 'student-2', null)
    expect(student2Ack).toBeNull()
  })

  // 5. Duplicate acknowledgement protection (double-click safety)
  it('prevents duplicate acknowledgement records on double click', () => {
    const wrapper = ({ children }) => (
      <DataProvider>
        <AuthProvider>{children}</AuthProvider>
      </DataProvider>
    )

    const { result } = renderHook(() => useData(), { wrapper })

    act(() => {
      result.current.acknowledgeAssignment({
        assignmentId: 'assign-4',
        studentId: 'student-1',
        userId: 'student-1',
      })
    })

    const countAfterFirst = result.current.acknowledgements.length

    // Attempt second acknowledge on same assignment
    act(() => {
      result.current.acknowledgeAssignment({
        assignmentId: 'assign-4',
        studentId: 'student-1',
        userId: 'student-1',
      })
    })

    expect(result.current.acknowledgements.length).toBe(countAfterFirst)
  })
})
