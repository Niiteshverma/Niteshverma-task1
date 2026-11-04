import { createContext, useContext, useState, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { initialAssignments, initialSubmissions } from '../data/seedData'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [storageError, setStorageError] = useState(null)

  const handleStorageError = useCallback(() => {
    setStorageError(
      'Corrupted data detected in local storage. Click below to restore initial seed data.'
    )
  }, [])

  // Synchronize assignments and submissions with localStorage
  const [assignments, setAssignments] = useLocalStorage(
    'assignments',
    initialAssignments,
    handleStorageError
  )
  const [submissions, setSubmissions] = useLocalStorage(
    'submissions',
    initialSubmissions,
    handleStorageError
  )

  // Reset corrupted data to initial seeds
  const resetData = () => {
    try {
      localStorage.setItem('assignments', JSON.stringify(initialAssignments))
      localStorage.setItem('submissions', JSON.stringify(initialSubmissions))
    } catch (e) {
      console.warn('Could not reset localStorage directly:', e)
    }
    setAssignments(initialAssignments)
    setSubmissions(initialSubmissions)
    setStorageError(null)
  }

  // Find a specific student's submission for an assignment
  const getStudentSubmission = (assignmentId, studentId) => {
    return submissions.find(
      (sub) => sub.assignmentId === assignmentId && sub.studentId === studentId
    ) || null
  }

  // Get all assignments assigned to a specific student
  const getStudentAssignments = (studentId) => {
    return assignments.filter((assignment) =>
      assignment.assignedTo && assignment.assignedTo.includes(studentId)
    )
  }

  // Get all assignments created by a specific admin
  const getAdminAssignments = (adminId) => {
    return assignments.filter((assignment) => assignment.createdBy === adminId)
  }

  // Submit an assignment for a student (prevents duplicates)
  const submitAssignment = (assignmentId, studentId) => {
    setSubmissions((prevSubmissions) => {
      const exists = prevSubmissions.some(
        (sub) => sub.assignmentId === assignmentId && sub.studentId === studentId
      )
      if (exists) return prevSubmissions

      const newSubmission = {
        assignmentId,
        studentId,
        status: 'Submitted',
        submittedAt: new Date().toISOString(),
      }
      return [...prevSubmissions, newSubmission]
    })
  }

  // Create a new assignment with a generated UUID
  const createAssignment = (assignmentData) => {
    const newAssignment = {
      ...assignmentData,
      id: crypto.randomUUID(),
    }
    setAssignments((prevAssignments) => [...prevAssignments, newAssignment])
    return newAssignment
  }

  // Update an existing assignment and clean up unassigned student submissions
  const updateAssignment = (assignmentId, updatedData, adminId) => {
    setAssignments((prevAssignments) =>
      prevAssignments.map((assignment) => {
        if (assignment.id !== assignmentId) return assignment
        if (adminId && assignment.createdBy !== adminId) {
          return assignment
        }
        return { ...assignment, ...updatedData }
      })
    )

    if (updatedData.assignedTo) {
      setSubmissions((prevSubmissions) =>
        prevSubmissions.filter(
          (sub) =>
            sub.assignmentId !== assignmentId || updatedData.assignedTo.includes(sub.studentId)
        )
      )
    }
  }

  // Delete an assignment and cascade remove its associated submissions
  const deleteAssignment = (assignmentId, adminId) => {
    setAssignments((prevAssignments) =>
      prevAssignments.filter((assignment) => {
        if (assignment.id !== assignmentId) return true
        if (adminId && assignment.createdBy !== adminId) return true
        return false
      })
    )
    setSubmissions((prevSubmissions) =>
      prevSubmissions.filter((sub) => sub.assignmentId !== assignmentId)
    )
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

// Hook for convenient access to data state
export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
