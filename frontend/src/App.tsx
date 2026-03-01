import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import AuthGuard from './components/AuthGuard'
import Dashboard from './pages/Dashboard'
import DashboardLayout from './layouts/DashboardLayout'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Warehouses from './pages/Warehouses'
import Products from './pages/Products'
import Movements from './pages/Movements'
import { Toaster } from 'sonner'
import UsersPage from './pages/UsersPage'
import AdminGuard from './components/AdminGuard'
import VerifyEmail from './pages/VerifyEmail'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<AuthGuard />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/warehouses" element={<Warehouses />} />
              <Route path="/movements" element={<Movements />} />
              <Route path="/profile" element={<Profile />} />
              <Route element={<AdminGuard />}>
                <Route path="/users" element={<UsersPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  )
}

export default App
