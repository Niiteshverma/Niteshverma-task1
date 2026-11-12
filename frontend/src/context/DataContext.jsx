// Context managing shared mock database state (users, courses, assignments, groups, acknowledgements)
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ROLES, STORAGE_KEYS } from '../utils/constants'
import {
  initialUsers,
  initialCourses,
  initialAssignments,
  initialGroups,
  initialAcknowledgements,
} from '../data/seedData'

export const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [storageError, setStorageError] = useState(null)

  const handleStorageError = useCallback(() => {
    setStorageError('There was an issue reading local data. You can restore seed data below.')
  }, [])

  // Persistent mock collections
  const [users, setUsers] = useLocalStorage(STORAGE_KEYS.USERS, initialUsers, handleStorageError)
  const [courses, setCourses] = useLocalStorage(STORAGE_KEYS.COURSES, initialCourses, handleStorageError)
  const [assignments, setAssignments] = useLocalStorage(STORAGE_KEYS.ASSIGNMENTS, initialAssignments, handleStorageError)
  const [groups, setGroups] = useLocalStorage(STORAGE_KEYS.GROUPS, initialGroups, handleStorageError)
  const [acknowledgements, setAcknowledgements] = useLocalStorage(
    STORAGE_KEYS.ACKNOWLEDGEMENTS,
    initialAcknowledgements,
    handleStorageError
  )

  // Auto-sync seed data when credentials or seed version change
  useEffect(() => {
    const SEED_VERSION = 'seed_v4_ritesh_priya'
    const storedVersion = localStorage.getItem('app_seed_version')
    if (storedVersion !== SEED_VERSION) {
      setUsers(initialUsers)
      setCourses(initialCourses)
      setAssignments(initialAssignments)
      setGroups(initialGroups)
      setAcknowledgements(initialAcknowledgements)
      localStorage.setItem('app_seed_version', SEED_VERSION)
    }
  }, [setUsers, setCourses, setAssignments, setGroups, setAcknowledgements])

  // Query helpers
  const getUserById = useCallback(
    (userId) => users.find((u) => u.id === userId) || null,
    [users]
  )

  const getCoursesForStudent = useCallback(
    (studentId) => courses.filter((c) => c.studentIds && c.studentIds.includes(studentId)),
    [courses]
  )

  const getCoursesForProfessor = useCallback(
    (professorId) => courses.filter((c) => c.professorId === professorId),
    [courses]
  )

  const getCourseById = useCallback(
    (courseId) => courses.find((c) => c.id === courseId) || null,
    [courses]
  )

  const getAssignmentsForCourse = useCallback(
    (courseId) => assignments.filter((a) => a.courseId === courseId),
    [assignments]
  )

  const getAssignmentById = useCallback(
    (assignmentId) => assignments.find((a) => a.id === assignmentId) || null,
    [assignments]
  )

  const getGroupsForCourse = useCallback(
    (courseId) => groups.filter((g) => g.courseId === courseId),
    [groups]
  )

  const getGroupForStudent = useCallback(
    (courseId, studentId) =>
      groups.find((g) => g.courseId === courseId && g.memberIds && g.memberIds.includes(studentId)) || null,
    [groups]
  )

  const getEnrolledStudentsForCourse = useCallback(
    (courseId) => {
      const course = courses.find((c) => c.id === courseId)
      if (!course || !course.studentIds) return []
      return users.filter((u) => course.studentIds.includes(u.id))
    },
    [courses, users]
  )

  // Returns matching acknowledgement record for an individual or group
  const getAcknowledgement = useCallback(
    (assignmentId, studentId = null, groupId = null) => {
      return (
        acknowledgements.find((ack) => {
          if (ack.assignmentId !== assignmentId) return false
          if (groupId) return ack.groupId === groupId
          if (studentId) return ack.studentId === studentId
          return false
        }) || null
      )
    },
    [acknowledgements]
  )

  const getAcknowledgementsForAssignment = useCallback(
    (assignmentId) => acknowledgements.filter((ack) => ack.assignmentId === assignmentId),
    [acknowledgements]
  )

  // Mutation helpers
  const acknowledgeAssignment = useCallback(
    ({ assignmentId, studentId = null, groupId = null, userId }) => {
      // Check if already acknowledged to prevent duplicate entries
      const existing = acknowledgements.find((ack) => {
        if (ack.assignmentId !== assignmentId) return false
        if (groupId) return ack.groupId === groupId
        if (studentId) return ack.studentId === studentId
        return false
      })

      if (existing) return existing

      const newAck = {
        id: crypto.randomUUID(),
        assignmentId,
        studentId: studentId || null,
        groupId: groupId || null,
        acknowledgedBy: userId,
        acknowledgedAt: new Date().toISOString(),
      }

      setAcknowledgements((prev) => [...prev, newAck])
      return newAck
    },
    [acknowledgements, setAcknowledgements]
  )

  const createGroup = useCallback(
    ({ courseId, name, leaderId }) => {
      const trimmedName = name ? name.trim() : ''
      if (!trimmedName) {
        return { success: false, error: 'Group name is required' }
      }

      // Ensure group name is unique within this course
      const courseGroups = groups.filter((g) => g.courseId === courseId)
      const isDuplicateName = courseGroups.some(
        (g) => g.name.toLowerCase() === trimmedName.toLowerCase()
      )
      if (isDuplicateName) {
        return { success: false, error: 'A group with this name already exists in this course' }
      }

      // Ensure student is not already in a group in this course
      const alreadyInGroup = courseGroups.some((g) => g.memberIds.includes(leaderId))
      if (alreadyInGroup) {
        return { success: false, error: 'You are already in a group for this course' }
      }

      const newGroup = {
        id: crypto.randomUUID(),
        courseId,
        name: trimmedName,
        leaderId,
        memberIds: [leaderId],
      }

      setGroups((prev) => [...prev, newGroup])
      return { success: true, group: newGroup }
    },
    [groups, setGroups]
  )

  const joinGroup = useCallback(
    ({ groupId, studentId }) => {
      const targetGroup = groups.find((g) => g.id === groupId)
      if (!targetGroup) {
        return { success: false, error: 'Group not found' }
      }

      // Check if student is already in a group for this course
      const courseGroups = groups.filter((g) => g.courseId === targetGroup.courseId)
      const alreadyInGroup = courseGroups.some((g) => g.memberIds.includes(studentId))
      if (alreadyInGroup) {
        return { success: false, error: 'You are already in a group for this course' }
      }

      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, memberIds: [...g.memberIds, studentId] }
            : g
        )
      )
      return { success: true }
    },
    [groups, setGroups]
  )

  const createAssignment = useCallback(
    (assignmentData) => {
      const newAssignment = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...assignmentData,
      }
      setAssignments((prev) => [newAssignment, ...prev])
      return newAssignment
    },
    [setAssignments]
  )

  const updateAssignment = useCallback(
    (assignmentId, updatedData) => {
      setAssignments((prev) =>
        prev.map((a) => (a.id === assignmentId ? { ...a, ...updatedData } : a))
      )
    },
    [setAssignments]
  )

  const deleteAssignment = useCallback(
    (assignmentId) => {
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId))
      // Cascade delete related acknowledgements
      setAcknowledgements((prev) => prev.filter((ack) => ack.assignmentId !== assignmentId))
    },
    [setAssignments, setAcknowledgements]
  )

  const createCourse = useCallback(
    ({ name, code, professorId }) => {
      // Auto-enroll all existing students into the new course
      const allStudentIds = users
        .filter((u) => u.role === ROLES.STUDENT)
        .map((u) => u.id)

      const newCourse = {
        id: crypto.randomUUID(),
        name: name.trim(),
        code: code.trim().toUpperCase(),
        professorId,
        studentIds: allStudentIds,
      }

      setCourses((prev) => [newCourse, ...prev])
      return newCourse
    },
    [users, setCourses]
  )

  const addUser = useCallback(
    (userData) => {
      const newUser = {
        id: crypto.randomUUID(),
        ...userData,
      }

      setUsers((prev) => [...prev, newUser])

      // If registered as student, auto-enroll in all existing courses
      if (newUser.role === ROLES.STUDENT) {
        setCourses((prevCourses) =>
          prevCourses.map((c) => ({
            ...c,
            studentIds: c.studentIds ? [...c.studentIds, newUser.id] : [newUser.id],
          }))
        )
      }

      return newUser
    },
    [setUsers, setCourses]
  )

  const resetData = useCallback(() => {
    setUsers(initialUsers)
    setCourses(initialCourses)
    setAssignments(initialAssignments)
    setGroups(initialGroups)
    setAcknowledgements(initialAcknowledgements)
    setStorageError(null)
  }, [setUsers, setCourses, setAssignments, setGroups, setAcknowledgements])

  const value = {
    users,
    courses,
    assignments,
    groups,
    acknowledgements,
    storageError,
    getUserById,
    getCoursesForStudent,
    getCoursesForProfessor,
    getCourseById,
    getAssignmentsForCourse,
    getAssignmentById,
    getGroupsForCourse,
    getGroupForStudent,
    getEnrolledStudentsForCourse,
    getAcknowledgement,
    getAcknowledgementsForAssignment,
    acknowledgeAssignment,
    createGroup,
    joinGroup,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    createCourse,
    addUser,
    resetData,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
