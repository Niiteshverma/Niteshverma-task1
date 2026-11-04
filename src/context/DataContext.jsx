import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { initialAssignments, initialSubmissions } from '../data/seedData'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  // Synchronize assignments and submissions with localStorage
  const [assignments, setAssignments] = useLocalStorage('assignments', initialAssignments)
  const [submissions, setSubmissions] = useLocalStorage('submissions', initialSubmissions)

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

  return (
    <DataContext.Provider
      value={{
        assignments,
        setAssignments,
        submissions,
        setSubmissions,
        getStudentSubmission,
        getStudentAssignments,
        getAdminAssignments,
        submitAssignment,
        createAssignment,
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
