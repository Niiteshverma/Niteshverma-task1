import { useState, useEffect } from 'react'
import { isValidUrl, getTodayDate } from '../../utils/helpers'

export default function AssignmentForm({
  isOpen,
  onClose,
  onSubmit,
  students = [],
  initialData = null,
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [driveLink, setDriveLink] = useState('')
  const [assignToAll, setAssignToAll] = useState(true)
  const [selectedStudentIds, setSelectedStudentIds] = useState([])
  const [errors, setErrors] = useState({})

  // Initialize or reset form values when opening or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '')
        setDescription(initialData.description || '')
        setDueDate(initialData.dueDate || '')
        setDriveLink(initialData.driveLink || '')
        const isAll =
          initialData.assignedTo?.length === students.length &&
          students.every((s) => initialData.assignedTo.includes(s.id))
        setAssignToAll(isAll)
        setSelectedStudentIds(initialData.assignedTo || [])
      } else {
        setTitle('')
        setDescription('')
        setDueDate('')
        setDriveLink('')
        setAssignToAll(true)
        setSelectedStudentIds(students.map((s) => s.id))
      }
      setErrors({})
    }
  }, [isOpen, initialData, students])

  // Toggle "Assign to all"
  const handleToggleAll = (e) => {
    const checked = e.target.checked
    setAssignToAll(checked)
    if (checked) {
      setSelectedStudentIds(students.map((s) => s.id))
    }
    if (errors.assignedTo) {
      setErrors((prev) => ({ ...prev, assignedTo: '' }))
    }
  }

  // Toggle individual student checkbox
  const handleStudentCheck = (studentId) => {
    setSelectedStudentIds((prev) => {
      const updated = prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]

      setAssignToAll(updated.length === students.length)

      if (updated.length > 0 && errors.assignedTo) {
        setErrors((errs) => ({ ...errs, assignedTo: '' }))
      }
      return updated
    })
  }

  // Validate form fields
  const validate = () => {
    const newErrors = {}

    if (!title || !title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!dueDate) {
      newErrors.dueDate = 'Due date is required'
    }

    if (!driveLink || !driveLink.trim()) {
      newErrors.driveLink = 'Drive link is required'
    } else if (!isValidUrl(driveLink)) {
      newErrors.driveLink = 'Please enter a valid web URL starting with http:// or https://'
    }

    if (!assignToAll && selectedStudentIds.length === 0) {
      newErrors.assignedTo = 'Please select at least one student'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const assignedTo = assignToAll ? students.map((s) => s.id) : selectedStudentIds

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      driveLink: driveLink.trim(),
      assignedTo,
    })
  }

  const isPastDueDate = Boolean(dueDate && dueDate < getTodayDate())

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
      {/* Title Field */}
      <div>
        <label htmlFor="assignment-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Assignment Title <span className="text-red-500">*</span>
        </label>
        <input
          id="assignment-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }))
          }}
          placeholder="e.g. CS101: Introduction to Algorithms"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'title-error' : undefined}
          className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${
            errors.title ? 'border-red-400 bg-red-50/30' : 'border-slate-300 dark:border-slate-700'
          } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        />
        {errors.title && (
          <p id="title-error" role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">
            {errors.title}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="assignment-desc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Description
        </label>
        <textarea
          id="assignment-desc"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide instructions, expectations, and grading details..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Due Date & Drive Link Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="assignment-due" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            id="assignment-due"
            type="date"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value)
              if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: '' }))
            }}
            aria-invalid={Boolean(errors.dueDate)}
            aria-describedby={errors.dueDate ? 'due-error' : isPastDueDate ? 'due-past-note' : undefined}
            className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${
              errors.dueDate ? 'border-red-400 bg-red-50/30' : 'border-slate-300 dark:border-slate-700'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          {errors.dueDate && (
            <p id="due-error" role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">
              {errors.dueDate}
            </p>
          )}
          {!errors.dueDate && isPastDueDate && (
            <p id="due-past-note" className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
              Note: This date is in the past. It will appear as overdue for students.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="assignment-drive" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Drive Materials Link <span className="text-red-500">*</span>
          </label>
          <input
            id="assignment-drive"
            type="url"
            value={driveLink}
            onChange={(e) => {
              setDriveLink(e.target.value)
              if (errors.driveLink) setErrors((prev) => ({ ...prev, driveLink: '' }))
            }}
            placeholder="https://drive.google.com/..."
            aria-invalid={Boolean(errors.driveLink)}
            aria-describedby={errors.driveLink ? 'drive-error' : undefined}
            className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${
              errors.driveLink ? 'border-red-400 bg-red-50/30' : 'border-slate-300 dark:border-slate-700'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          {errors.driveLink && (
            <p id="drive-error" role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">
              {errors.driveLink}
            </p>
          )}
        </div>
      </div>

      {/* Student Assignment Selection */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
        <label className="flex items-center space-x-2 cursor-pointer mb-2">
          <input
            type="checkbox"
            checked={assignToAll}
            onChange={handleToggleAll}
            className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Assign to all students ({students.length})
          </span>
        </label>

        {!assignToAll && (
          <div className="mt-2 pl-2 space-y-1.5 max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-800/50">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
              Select one or more students:
            </p>
            {students.map((student) => {
              const checked = selectedStudentIds.includes(student.id)
              return (
                <label
                  key={student.id}
                  className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleStudentCheck(student.id)}
                    className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
                  />
                  <span>{student.name}</span>
                </label>
              )
            })}
          </div>
        )}
        {errors.assignedTo && (
          <p id="assigned-error" role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">
            {errors.assignedTo}
          </p>
        )}
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
        >
          {initialData ? 'Save Changes' : 'Create Assignment'}
        </button>
      </div>
    </form>
  )
}
