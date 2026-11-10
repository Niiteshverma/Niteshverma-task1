import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { DataProvider } from '../context/DataContext'
import { ToastProvider } from '../context/ToastContext'
import CourseAssignmentsPage from '../pages/CourseAssignmentsPage'
import AssignmentCard from '../components/student/AssignmentCard'
import {
  initialUsers,
  initialCourses,
  initialAssignments,
  initialGroups,
  initialAcknowledgements,
} from '../data/seedData'

function renderCoursePageWithUser(user, courseId = 'course-1') {
  const authValue = {
    currentUser: user,
    isAuthenticated: true,
    isLoading: false,
    login: () => ({ success: true }),
    register: () => ({ success: true }),
    logout: () => {},
  }

  return render(
    <MemoryRouter initialEntries={[`/student/courses/${courseId}`]}>
      <AuthContext.Provider value={authValue}>
        <DataProvider>
          <ToastProvider>
            <Routes>
              <Route
                path="/student/courses/:courseId"
                element={<CourseAssignmentsPage />}
              />
            </Routes>
          </ToastProvider>
        </DataProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

describe('Phase 7: Group Acknowledgement Flow Test Suite', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('am_users', JSON.stringify(initialUsers))
    localStorage.setItem('am_courses', JSON.stringify(initialCourses))
    localStorage.setItem('am_assignments', JSON.stringify(initialAssignments))
    localStorage.setItem('am_groups', JSON.stringify(initialGroups))
    localStorage.setItem('am_acknowledgements', JSON.stringify(initialAcknowledgements))
  })

  it('student not in a group sees helper text and cannot submit a group assignment', async () => {
    // student-1 is enrolled in course-2 but has no group in course-2
    const student1 = initialUsers.find((u) => u.id === 'student-1')
    renderCoursePageWithUser(student1, 'course-2')

    // Find the group assignment (assign-5: Distributed Graph Processing Engine)
    expect(await screen.findByText(/Distributed Graph Processing Engine/i)).toBeInTheDocument()

    // Should display notice to join or create group
    expect(
      screen.getByText(/You need to join or create a group to acknowledge this assignment/i)
    ).toBeInTheDocument()

    // Must NOT show any submit button for group assignment
    expect(screen.queryByRole('button', { name: /Submit for/i })).not.toBeInTheDocument()
  })

  it('student in group who is not leader sees leader notice and cannot submit', async () => {
    // student-2 is member of group-1 (Frontend Pioneers) in course-1, leader is student-1
    const student2 = initialUsers.find((u) => u.id === 'student-2')
    renderCoursePageWithUser(student2, 'course-1')

    expect(await screen.findByText(/Collaborative Component Library/i)).toBeInTheDocument()

    // Shows leader notice with leader name
    const notice = screen.getByText(/Only the group leader/i)
    expect(notice).toBeInTheDocument()
    expect(notice.parentElement).toHaveTextContent('Alex Johnson')
    expect(notice.parentElement).toHaveTextContent('can submit for your group')

    // Must not show submit button
    expect(screen.queryByRole('button', { name: /Submit for/i })).not.toBeInTheDocument()
  })

  it('group leader can submit on behalf of the group with ConfirmDialog', async () => {
    // student-1 is leader of group-1 (Frontend Pioneers) in course-1
    const student1 = initialUsers.find((u) => u.id === 'student-1')
    renderCoursePageWithUser(student1, 'course-1')

    expect(await screen.findByText(/Collaborative Component Library/i)).toBeInTheDocument()

    // Leader sees "Submit for Frontend Pioneers"
    const submitBtn = screen.getByRole('button', { name: /Submit for Frontend Pioneers/i })
    expect(submitBtn).toBeInTheDocument()

    // Click submit button -> opens confirmation dialog
    fireEvent.click(submitBtn)

    expect(
      await screen.findByText(/You are submitting on behalf of Frontend Pioneers \(2 members\)/i)
    ).toBeInTheDocument()

    // Confirm submission
    const confirmBtn = screen.getByRole('button', { name: /Confirm Submission/i })
    fireEvent.click(confirmBtn)

    // Should update to acknowledged state
    await waitFor(() => {
      expect(
        screen.getByText(/Acknowledged by you on behalf of Frontend Pioneers/i)
      ).toBeInTheDocument()
    })

    // Submit button should be gone
    expect(screen.queryByRole('button', { name: /Submit for Frontend Pioneers/i })).not.toBeInTheDocument()

    // Toast notification displayed
    expect(
      screen.getByText(/Assignment submitted on behalf of Frontend Pioneers!/i)
    ).toBeInTheDocument()
  })

  it('non-leader member sees acknowledged by leader when group has submitted', async () => {
    // In seed data, assign-6 in course-3 is already acknowledged for group-3 by student-5
    // student-6 is a member of group-3 in course-3
    const student6 = initialUsers.find((u) => u.id === 'student-6')
    renderCoursePageWithUser(student6, 'course-3')

    expect(await screen.findByText(/Schema Normalization \(3NF & BCNF\)/i)).toBeInTheDocument()

    // student-6 sees that Ethan Wright (leader) acknowledged it
    expect(
      screen.getByText(/Acknowledged by Ethan Wright on/i)
    ).toBeInTheDocument()

    // No submission button available
    expect(screen.queryByRole('button', { name: /Submit for/i })).not.toBeInTheDocument()
  })

  it('displays "Submitted late" badge when group acknowledgement is past deadline', () => {
    const overdueGroupAssignment = {
      id: 'group-assign-late',
      title: 'Late Group Project',
      description: 'Past deadline group assignment',
      deadline: '2026-10-01T12:00:00.000Z',
      submissionType: 'group',
      oneDriveLink: 'https://example.com',
    }

    const lateAck = {
      id: 'late-ack-1',
      assignmentId: 'group-assign-late',
      groupId: 'group-test',
      acknowledgedBy: 'student-1',
      acknowledgedAt: '2026-10-05T12:00:00.000Z',
    }

    const mockGroup = {
      id: 'group-test',
      name: 'Late Testers',
      leaderId: 'student-1',
      memberIds: ['student-1', 'student-2'],
    }

    const mockUser = {
      id: 'student-1',
      name: 'Alex Johnson',
    }

    render(
      <ToastProvider>
        <AssignmentCard
          assignment={overdueGroupAssignment}
          acknowledgement={lateAck}
          studentGroup={mockGroup}
          currentUser={mockUser}
        />
      </ToastProvider>
    )

    // Should display late badge
    expect(screen.getByText(/Submitted late/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Acknowledged by you on behalf of Late Testers/i)
    ).toBeInTheDocument()
  })
})
