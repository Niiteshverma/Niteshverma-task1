// Reusable Course Card component for Professor Dashboard
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { useData } from '../../context/DataContext'

export default function CourseCard({ course, onOpen }) {
  const { getAssignmentsForCourse } = useData()
  const assignments = getAssignmentsForCourse ? getAssignmentsForCourse(course.id) : []
  const studentCount = course.studentIds?.length || 0

  return (
    <Card
      hoverable
      onClick={() => onOpen(course.id)}
      className="flex flex-col justify-between text-left h-full space-y-4 border-slate-200 cursor-pointer group"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="purple" size="sm">
            {course.code}
          </Badge>
          <span className="text-xs text-slate-500 font-medium">
            {studentCount} {studentCount === 1 ? 'Student' : 'Students'}
          </span>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {course.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Course ID: <span className="font-mono">{course.code}</span>
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <span className="font-medium">
          {assignments.length} {assignments.length === 1 ? 'Assignment' : 'Assignments'} posted
        </span>
        <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
          <span>Manage</span>
          <span aria-hidden="true">&rarr;</span>
        </span>
      </div>
    </Card>
  )
}

