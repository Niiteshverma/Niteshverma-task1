// Student Dashboard view displaying enrolled courses and quick access
import Navbar from '../components/layout/Navbar'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

export default function StudentDashboard() {
  const { currentUser } = useAuth()
  const { getCoursesForStudent } = useData()

  const courses = currentUser ? getCoursesForStudent(currentUser.id) : []

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <PageHeader
          title={`Welcome back, ${currentUser?.name}!`}
          subtitle="View your enrolled courses, upcoming deadlines, and project submissions."
          badge={<Badge variant="info">Student Portal</Badge>}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <Card key={course.id} hoverable className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="purple">{course.code}</Badge>
                <span className="text-xs text-slate-500 font-medium">Enrolled</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{course.name}</h3>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
