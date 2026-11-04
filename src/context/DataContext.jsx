// Context providing shared assignments and submissions state
import { createContext, useContext, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { initialAssignments, initialSubmissions } from '../data/seedData'
import { STATUS, STORAGE_KEYS } from '../utils/constants'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [storageError, setStorageError] = useState(null)

  const handleStorageError = () => {
    setStorageError('Corrupted data detected in local storage. Click below to restore initial seed data.')
  }

  // Persist assignments and submissions in localStorage
  const [assignments, setAssignments] = useLocalStorage(
    STORAGE_KEYS.ASSIGNMENTS,
    initialAssignments,
    handleStorageError
  )
  const [submissions, setSubmissions] = useLocalStorage(
    STORAGE_KEYS.SUBMISSIONS,
    initialSubmissions,
    handleStorageError
  )

  // Reset corrupted storage back to original seed data
  const resetData = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(initialAssignments))
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(initialSubmissions))
    } catch (e) {
      console.warn('Could not reset localStorage directly:', e)
    }
    setAssignments(initialAssignments)
    setSubmissions(initialSubmissions)
    setStorageError(null)
  }

  // Find a specific student's submission record
  const getStudentSubmission = (assignmentId, studentId) => {
    return submissions.find(
      (sub) => sub.assignmentId === assignmentId && sub.studentId === studentId
    ) || null
  }

  // Filter assignments assigned to a specific student
  const getStudentAssignments = (studentId) => {
    return assignments.filter((a) => a.assignedTo && a.assignedTo.includes(studentId))
  }

  // Filter assignments created by a specific admin
  const getAdminAssignments = (adminId) => {
    return assignments.filter((a) => a.createdBy === adminId)
  }

  // Submit an assignment for a student (prevents double submissions)
  const submitAssignment = (assignmentId, studentId) => {
    setSubmissions((prev) => {
      const alreadySubmitted = prev.some(
        (sub) => sub.assignmentId === assignmentId && sub.studentId === studentId
      )
      if (alreadySubmitted) return prev

      const newSubmission = {
        assignmentId,
        studentId,
        status: STATUS.SUBMITTED,
        submittedAt: new Date().toISOString(),
      }
      return [...prev, newSubmission]
    })
  }

  // Create new assignment with a generated UUID
  const createAssignment = (assignmentData) => {
    const newAssignment = {
      ...assignmentData,
      id: crypto.randomUUID(),
    }
    setAssignments((prev) => [...prev, newAssignment])
    return newAssignment
  }

  // Update existing assignment and remove submissions of any unassigned students
  const updateAssignment = (assignmentId, updatedData, adminId) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a
        if (adminId && a.createdBy !== adminId) return a
        return { ...a, ...updatedData }
      })
    )

    if (updatedData.assignedTo) {
      setSubmissions((prev) =>
        prev.filter(
          (sub) => sub.assignmentId !== assignmentId || updatedData.assignedTo.includes(sub.studentId)
        )
      )
    }
  }

  // Delete assignment and cascade remove its associated submissions
  const deleteAssignment = (assignmentId, adminId) => {
    setAssignments((prev) =>
      prev.filter((a) => {
        if (a.id !== assignmentId) return true
        if (adminId && a.createdBy !== adminId) return true
        return false
      })
    )
    setSubmissions((prev) => prev.filter((sub) => sub.assignmentId !== assignmentId))
  }

  return (
    <DataContext.Provider
      value={{
        assignments,
        setAssignments,
        submissions,
        setSubmissions,
        storageError,
        resetData,
        getStudentSubmission,
        getStudentAssignments,
        getAdminAssignments,
        submitAssignment,
        createAssignment,
        updateAssignment,
        deleteAssignment,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
