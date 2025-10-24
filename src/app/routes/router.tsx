import { createBrowserRouter, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/auth/ProtectedRoute'
import AppLayout from '@/app/layouts/Layout.tsx'

import LoginPage from '@/pages/LoginPage'
import UsersPage from '@/pages/UsersPage.tsx'
import BranchesPage from '@/pages/BranchesPage'
import LoadsPage from '@/pages/LoadsPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import VerificationPage from '@/pages/VerificationPage'
import CreatePasswordPage from '@/pages/CreatePasswordPage'
import RegistrationPage from '@/pages/RegistrationPage'

const NotFound = () => <div>Not Found</div>

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/verification', element: <VerificationPage /> },
  { path: '/create-password', element: <CreatePasswordPage /> },
  { path: '/register', element: <RegistrationPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <UsersPage /> },
          { path: 'branches', element: <BranchesPage /> },
          { path: 'loads', element: <LoadsPage /> }
        ],
      },
    ],
  },

  { path: '/home', element: <Navigate to="/" replace /> },
  { path: '*', element: <NotFound /> },
])
