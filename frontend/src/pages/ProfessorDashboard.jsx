// Professor Dashboard view with course management and creation modal
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import EmptyState from '../components/ui/EmptyState'
import CourseCard from '../components/professor/CourseCard'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'

export default function ProfessorDashboard() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { getCoursesForProfessor, createCourse } = useData()
  const { showToast } = useToast()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [courseName, setCourseName] = useState('')
  const [courseCode, setCourseCode] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const courses = currentUser ? getCoursesForProfessor(currentUser.id) : []

  const handleOpenCourse = (courseId) => {
    navigate(`/professor/courses/${courseId}`)
  }

  const handleCreateCourseSubmit = (e) => {
    e.preventDefault()
    const trimmedName = courseName.trim()
    const trimmedCode = courseCode.trim()

    const newErrors = {}
    if (!trimmedName) {
      newErrors.name = 'Course name is required'
    }
    if (!trimmedCode) {
      newErrors.code = 'Course code is required (e.g. CS501)'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    const newCourse = createCourse({
      name: trimmedName,
      code: trimmedCode.toUpperCase(),
      professorId: currentUser.id,
    })
    setIsSubmitting(false)

    showToast(`Course "${newCourse.name}" created successfully!`, 'success')
    setCourseName('')
    setCourseCode('')
    setErrors({})
    setIsCreateModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHeader
          title="My Courses"
          subtitle={`Welcome back, ${currentUser?.name || 'Professor'}. Manage coursework, review student progress, and publish assignments.`}
          action={
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto"
            >
              + Create Course
            </Button>
          }
        />

        {courses.length === 0 ? (
          <EmptyState
            title="No Courses Found"
            description="You have not created any courses yet. Get started by creating your first course."
            actionLabel="+ Create Course"
            onAction={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onOpen={handleOpenCourse}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Course Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsCreateModalOpen(false)
            setErrors({})
          }
        }}
        title="Create a New Course"
      >
        <form onSubmit={handleCreateCourseSubmit} noValidate className="space-y-4 text-left">
          <p className="text-xs sm:text-sm text-slate-600">
            All registered students will be automatically enrolled into your new course.
          </p>

          <Input
            id="course-name-input"
            label="Course Name"
            placeholder="e.g. Distributed Systems & Cloud Computing"
            value={courseName}
            error={errors.name}
            required
            onChange={(e) => {
              setCourseName(e.target.value)
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
            }}
          />

          <Input
            id="course-code-input"
            label="Course Code"
            placeholder="e.g. CS501"
            value={courseCode}
            error={errors.code}
            required
            onChange={(e) => {
              setCourseCode(e.target.value)
              if (errors.code) setErrors((prev) => ({ ...prev, code: '' }))
            }}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={isSubmitting}
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
            >
              Create Course
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
