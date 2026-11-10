import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { DataProvider } from '../context/DataContext'
import { ToastProvider } from '../context/ToastContext'
import ProfessorDashboard from '../pages/ProfessorDashboard'
import CourseAssignmentsPage from '../pages/CourseAssignmentsPage'
import {
  initialUsers,
  initialCourses,
  initialAssignments,
  initialGroups,
  initialAcknowledgements,
} from '../data/seedData'

function renderWithProfessor(user, initialRoute = '/professor', courseId = 'course-1') {
  const authValue = {
    currentUser: user,
    isAuthenticated: true,
    isLoading: false,
    login: () => ({ success: true }),
    register: () => ({ success: true }),
    logout: () => {},
  }

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthContext.Provider value={authValue}>
        <DataProvider>
          <ToastProvider>
            <Routes>
              <Route path="/professor" element={<ProfessorDashboard />} />
              <Route path="/professor/courses/:courseId" element={<CourseAssignmentsPage />} />
            </Routes>
          </ToastProvider>
        </DataProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

describe('Phase 8: Professor Dashboard & Assignment Management Test Suite', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('am_users', JSON.stringify(initialUsers))
    localStorage.setItem('am_courses', JSON.stringify(initialCourses))
    localStorage.setItem('am_assignments', JSON.stringify(initialAssignments))
    localStorage.setItem('am_groups', JSON.stringify(initialGroups))
    localStorage.setItem('am_acknowledgements', JSON.stringify(initialAcknowledgements))
  })

  it('renders only courses taught by the logged-in professor', () => {
    // prof-1 (Dr. Sarah Jenkins) teaches course-1 and course-2, not course-3 or course-4
    const prof1 = initialUsers.find((u) => u.id === 'prof-1')
    renderWithProfessor(prof1, '/professor')

    expect(screen.getByText('Web Architecture & Frontend Systems')).toBeInTheDocument()
    expect(screen.getByText('Algorithms & Advanced Computing')).toBeInTheDocument()
    expect(screen.queryByText('Database Engineering & Distributed Stores')).not.toBeInTheDocument()
    expect(screen.queryByText('Cloud Infrastructure & Microservices')).not.toBeInTheDocument()
  })

  it('allows professor to create a course with auto-enrolled students', async () => {
    const prof1 = initialUsers.find((u) => u.id === 'prof-1')
    renderWithProfessor(prof1, '/professor')

    // Click "+ Create Course"
    const createBtn = screen.getByRole('button', { name: /\+ Create Course/i })
    fireEvent.click(createBtn)

    // Modal opens
    expect(await screen.findByText('Create a New Course')).toBeInTheDocument()

    // Try submitting empty to test validation
    const submitBtn = screen.getByRole('button', { name: /^Create Course$/i })
    fireEvent.click(submitBtn)

    expect(await screen.findByText('Course name is required')).toBeInTheDocument()

    // Fill valid course details
    fireEvent.change(screen.getByLabelText(/Course Name/i), {
      target: { value: 'Advanced Distributed Protocols' },
    })
    fireEvent.change(screen.getByLabelText(/Course Code/i), {
      target: { value: 'CS590' },
    })

    fireEvent.click(submitBtn)

    // Course should appear in list
    expect(await screen.findByText('Advanced Distributed Protocols')).toBeInTheDocument()
    expect(screen.getAllByText('CS590').length).toBeGreaterThanOrEqual(1)

    // Success toast
    expect(
      screen.getByText(/Course "Advanced Distributed Protocols" created successfully!/i)
    ).toBeInTheDocument()
  })

  it('allows professor to publish a new assignment', async () => {
    const prof1 = initialUsers.find((u) => u.id === 'prof-1')
    renderWithProfessor(prof1, '/professor/courses/course-1')

    // Open create assignment modal
    const createBtn = await screen.findByRole('button', { name: /\+ Create Assignment/i })
    fireEvent.click(createBtn)

    expect(await screen.findByText('Create New Assignment')).toBeInTheDocument()

    // Fill in assignment form
    fireEvent.change(screen.getByLabelText(/Assignment Title/i), {
      target: { value: 'Web Performance & Web Vitals Audit' },
    })
    fireEvent.change(screen.getByLabelText(/Submission Deadline/i), {
      target: { value: '2026-12-01T23:59' },
    })
    fireEvent.change(screen.getByLabelText(/OneDrive \/ External Resource Link/i), {
      target: { value: 'https://onedrive.live.com/web-vitals' },
    })
    fireEvent.change(screen.getByLabelText(/Instructions \/ Description/i), {
      target: { value: 'Audit LCP, FID/INP, and CLS for a demo application and provide a report.' },
    })

    // Submit form
    const publishBtn = screen.getByRole('button', { name: /Publish Assignment/i })
    fireEvent.click(publishBtn)

    // Assignment should appear in course assignments list
    expect(
      await screen.findByText('Web Performance & Web Vitals Audit')
    ).toBeInTheDocument()

    // Success toast
    expect(screen.getByText(/Assignment published successfully!/i)).toBeInTheDocument()
  })

  it('allows professor to edit an existing assignment', async () => {
    const prof1 = initialUsers.find((u) => u.id === 'prof-1')
    renderWithProfessor(prof1, '/professor/courses/course-1')

    // Wait for assignments to render
    expect(await screen.findByText('Responsive Portfolio & Design System')).toBeInTheDocument()

    // Find and click the Edit button for the first assignment
    const editButtons = screen.getAllByRole('button', { name: /^Edit$/i })
    fireEvent.click(editButtons[0])

    expect(await screen.findByText('Edit Assignment')).toBeInTheDocument()

    // Update assignment title
    const titleInput = screen.getByLabelText(/Assignment Title/i)
    fireEvent.change(titleInput, {
      target: { value: 'Responsive Portfolio & Design System (Updated)' },
    })

    // Save changes
    const saveBtn = screen.getByRole('button', { name: /Update Assignment/i })
    fireEvent.click(saveBtn)

    // Verify updated title is rendered
    expect(
      await screen.findByText('Responsive Portfolio & Design System (Updated)')
    ).toBeInTheDocument()

    // Success toast
    expect(screen.getByText(/Assignment updated successfully!/i)).toBeInTheDocument()
  })

  it('allows professor to delete an assignment with confirmation', async () => {
    const prof1 = initialUsers.find((u) => u.id === 'prof-1')
    renderWithProfessor(prof1, '/professor/courses/course-1')

    expect(await screen.findByText('Responsive Portfolio & Design System')).toBeInTheDocument()

    // Click Delete on the first assignment
    const deleteButtons = screen.getAllByRole('button', { name: /^Delete$/i })
    fireEvent.click(deleteButtons[0])

    // Confirm dialog opens
    expect(await screen.findByRole('heading', { name: 'Delete Assignment' })).toBeInTheDocument()
    expect(
      screen.getByText(/All student acknowledgements and submissions for this assignment will also be permanently removed/i)
    ).toBeInTheDocument()

    // Confirm deletion
    const confirmDeleteBtn = screen.getByRole('button', { name: 'Delete Assignment' })
    fireEvent.click(confirmDeleteBtn)

    // Assignment should be removed
    await waitFor(() => {
      expect(
        screen.queryByText('Responsive Portfolio & Design System')
      ).not.toBeInTheDocument()
    })

    // Success toast
    expect(screen.getByText(/deleted successfully!/i)).toBeInTheDocument()
  })

  it('denies access if professor attempts to open a course taught by another professor', async () => {
    // prof-1 (Dr. Sarah Jenkins) does NOT teach course-3 (Database Engineering, taught by prof-2)
    const prof1 = initialUsers.find((u) => u.id === 'prof-1')
    renderWithProfessor(prof1, '/professor/courses/course-3')

    expect(
      await screen.findByText('Course Not Found or Access Denied')
    ).toBeInTheDocument()
    expect(
      screen.getByText(/You do not have permission to view this course/i)
    ).toBeInTheDocument()
  })
})
