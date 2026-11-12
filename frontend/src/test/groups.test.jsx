import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { DataProvider, useData } from '../context/DataContext'
import { AuthProvider } from '../context/AuthContext'
import { ToastProvider } from '../context/ToastContext'
import CourseAssignmentsPage from '../pages/CourseAssignmentsPage'
import GroupPanel from '../components/student/GroupPanel'
import { createToken } from '../utils/auth'
import { STORAGE_KEYS, ROLES } from '../utils/constants'

describe('Phase 6: Groups Management Test Suite', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  const loginAsStudent = (id = 'student-5', name = 'Ethan Wright') => {
    const studentUser = { id, name, role: ROLES.STUDENT, email: `${id}@demo.com` }
    const token = createToken(studentUser)
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ token, user: studentUser }))
  }

  // 1. Student without group sees "+ Create Group" and available course groups
  it('renders "+ Create Group" button and available groups list when student is not in a group', () => {
    // In seed data for course-1, student-5 is not enrolled, student-4 is in group-2.
    // Let's create an enrolled student without group in course-2: student-5 and student-6 have no group in course-2
    loginAsStudent('student-5', 'Ethan Wright')

    render(
      <MemoryRouter>
        <DataProvider>
          <AuthProvider>
            <ToastProvider>
              <GroupPanel courseId="course-2" />
            </ToastProvider>
          </AuthProvider>
        </DataProvider>
      </MemoryRouter>
    )

    expect(screen.getByRole('button', { name: /\+ create group/i })).toBeInTheDocument()
    expect(screen.getByText(/you are currently not part of any team/i)).toBeInTheDocument()
  })

  // 2. Empty group name rejected with validation message
  it('rejects empty group name with validation error', async () => {
    loginAsStudent('student-5', 'Ethan Wright')

    render(
      <MemoryRouter>
        <DataProvider>
          <AuthProvider>
            <ToastProvider>
              <GroupPanel courseId="course-2" />
            </ToastProvider>
          </AuthProvider>
        </DataProvider>
      </MemoryRouter>
    )

    // Open Create Group modal
    fireEvent.click(screen.getByRole('button', { name: /\+ create group/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Submit without typing name
    const submitBtn = screen.getByRole('button', { name: /create & become leader/i })
    fireEvent.click(submitBtn)

    expect(await screen.findByText('Group name is required')).toBeInTheDocument()
  })

  // 3. Duplicate group name rejected
  it('rejects duplicate group name within the same course', async () => {
    // In seed data, course-1 already has "Frontend Pioneers"
    // Let's test createGroup directly in context
    const wrapper = ({ children }) => (
      <DataProvider>
        <AuthProvider>{children}</AuthProvider>
      </DataProvider>
    )

    const { result } = renderHook(() => useData(), { wrapper })

    let createResult
    act(() => {
      createResult = result.current.createGroup({
        courseId: 'course-1',
        name: 'frontend pioneers', // case-insensitive check
        leaderId: 'student-99',
      })
    })

    expect(createResult.success).toBe(false)
    expect(createResult.error).toContain('already exists')
  })

  // 4. Creating group makes the student the leader
  it('creates group successfully, makes student the leader, and shows Leader badge', async () => {
    loginAsStudent('student-5', 'Ethan Wright')

    render(
      <MemoryRouter>
        <DataProvider>
          <AuthProvider>
            <ToastProvider>
              <GroupPanel courseId="course-2" />
            </ToastProvider>
          </AuthProvider>
        </DataProvider>
      </MemoryRouter>
    )

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /\+ create group/i }))

    // Type group name
    const input = screen.getByLabelText(/group name/i)
    fireEvent.change(input, { target: { value: 'Algorithm Wizards' } })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /create & become leader/i }))

    // Verify modal closes and active group view renders
    expect(await screen.findByText('Algorithm Wizards')).toBeInTheDocument()
    expect(screen.getByText('Leader')).toBeInTheDocument()
    expect(screen.getAllByText(/Sagar/i).length).toBeGreaterThanOrEqual(1)
  })

  // 5. Joining an existing group updates members list
  it('allows an unassigned student to join an existing course group', async () => {
    // In seed data for course-1, group-1 has student-1 (leader) and student-2
    // Let's have an enrolled student without group (or join through joinGroup API)
    const wrapper = ({ children }) => (
      <DataProvider>
        <AuthProvider>{children}</AuthProvider>
      </DataProvider>
    )

    const { result } = renderHook(() => useData(), { wrapper })

    // student-5 joins group-1 in course-1
    let joinRes
    act(() => {
      joinRes = result.current.joinGroup({
        groupId: 'group-1',
        studentId: 'student-5',
      })
    })

    expect(joinRes.success).toBe(true)

    // Verify memberIds in group-1 contains student-5
    const group1 = result.current.groups.find((g) => g.id === 'group-1')
    expect(group1.memberIds).toContain('student-5')

    // student-5 cannot join a second group in course-1
    let secondJoinRes
    act(() => {
      secondJoinRes = result.current.joinGroup({
        groupId: 'group-2',
        studentId: 'student-5',
      })
    })

    expect(secondJoinRes.success).toBe(false)
    expect(secondJoinRes.error).toContain('already in a group')
  })
})

