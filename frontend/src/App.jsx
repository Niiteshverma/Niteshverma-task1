import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import { ROLES } from './utils/constants'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              {/* Public login */}
              <Route path="/" element={<LoginPage />} />

              {/* Student dashboard */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRole={ROLES.STUDENT}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin dashboard */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRole={ROLES.ADMIN}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
