// Reusable form component for creating and editing course assignments
import { useState, useEffect } from 'react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'
import { SUBMISSION_TYPE } from '../../utils/constants'
import { isValidUrl } from '../../utils/helpers'

// Helper to format ISO date-time into datetime-local value (YYYY-MM-DDTHH:mm)
function formatForInput(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return ''
  const pad = (num) => String(num).padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default function AssignmentForm({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    oneDriveLink: '',
    submissionType: SUBMISSION_TYPE.INDIVIDUAL,
  })

  const [errors, setErrors] = useState({})

  // Pre-fill form when editing an existing assignment
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        deadline: formatForInput(initialData.deadline),
        oneDriveLink: initialData.oneDriveLink || '',
        submissionType: initialData.submissionType || SUBMISSION_TYPE.INDIVIDUAL,
      })
    } else {
      setFormData({
        title: '',
        description: '',
        deadline: '',
        oneDriveLink: '',
        submissionType: SUBMISSION_TYPE.INDIVIDUAL,
      })
    }
    setErrors({})
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    const trimmedTitle = formData.title.trim()
    const trimmedLink = formData.oneDriveLink.trim()

    if (!trimmedTitle) {
      newErrors.title = 'Assignment title is required'
    } else if (trimmedTitle.length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Submission deadline is required'
    }

    if (trimmedLink && !isValidUrl(trimmedLink)) {
      newErrors.oneDriveLink = 'Please enter a valid URL (starting with http:// or https://)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate() || isSubmitting) return

    const submissionPayload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      deadline: new Date(formData.deadline).toISOString(),
      oneDriveLink: formData.oneDriveLink.trim(),
      submissionType: formData.submissionType,
    }

    onSubmit(submissionPayload)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
      <Input
        id="assignment-title"
        name="title"
        label="Assignment Title"
        placeholder="e.g. Distributed Consensus Engine"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="assignment-deadline"
          name="deadline"
          type="datetime-local"
          label="Submission Deadline"
          value={formData.deadline}
          onChange={handleChange}
          error={errors.deadline}
          required
        />

        <Select
          id="assignment-submission-type"
          name="submissionType"
          label="Submission Type"
          value={formData.submissionType}
          onChange={handleChange}
          options={[
            { value: SUBMISSION_TYPE.INDIVIDUAL, label: 'Individual Submission' },
            { value: SUBMISSION_TYPE.GROUP, label: 'Group Submission' },
          ]}
        />
      </div>

      <Input
        id="assignment-onedrive-link"
        name="oneDriveLink"
        type="url"
        label="OneDrive / External Resource Link (Optional)"
        placeholder="https://onedrive.live.com/view/spec..."
        value={formData.oneDriveLink}
        onChange={handleChange}
        error={errors.oneDriveLink}
      />

      <Textarea
        id="assignment-description"
        name="description"
        label="Instructions / Description (Optional)"
        placeholder="Describe the deliverables, rubric, and submission instructions for students..."
        value={formData.description}
        onChange={handleChange}
        rows={4}
      />

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
        >
          {initialData ? 'Update Assignment' : 'Publish Assignment'}
        </Button>
      </div>
    </form>
  )
}
