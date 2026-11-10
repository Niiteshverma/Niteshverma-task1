// Registration page with validation, role selection, auto-enrollment, and instant sign-in
import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ROLES } from '../utils/constants'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'

export default function RegisterPage() {
  const { currentUser, register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState(ROLES.STUDENT)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already logged in
  if (currentUser) {
    const destination = currentUser.role === ROLES.PROFESSOR ? '/professor' : '/student'
    return <Navigate to={destination} replace />
  }

  const validate = () => {
    const newErrors = {}
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      newErrors.name = 'Full name is required'
    }

    if (!trimmedEmail) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    const result = register({
      name,
      email,
      password,
      role,
    })
    setIsSubmitting(false)

    if (!result.success) {
      setErrors({ email: result.error })
      return
    }

    showToast(`Account created! Welcome, ${result.user.name}.`, 'success')
    const destination = result.user.role === ROLES.PROFESSOR ? '/professor' : '/student'
    navigate(destination, { replace: true })
  }

  const roleOptions = [
    { value: ROLES.STUDENT, label: 'Student (View & Submit Coursework)' },
    { value: ROLES.PROFESSOR, label: 'Professor (Manage Courses & Assignments)' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl shadow-md mb-3">
          SM
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create an account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Join your classes and collaborative workspaces
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-lg border-slate-200/80 p-6 sm:p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              id="register-name"
              name="name"
              label="Full Name"
              placeholder="e.g. Jane Doe"
              value={name}
              error={errors.name}
              required
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
              }}
            />

            <Input
              id="register-email"
              name="email"
              type="email"
              label="Email address"
              placeholder="e.g. jane@university.edu"
              value={email}
              error={errors.email}
              required
              autoComplete="email"
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
              }}
            />

            <Select
              id="register-role"
              name="role"
              label="Account Role"
              value={role}
              options={roleOptions}
              required
              onChange={(e) => setRole(e.target.value)}
            />

            <Input
              id="register-password"
              name="password"
              type="password"
              label="Password"
              placeholder="Minimum 6 characters"
              value={password}
              error={errors.password}
              required
              autoComplete="new-password"
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
              }}
            />

            <Input
              id="register-confirm-password"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: '' }))
                }
              }}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full mt-2"
            >
              Complete Registration
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700 transition"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

