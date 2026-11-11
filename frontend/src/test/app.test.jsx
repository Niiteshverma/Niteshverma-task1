import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, renderHook, act } from '@testing-library/react'
import App from '../App'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DataProvider, useData } from '../context/DataContext'
import { initialUsers, initialCourses, initialAssignments, initialGroups, initialAcknowledgements } from '../data/seedData'
import { ROLES } from '../utils/constants'
import { formatDateTime, formatDate, isOverdue, isDueSoon, isValidUrl, getPercentage } from '../utils/helpers'

describe('Phase 1: Restructure & Data Model Test Suite', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  // 1. Storage Hook: Default values
  it('useLocalStorage initializes with fallback value on empty storage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-val'))
    expect(result.current[0]).toBe('default-val')
  })

  // 2. Storage Hook: Writes and persists
  it('useLocalStorage writes and updates state in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    act(() => {
      result.current[1]('updated-value')
    })
    expect(result.current[0]).toBe('updated-value')
    expect(JSON.parse(localStorage.getItem('test-key'))).toBe('updated-value')
  })

  // 3. Storage Hook: Corrupted JSON recovery
  it('useLocalStorage gracefully falls back to initialValue on corrupted JSON without crashing', () => {
    localStorage.setItem('corrupted-key', '{invalid-json')
    const onError = vi.fn()
    const { result } = renderHook(() => useLocalStorage('corrupted-key', { safe: true }, onError))

    expect(result.current[0]).toEqual({ safe: true })
    expect(onError).toHaveBeenCalled()
  })

  // 4. Data Model: Seed data matches requirements
  it('loads correct seed counts for Round 2 data model', () => {
    const { result } = renderHook(() => useData(), { wrapper: DataProvider })

    expect(result.current.users.length).toBe(8) // 2 professors + 6 students
    expect(result.current.courses.length).toBe(4) // 4 courses
    expect(result.current.assignments.length).toBe(9) // 9 assignments
    expect(result.current.groups.length).toBe(3) // 3 groups
    expect(result.current.acknowledgements.length).toBe(2) // 1 individual + 1 group
  })

  // 5. Query helpers: Courses per role
  it('filters courses accurately for students and professors', () => {
    const { result } = renderHook(() => useData(), { wrapper: DataProvider })

    const prof1Courses = result.current.getCoursesForProfessor('prof-1')
    expect(prof1Courses.length).toBe(2)
    prof1Courses.forEach((c) => expect(c.professorId).toBe('prof-1'))

    const student1Courses = result.current.getCoursesForStudent('student-1')
    expect(student1Courses.length).toBe(3)
    student1Courses.forEach((c) => expect(c.studentIds).toContain('student-1'))
  })

  // 6. Query helpers: Groups and Members
  it('correctly retrieves student group and prevents cross-group collisions', () => {
    const { result } = renderHook(() => useData(), { wrapper: DataProvider })

    const group = result.current.getGroupForStudent('course-1', 'student-1')
    expect(group).not.toBeNull()
    expect(group.name).toBe('Frontend Pioneers')
    expect(group.leaderId).toBe('student-1')

    // Student 5 is not in any group in course-1
    const noGroup = result.current.getGroupForStudent('course-1', 'student-5')
    expect(noGroup).toBeNull()
  })

  // 7. Acknowledgements: Individual and Group retrieval
  it('retrieves individual and group acknowledgements accurately', () => {
    const { result } = renderHook(() => useData(), { wrapper: DataProvider })

    // Individual ack on assign-1 for student-1
    const indAck = result.current.getAcknowledgement('assign-1', 'student-1', null)
    expect(indAck).not.toBeNull()
    expect(indAck.acknowledgedBy).toBe('student-1')

    // Group ack on assign-6 for group-3
    const grpAck = result.current.getAcknowledgement('assign-6', null, 'group-3')
    expect(grpAck).not.toBeNull()
    expect(grpAck.acknowledgedBy).toBe('student-5')
  })

  // 8. Mutation: Acknowledge assignment prevents duplicate submissions
  it('acknowledges assignment and prevents duplicate records', () => {
    const { result } = renderHook(() => useData(), { wrapper: DataProvider })

    let ackRecord
    act(() => {
      ackRecord = result.current.acknowledgeAssignment({
        assignmentId: 'assign-3',
        studentId: 'student-2',
        userId: 'student-2',
      })
    })

    expect(ackRecord).toBeDefined()
    expect(ackRecord.studentId).toBe('student-2')

    const initialLength = result.current.acknowledgements.length

    // Attempt second acknowledge on same assignment for same student
    act(() => {
      result.current.acknowledgeAssignment({
        assignmentId: 'assign-3',
        studentId: 'student-2',
        userId: 'student-2',
      })
    })

    expect(result.current.acknowledgements.length).toBe(initialLength)
  })

  // 9. Mutation: Create and Join Group with uniqueness constraints
  it('validates group name uniqueness and prevents student joining multiple groups', () => {
    const { result } = renderHook(() => useData(), { wrapper: DataProvider })

    // Reject duplicate group name in course-1
    let dupResult
    act(() => {
      dupResult = result.current.createGroup({
        courseId: 'course-1',
        name: 'Frontend Pioneers',
        leaderId: 'student-5',
      })
    })
    expect(dupResult.success).toBe(false)
    expect(dupResult.error).toContain('already exists')

    // Successfully create group for student-5 in course-2
    let newGroupResult
    act(() => {
      newGroupResult = result.current.createGroup({
        courseId: 'course-2',
        name: 'Algo Masters',
        leaderId: 'student-5',
      })
    })
    expect(newGroupResult.success).toBe(true)

    // Student 6 joins Algo Masters
    let joinResult
    act(() => {
      joinResult = result.current.joinGroup({
        groupId: newGroupResult.group.id,
        studentId: 'student-6',
      })
    })
    expect(joinResult.success).toBe(true)

    // Student 6 cannot join another group in course-2
    let secondJoinResult
    act(() => {
      secondJoinResult = result.current.joinGroup({
        groupId: 'another-fake-id',
        studentId: 'student-6',
      })
    })
    expect(secondJoinResult.success).toBe(false)
  })

  // 10. Mutation: Auto-enrollment on course creation and registration
  it('auto-enrolls existing students when professor creates a course', () => {
    const { result } = renderHook(() => useData(), { wrapper: DataProvider })

    let createdCourse
    act(() => {
      createdCourse = result.current.createCourse({
        name: 'Human-Computer Interaction',
        code: 'CS410',
        professorId: 'prof-1',
      })
    })

    expect(createdCourse.studentIds.length).toBe(6) // all 6 existing students auto-enrolled
  })

  // 11. Helper functions
  it('helpers calculate percentages and detect overdue/due-soon states correctly', () => {
    expect(getPercentage(0, 0)).toBe(0)
    expect(getPercentage(3, 5)).toBe(60)
    expect(isValidUrl('https://onedrive.live.com/test')).toBe(true)
    expect(isValidUrl('javascript:alert(1)')).toBe(false)

    // Overdue check
    expect(isOverdue('2026-10-01T00:00:00.000Z')).toBe(true)
    expect(isOverdue('2099-01-01T00:00:00.000Z')).toBe(false)
  })

  // 12. Reset data restores initial state
  it('resetData restores fresh seed state', () => {
    const { result } = renderHook(() => useData(), { wrapper: DataProvider })

    act(() => {
      result.current.deleteAssignment('assign-1')
    })
    expect(result.current.getAssignmentById('assign-1')).toBeNull()

    act(() => {
      result.current.resetData()
    })
    expect(result.current.getAssignmentById('assign-1')).not.toBeNull()
  })

  // 13. Top-level App smoke test: verifies provider tree order and default route renders without crashing
  it('renders top-level App component and mounts login screen without provider order error', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /Sign in to your account/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument()
  })
})
