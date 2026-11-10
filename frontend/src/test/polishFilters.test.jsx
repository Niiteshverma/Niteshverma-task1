import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { DataProvider } from '../context/DataContext'
import { ToastProvider } from '../context/ToastContext'
import CourseAssignmentsPage from '../pages/CourseAssignmentsPage'
import {
  initialUsers,
  initialCourses,
  initialAssignments,
  initialGroups,
  initialAcknowledgements,
} from '../data/seedData'

function renderCoursePage(user, role = 'student', courseId = 'course-1') {
  const authValue = {
    currentUser: user,
    isAuthenticated: true,
    isLoading: false,
    login: () => ({ success: true }),
    register: () => ({ success: true }),
    logout: () => {},
  }

  const pathPrefix = role === 'professor' ? '/professor' : '/student'

  return render(
    <MemoryRouter initialEntries={[`${pathPrefix}/courses/${courseId}`]}>
      <AuthContext.Provider value={authValue}>
        <DataProvider>
          <ToastProvider>
            <Routes>
              <Route path={`${pathPrefix}/courses/:courseId`} element={<CourseAssignmentsPage />} />
            </Routes>
          </ToastProvider>
        </DataProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

describe('Phase 10: Course Assignments Filter & Search Polish Test Suite', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('am_users', JSON.stringify(initialUsers))
    localStorage.setItem('am_courses', JSON.stringify(initialCourses))
    localStorage.setItem('am_assignments', JSON.stringify(initialAssignments))
    localStorage.setItem('am_groups', JSON.stringify(initialGroups))
    localStorage.setItem('am_acknowledgements', JSON.stringify(initialAcknowledgements))
  })

  it('filters assignments in real time using the search input', async () => {
    // student-1 is enrolled in course-1 (3 assignments)
    const student1 = initialUsers.find((u) => u.id === 'student-1')
    renderCoursePage(student1, 'student', 'course-1')

    expect(await screen.findByText('Responsive Portfolio & Design System')).toBeInTheDocument()
    expect(screen.getByText('Collaborative Component Library')).toBeInTheDocument()
    expect(screen.getByText('Accessibility (a11y) & ARIA Audit')).toBeInTheDocument()

    // Type in search bar
    const searchInput = screen.getByPlaceholderText(/Search assignments by title/i)
    fireEvent.change(searchInput, { target: { value: 'Component' } })

    // Only "Collaborative Component Library" should remain visible
    expect(screen.getByText('Collaborative Component Library')).toBeInTheDocument()
    expect(screen.queryByText('Responsive Portfolio & Design System')).not.toBeInTheDocument()
    expect(screen.queryByText('Accessibility (a11y) & ARIA Audit')).not.toBeInTheDocument()

    // Search query with 0 matches triggers filter empty state
    fireEvent.change(searchInput, { target: { value: 'Nonexistent Assignment' } })
    expect(await screen.findByText('No assignments match your filters')).toBeInTheDocument()

    // Reset filters button restores all assignments
    const resetBtns = screen.getAllByRole('button', { name: /Reset Filters/i })
    fireEvent.click(resetBtns[0])

    expect(await screen.findByText('Responsive Portfolio & Design System')).toBeInTheDocument()
    expect(screen.getByText('Collaborative Component Library')).toBeInTheDocument()
    expect(screen.getByText('Accessibility (a11y) & ARIA Audit')).toBeInTheDocument()
  })

  it('filters assignments by submission type (Individual / Group)', async () => {
    const student1 = initialUsers.find((u) => u.id === 'student-1')
    renderCoursePage(student1, 'student', 'course-1')

    expect(await screen.findByText('Responsive Portfolio & Design System')).toBeInTheDocument()

    const selectElements = screen.getAllByRole('combobox')
    const typeSelect = selectElements.find(
      (sel) => sel.id === 'assignment-type-filter'
    )
    expect(typeSelect).toBeDefined()

    // Filter to Group assignments only
    fireEvent.change(typeSelect, { target: { value: 'group' } })

    expect(screen.getByText('Collaborative Component Library')).toBeInTheDocument()
    expect(screen.queryByText('Responsive Portfolio & Design System')).not.toBeInTheDocument()
    expect(screen.queryByText('Accessibility (a11y) & ARIA Audit')).not.toBeInTheDocument()

    // Filter to Individual assignments only
    fireEvent.change(typeSelect, { target: { value: 'individual' } })

    expect(screen.getByText('Responsive Portfolio & Design System')).toBeInTheDocument()
    expect(screen.getByText('Accessibility (a11y) & ARIA Audit')).toBeInTheDocument()
    expect(screen.queryByText('Collaborative Component Library')).not.toBeInTheDocument()
  })

  it('filters assignments by acknowledgement status (Pending / Acknowledged)', async () => {
    // In seed data: student-1 has acknowledged assign-1 (Responsive Portfolio), others are pending
    const student1 = initialUsers.find((u) => u.id === 'student-1')
    renderCoursePage(student1, 'student', 'course-1')

    expect(await screen.findByText('Responsive Portfolio & Design System')).toBeInTheDocument()

    const selectElements = screen.getAllByRole('combobox')
    const statusSelect = selectElements.find(
      (sel) => sel.id === 'assignment-status-filter'
    )
    expect(statusSelect).toBeDefined()

    // Filter to Acknowledged only
    fireEvent.change(statusSelect, { target: { value: 'acknowledged' } })

    expect(screen.getByText('Responsive Portfolio & Design System')).toBeInTheDocument()
    expect(screen.queryByText('Collaborative Component Library')).not.toBeInTheDocument()
    expect(screen.queryByText('Accessibility (a11y) & ARIA Audit')).not.toBeInTheDocument()

    // Filter to Pending only
    fireEvent.change(statusSelect, { target: { value: 'pending' } })

    expect(screen.queryByText('Responsive Portfolio & Design System')).not.toBeInTheDocument()
    expect(screen.getByText('Collaborative Component Library')).toBeInTheDocument()
    expect(screen.getByText('Accessibility (a11y) & ARIA Audit')).toBeInTheDocument()
  })

  it('supports filters on the professor assignments view', async () => {
    const prof1 = initialUsers.find((u) => u.id === 'prof-1')
    renderCoursePage(prof1, 'professor', 'course-1')

    expect(await screen.findByText('Responsive Portfolio & Design System')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText(/Search assignments by title/i)
    fireEvent.change(searchInput, { target: { value: 'Accessibility' } })

    expect(screen.getByText('Accessibility (a11y) & ARIA Audit')).toBeInTheDocument()
    expect(screen.queryByText('Responsive Portfolio & Design System')).not.toBeInTheDocument()
    expect(screen.queryByText('Collaborative Component Library')).not.toBeInTheDocument()
  })
})
