// Course Assignments page for student view: displays course syllabus, assignments feed, and enrollment guard
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import PageHeader from '../components/ui/PageHeader'
import AssignmentCard from '../components/student/AssignmentCard'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { LOADING_DELAY } from '../utils/constants'

export default function CourseAssignmentsPage() {
  const { courseId } = useParams()
  const { currentUser } = useAuth()
  const {
    getCourseById,
    getUserById,
    getAssignmentsForCourse,
    getGroupForStudent,
    getAcknowledgement,
  } = useData()

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, LOADING_DELAY)
    return () => clearTimeout(timer)
  }, [courseId])

  const course = getCourseById(courseId)

  // Enrollment & existence check: student must be in course.studentIds
  const isEnrolled =
    course &&
    course.studentIds &&
    currentUser &&
    course.studentIds.includes(currentUser.id)

  const professor = course?.professorId ? getUserById(course.professorId) : null
  const assignments = course ? getAssignmentsForCourse(course.id) : []
  const studentGroup = currentUser ? getGroupForStudent(courseId, currentUser.id) : null

  // If course does not exist or student is not enrolled
  if (!isLoading && (!course || !isEnrolled)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
          <EmptyState
            title="Course Not Found or Access Denied"
            description="You do not have permission to view this course, or it does not exist. Please return to your dashboard."
            actionLabel="Return to Dashboard"
            onAction={() => window.location.assign('/student')}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <PageHeader
          backTo="/student"
          backLabel="All Courses"
          title={course ? course.name : 'Course Assignments'}
          subtitle={
            professor
              ? `Taught by ${professor.name} • Code: ${course.code}`
              : `Course Code: ${course?.code}`
          }
          badge={
            <Badge variant="purple" size="sm">
              {course?.code}
            </Badge>
          }
        />

        {isLoading ? (
          <div className="py-16">
            <Loader message="Loading assignments..." size="md" />
          </div>
        ) : assignments.length === 0 ? (
          <EmptyState
            title="No assignments posted"
            description="Your instructor has not created any assignments for this course yet. Check back soon."
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Coursework &amp; Submissions ({assignments.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {assignments.map((assignment) => {
                const ack =
                  assignment.submissionType === 'group'
                    ? studentGroup
                      ? getAcknowledgement(assignment.id, null, studentGroup.id)
                      : null
                    : getAcknowledgement(assignment.id, currentUser?.id, null)

                return (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    acknowledgement={ack}
                    studentGroup={studentGroup}
                  />
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

