import { useState, useEffect } from 'react'

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
      
      // If user selected all individually, check "all"
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

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!dueDate) {
      newErrors.dueDate = 'Due date is required'
    }

    if (!driveLink.trim()) {
      newErrors.driveLink = 'Drive link is required'
    } else {
      try {
        const url = new URL(driveLink.trim())
        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.driveLink = 'Link must start with http:// or https://'
        }
      } catch {
        newErrors.driveLink = 'Please enter a valid URL (e.g. https://drive.google.com/...)'
      }
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {/* Title Field */}
      <div>
        <label htmlFor="assignment-title" className="block text-xs font-semibold text-slate-700 mb-1">
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
          className={`w-full px-3 py-2 text-sm rounded-lg border ${
            errors.title ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
          } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        />
        {errors.title && (
          <p className="text-xs text-red-600 mt-1">{errors.title}</p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="assignment-desc" className="block text-xs font-semibold text-slate-700 mb-1">
          Description
        </label>
        <textarea
          id="assignment-desc"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide instructions, expectations, and grading details..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Due Date & Drive Link Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="assignment-due" className="block text-xs font-semibold text-slate-700 mb-1">
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
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              errors.dueDate ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          {errors.dueDate && (
            <p className="text-xs text-red-600 mt-1">{errors.dueDate}</p>
          )}
        </div>

        <div>
          <label htmlFor="assignment-drive" className="block text-xs font-semibold text-slate-700 mb-1">
            Google Drive Materials Link <span className="text-red-500">*</span>
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
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              errors.driveLink ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          {errors.driveLink && (
            <p className="text-xs text-red-600 mt-1">{errors.driveLink}</p>
          )}
        </div>
      </div>

      {/* Student Assignment Assignment Selection */}
      <div className="pt-2 border-t border-slate-200">
        <label className="flex items-center space-x-2 cursor-pointer mb-2">
          <input
            type="checkbox"
            checked={assignToAll}
            onChange={handleToggleAll}
            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-slate-800">
            Assign to all students ({students.length})
          </span>
        </label>

        {!assignToAll && (
          <div className="mt-2 pl-2 space-y-1.5 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2.5 bg-slate-50">
            <p className="text-xs text-slate-500 mb-1.5 font-medium">
              Select one or more students:
            </p>
            {students.map((student) => {
              const checked = selectedStudentIds.includes(student.id)
              return (
                <label
                  key={student.id}
                  className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleStudentCheck(student.id)}
                    className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span>{student.name}</span>
                </label>
              )
            })}
          </div>
        )}
        {errors.assignedTo && (
          <p className="text-xs text-red-600 mt-1">{errors.assignedTo}</p>
        )}
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm"
        >
          {initialData ? 'Save Changes' : 'Create Assignment'}
        </button>
      </div>
    </form>
  )
}

