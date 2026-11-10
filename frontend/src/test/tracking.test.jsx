import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { DataProvider } from '../context/DataContext'
import { ToastProvider } from '../context/ToastContext'
import CourseAssignmentsPage from '../pages/CourseAssignmentsPage'
import AssignmentTracking from '../components/professor/AssignmentTracking'
import {
  initialUsers,
  initialCourses,
  initialAssignments,
  initialGroups,
  initialAcknowledgements,
} from '../data/seedData'

function renderCoursePageWithProfessor(user, courseId = 'course-1') {
  const authValue = {
    currentUser: user,
    isAuthenticated: true,
    isLoading: false,
    login: () => ({ success: true }),
    register: () => ({ success: true }),
    logout: () => {},
  }

  return render(
    <MemoryRouter initialEntries={[`/professor/courses/${courseId}`]}>
      <AuthContext.Provider value={authValue}>
        <DataProvider>
          <ToastProvider>
            <Routes>
              <Route path="/professor/courses/:courseId" element={<CourseAssignmentsPage />} />
            </Routes>
          </ToastProvider>
        </DataProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

describe('Phase 9: Professor Tracking & Drill-down Test Suite', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('am_users', JSON.stringify(initialUsers))
    localStorage.setItem('am_courses', JSON.stringify(initialCourses))
    localStorage.setItem('am_assignments', JSON.stringify(initialAssignments))
    localStorage.setItem('am_groups', JSON.stringify(initialGroups))
    localStorage.setItem('am_acknowledgements', JSON.stringify(initialAcknowledgements))
  })

  it('displays accurate submission fractions and progress bars on assignment cards', async () => {
    // prof-1 teaches course-1 (4 enrolled students, 2 groups)
    // assign-1 (individual) has 1 ack from student-1 -> 1 / 4 students (25%)
    // assign-2 (group) has 0 acks -> 0 / 2 groups (0%)
    const prof1 = initialUsers.find((u) => u.id === 'prof-1')
    renderCoursePageWithProfessor(prof1, 'course-1')

    expect(await screen.findByText(/1 \/ 4 students \(25%\)/i)).toBeInTheDocument()
    expect(screen.getByText(/0 \/ 2 groups \(0%\)/i)).toBeInTheDocument()
  })

  it('clicking "Track Submissions" opens the drill-down modal with correct roster and statuses', async () => {
    const prof1 = initialUsers.find((u) => u.id === 'prof-1')
    renderCoursePageWithProfessor(prof1, 'course-1')

    // Find all "Track Submissions" buttons and click the one for assign-1
    const trackButtons = await screen.findAllByRole('button', { name: /Track Submissions/i })
    fireEvent.click(trackButtons[0])

    // Drill-down modal title opens
    expect(
      await screen.findByRole('heading', { name: /Track: Responsive Portfolio & Design System/i })
    ).toBeInTheDocument()

    // Top summary statistics
    expect(screen.getAllByText(/1 \/ 4 Students \(25%\)/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/1 Submitted/i)).toBeInTheDocument()
    expect(screen.getByText(/3 Pending/i)).toBeInTheDocument()

    // Roster checks: Alex Johnson is acknowledged, Beatriz Morales, Charlie Chen, Divya Patel are pending
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument()
    expect(screen.getByText('Beatriz Morales')).toBeInTheDocument()
    expect(screen.getByText('Charlie Chen')).toBeInTheDocument()
    expect(screen.getByText('Divya Patel')).toBeInTheDocument()

    // Should have Acknowledged badge and Pending badges
    expect(screen.getAllByText('Acknowledged').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Pending').length).toBeGreaterThanOrEqual(3)
  })

  it('filters students by search input in real time', async () => {
    const prof1 = initialUsers.find((u) => u.id === 'prof-1')
    renderCoursePageWithProfessor(prof1, 'course-1')

    const trackButtons = await screen.findAllByRole('button', { name: /Track Submissions/i })
    fireEvent.click(trackButtons[0])

    const searchInput = await screen.findByPlaceholderText(/Search by student name or email/i)
    fireEvent.change(searchInput, { target: { value: 'Beatriz' } })

    // Only Beatriz should match
    expect(screen.getByText('Beatriz Morales')).toBeInTheDocument()
    expect(screen.queryByText('Alex Johnson')).not.toBeInTheDocument()
    expect(screen.queryByText('Charlie Chen')).not.toBeInTheDocument()

    // Search with no results triggers empty state
    fireEvent.change(searchInput, { target: { value: 'Nonexistent Student' } })
    expect(screen.getByText('No Matches Found')).toBeInTheDocument()
  })

  it('filters roster by status dropdown (All / Acknowledged / Pending)', async () => {
    const prof1 = initialUsers.find((u) => u.id === 'prof-1')
    renderCoursePageWithProfessor(prof1, 'course-1')

    const trackButtons = await screen.findAllByRole('button', { name: /Track Submissions/i })
    fireEvent.click(trackButtons[0])

    const filterSelect = await screen.findByDisplayValue('All Submissions')

    // Filter to Acknowledged only
    fireEvent.change(filterSelect, { target: { value: 'acknowledged' } })
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument()
    expect(screen.queryByText('Beatriz Morales')).not.toBeInTheDocument()

    // Filter to Pending only
    fireEvent.change(filterSelect, { target: { value: 'pending' } })
    expect(screen.queryByText('Alex Johnson')).not.toBeInTheDocument()
    expect(screen.getByText('Beatriz Morales')).toBeInTheDocument()
    expect(screen.getByText('Charlie Chen')).toBeInTheDocument()
  })

  it('tracks group assignments with group leader names and member counts', async () => {
    // prof-2 teaches course-3
    // assign-6 (group) is acknowledged by student-5 for group-3 (Data Sharding Titans)
    const prof2 = initialUsers.find((u) => u.id === 'prof-2')
    renderCoursePageWithProfessor(prof2, 'course-3')

    expect(await screen.findByText(/Schema Normalization \(3NF & BCNF\)/i)).toBeInTheDocument()

    const trackButtons = screen.getAllByRole('button', { name: /Track Submissions/i })
    fireEvent.click(trackButtons[0])

    // Should display group details in modal
    expect(await screen.findByText('Data Sharding Titans')).toBeInTheDocument()
    expect(screen.getByText(/Leader: Ethan Wright • 2 members/i)).toBeInTheDocument()
  })

  it('displays "Late" badge when submission timestamp is past deadline', () => {
    const mockAssignment = {
      id: 'assign-1',
      title: 'Late Tracking Test',
      deadline: '2026-10-01T12:00:00.000Z', // student-1 acknowledged on 2026-10-22 -> late!
      submissionType: 'individual',
    }

    const mockCourse = {
      id: 'course-1',
      studentIds: ['student-1'],
    }

    render(
      <DataProvider>
        <AssignmentTracking assignment={mockAssignment} course={mockCourse} />
      </DataProvider>
    )

    // Should display late badge next to acknowledged status
    expect(screen.getByText('Late')).toBeInTheDocument()
  })
})
