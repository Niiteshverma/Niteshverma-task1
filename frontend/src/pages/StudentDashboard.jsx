// Student Dashboard showing enrolled courses in a responsive grid with completion summaries and loader
import { useState, useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import PageHeader from '../components/ui/PageHeader'
import CourseCard from '../components/student/CourseCard'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { LOADING_DELAY } from '../utils/constants'

export default function StudentDashboard() {
  const { currentUser } = useAuth()
  const { getCoursesForStudent } = useData()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, LOADING_DELAY)
    return () => clearTimeout(timer)
  }, [])

  const courses = currentUser ? getCoursesForStudent(currentUser.id) : []

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <PageHeader
          title="My Enrolled Courses"
          subtitle="Select a course below to view syllabus materials, assignments, and group workspaces."
          badge={
            <Badge variant="info" size="sm">
              {courses.length} {courses.length === 1 ? 'Course' : 'Courses'}
            </Badge>
          }
        />

        {isLoading ? (
          <div className="py-16">
            <Loader message="Loading your courses..." size="md" />
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            title="No courses enrolled"
            description="You are not enrolled in any active courses. Check back later or contact your professor."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                studentId={currentUser?.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
