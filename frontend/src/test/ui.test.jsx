import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Textarea from '../components/ui/Textarea'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Badge from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import Toast from '../components/ui/Toast'
import { ToastProvider, useToast } from '../context/ToastContext'
import { MemoryRouter } from 'react-router-dom'

describe('Phase 2: Reusable UI Components & Toast System', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // 1. Button
  it('renders Button with variants and handles loading and click states', () => {
    const handleClick = vi.fn()
    const { rerender } = render(
      <Button variant="primary" onClick={handleClick}>
        Save Changes
      </Button>
    )

    const btn = screen.getByRole('button', { name: /save changes/i })
    expect(btn).toHaveClass('bg-indigo-600')
    fireEvent.click(btn)
    expect(handleClick).toHaveBeenCalledTimes(1)

    // Secondary variant
    rerender(<Button variant="secondary">Cancel</Button>)
    expect(screen.getByRole('button', { name: /cancel/i })).toHaveClass('bg-white')

    // Danger variant
    rerender(<Button variant="danger">Delete</Button>)
    expect(screen.getByRole('button', { name: /delete/i })).toHaveClass('bg-red-600')

    // Loading state disables button
    rerender(<Button isLoading>Submitting</Button>)
    const loadingBtn = screen.getByRole('button', { name: /submitting/i })
    expect(loadingBtn).toBeDisabled()
    expect(loadingBtn.querySelector('svg.animate-spin')).not.toBeNull()
  })

  // 2. Card
  it('renders Card with content and hoverable styling', () => {
    const { rerender } = render(<Card>Card Content</Card>)
    const card = screen.getByText('Card Content')
    expect(card).toBeInTheDocument()

    rerender(<Card hoverable>Interactive Card</Card>)
    expect(screen.getByText('Interactive Card')).toHaveClass('hover:shadow-md')
  })

  // 3. Input
  it('renders Input with label, placeholder, and accessible error message', () => {
    const handleChange = vi.fn()
    const { rerender } = render(
      <Input
        id="email"
        label="Email Address"
        placeholder="you@example.com"
        value="test"
        onChange={handleChange}
      />
    )

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    const input = screen.getByPlaceholderText('you@example.com')
    fireEvent.change(input, { target: { value: 'test@example.com' } })
    expect(handleChange).toHaveBeenCalled()

    // Error state
    rerender(
      <Input
        id="email"
        label="Email Address"
        error="Invalid email format"
        value=""
        onChange={handleChange}
      />
    )
    const errorAlert = screen.getByRole('alert')
    expect(errorAlert).toHaveTextContent('Invalid email format')
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute('aria-invalid', 'true')
  })

  // 4. Select
  it('renders Select with options and handles selection', () => {
    const handleChange = vi.fn()
    const options = [
      { value: 'individual', label: 'Individual' },
      { value: 'group', label: 'Group' },
    ]

    render(
      <Select
        id="submission-type"
        label="Submission Type"
        options={options}
        value="individual"
        onChange={handleChange}
      />
    )

    const select = screen.getByLabelText(/submission type/i)
    expect(select).toHaveValue('individual')
    fireEvent.change(select, { target: { value: 'group' } })
    expect(handleChange).toHaveBeenCalled()
  })

  // 5. Textarea
  it('renders Textarea with label and accessible error', () => {
    render(
      <Textarea
        id="desc"
        label="Description"
        error="Description is required"
        placeholder="Enter details..."
      />
    )

    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Description is required')
  })

  // 6. Modal
  it('renders Modal when isOpen is true and handles Escape and close button', () => {
    const handleClose = vi.fn()
    const { rerender } = render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal Body Content</p>
      </Modal>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal Body Content')).toBeInTheDocument()

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(1)

    // Hidden when isOpen is false
    rerender(
      <Modal isOpen={false} onClose={handleClose} title="Test Modal">
        <p>Modal Body Content</p>
      </Modal>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  // 7. ConfirmDialog
  it('renders ConfirmDialog and invokes onConfirm and onClose', () => {
    const handleConfirm = vi.fn()
    const handleClose = vi.fn()

    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm Submission"
        message="Are you sure you want to acknowledge this task?"
        onConfirm={handleConfirm}
        onClose={handleClose}
      />
    )

    expect(screen.getByText('Confirm Submission')).toBeInTheDocument()
    expect(screen.getByText(/are you sure you want to acknowledge/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))
    expect(handleConfirm).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  // 8. Badge
  it('renders Badge with semantic status colors', () => {
    const { rerender } = render(<Badge variant="Acknowledged">Acknowledged</Badge>)
    expect(screen.getByText('Acknowledged')).toHaveClass('text-emerald-700')

    rerender(<Badge variant="Due soon">Due soon</Badge>)
    expect(screen.getByText('Due soon')).toHaveClass('text-amber-700')

    rerender(<Badge variant="Overdue">Overdue</Badge>)
    expect(screen.getByText('Overdue')).toHaveClass('text-rose-700')

    rerender(<Badge variant="individual">Individual</Badge>)
    expect(screen.getByText('Individual')).toHaveClass('text-indigo-700')

    rerender(<Badge variant="group">Group</Badge>)
    expect(screen.getByText('Group')).toHaveClass('text-purple-700')
  })

  // 9. ProgressBar
  it('renders ProgressBar with accessible ARIA attributes and clamped percentage', () => {
    const { rerender } = render(<ProgressBar value={3} max={5} showLabel />)
    const progressbar = screen.getByRole('progressbar')

    expect(progressbar).toHaveAttribute('aria-valuenow', '60')
    expect(screen.getByText('60%')).toBeInTheDocument()

    // 0 of 0 safe handling
    rerender(<ProgressBar value={0} max={0} showLabel />)
    expect(progressbar).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  // 10. Loader
  it('renders Loader with message and role="status"', () => {
    render(<Loader message="Fetching assignments..." />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Fetching assignments...')).toBeInTheDocument()
  })

  // 11. EmptyState
  it('renders EmptyState with title, description, and action button', () => {
    const handleAction = vi.fn()
    render(
      <EmptyState
        title="No courses enrolled"
        description="Contact your department advisor to enroll in courses."
        actionLabel="Refresh Courses"
        onAction={handleAction}
      />
    )

    expect(screen.getByText('No courses enrolled')).toBeInTheDocument()
    expect(screen.getByText(/contact your department advisor/i)).toBeInTheDocument()

    const btn = screen.getByRole('button', { name: /refresh courses/i })
    fireEvent.click(btn)
    expect(handleAction).toHaveBeenCalledTimes(1)
  })

  // 12. PageHeader
  it('renders PageHeader with navigation and action slot', () => {
    render(
      <MemoryRouter>
        <PageHeader
          title="Course Assignments"
          subtitle="View and acknowledge assigned coursework."
          badge={<Badge variant="info">CS301</Badge>}
          action={<Button>Create Assignment</Button>}
          backTo="/student"
        />
      </MemoryRouter>
    )

    expect(screen.getByText('Course Assignments')).toBeInTheDocument()
    expect(screen.getByText('CS301')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create assignment/i })).toBeInTheDocument()
  })

  // 13. Toast System
  it('shows and stacks multiple toasts and allows manual dismissal', () => {
    function TestConsumer() {
      const { showToast } = useToast()
      return (
        <div>
          <button onClick={() => showToast('Assignment acknowledged!', 'success')}>
            Show Success
          </button>
          <button onClick={() => showToast('Failed to save group', 'error')}>
            Show Error
          </button>
        </div>
      )
    }

    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /show success/i }))
    fireEvent.click(screen.getByRole('button', { name: /show error/i }))

    expect(screen.getByText('Assignment acknowledged!')).toBeInTheDocument()
    expect(screen.getByText('Failed to save group')).toBeInTheDocument()

    // Dismiss first toast
    const dismissButtons = screen.getAllByRole('button', { name: /dismiss notification/i })
    expect(dismissButtons.length).toBe(2)

    fireEvent.click(dismissButtons[0])
    expect(screen.queryByText('Assignment acknowledged!')).not.toBeInTheDocument()
    expect(screen.getByText('Failed to save group')).toBeInTheDocument()
  })
})
