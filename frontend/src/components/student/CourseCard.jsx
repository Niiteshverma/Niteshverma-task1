// Card component displaying course summary, instructor, assignment count, and student acknowledgement progress
import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import ProgressBar from '../ui/ProgressBar'
import { useData } from '../../context/DataContext'

export default function CourseCard({ course, studentId }) {
  const navigate = useNavigate()
  const { getUserById, getAssignmentsForCourse, getGroupForStudent, getAcknowledgement } =
    useData()

  const professor = course.professorId ? getUserById(course.professorId) : null
  const assignments = getAssignmentsForCourse(course.id)
  const studentGroup = getGroupForStudent(course.id, studentId)

  // Calculate student acknowledgement count across all assignments in this course
  const acknowledgedCount = assignments.filter((assignment) => {
    if (assignment.submissionType === 'group') {
      if (!studentGroup) return false
      return Boolean(getAcknowledgement(assignment.id, null, studentGroup.id))
    }
    return Boolean(getAcknowledgement(assignment.id, studentId, null))
  }).length

  const totalAssignments = assignments.length

  const handleCardClick = () => {
    navigate(`/student/courses/${course.id}`)
  }

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      className="flex flex-col justify-between space-y-4 text-left border-slate-200 hover:border-indigo-300"
    >
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="purple" size="sm" dot>
            {course.code}
          </Badge>
          <span className="text-xs text-slate-500 font-medium">
            {totalAssignments} {totalAssignments === 1 ? 'Assignment' : 'Assignments'}
          </span>
        </div>

        <div>
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
            {course.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Instructor:{' '}
            <span className="font-medium text-slate-700">
              {professor ? professor.name : 'Unknown Instructor'}
            </span>
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>Progress</span>
          <span className="font-bold text-slate-800">
            {acknowledgedCount} of {totalAssignments} acknowledged
          </span>
        </div>
        <ProgressBar value={acknowledgedCount} max={totalAssignments} size="sm" />
      </div>
    </Card>
  )
}
