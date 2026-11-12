// Sign-in page with email/password validation, demo quick-fill credentials, and role navigation
import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ROLES } from '../utils/constants'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const { currentUser, login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already logged in
  if (currentUser) {
    const destination = currentUser.role === ROLES.PROFESSOR ? '/professor' : '/student'
    return <Navigate to={destination} replace />
  }

  const validate = () => {
    const newErrors = {}
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    const result = login(email, password)
    setIsSubmitting(false)

    if (!result.success) {
      setErrors({ form: result.error })
      return
    }

    showToast(`Welcome back, ${result.user.name}!`, 'success')
    const destination = result.user.role === ROLES.PROFESSOR ? '/professor' : '/student'
    navigate(destination, { replace: true })
  }

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setErrors({})
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl shadow-md mb-3">
          NV
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Student, Group &amp; Assignment Management Portal
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-lg border-slate-200/80 p-6 sm:p-8 space-y-6">
          {errors.form && (
            <div
              role="alert"
              className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs sm:text-sm font-medium text-rose-700"
            >
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              id="login-email"
              name="email"
              type="email"
              label="Email address"
              placeholder="e.g. student1@demo.com"
              value={email}
              error={errors.email}
              required
              autoComplete="email"
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email || errors.form) {
                  setErrors((prev) => ({ ...prev, email: '', form: '' }))
                }
              }}
            />

            <Input
              id="login-password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              error={errors.password}
              required
              autoComplete="current-password"
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password || errors.form) {
                  setErrors((prev) => ({ ...prev, password: '', form: '' }))
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
              Sign In
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
              Quick Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('priya@gmail.com', 'password123')}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-left transition group"
              >
                <span className="font-bold text-slate-800 group-hover:text-indigo-700 block">
                  Student Demo
                </span>
                <span className="text-[11px] text-slate-500 truncate block">
                  priya@gmail.com
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('ritesh@gmail.com', 'password123')}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 text-left transition group"
              >
                <span className="font-bold text-slate-800 group-hover:text-purple-700 block">
                  Professor Demo
                </span>
                <span className="text-[11px] text-slate-500 truncate block">
                  ritesh@gmail.com
                </span>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-600">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-700 transition"
              >
                Create an account
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
