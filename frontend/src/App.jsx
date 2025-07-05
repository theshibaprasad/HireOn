import { useEffect, useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Navbar from './components/shared/Navbar'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import Home from './components/Home'
import Jobs from './components/Jobs'
import Browse from './components/Browse'
import Profile from './components/Profile'
import JobDescription from './components/JobDescription'
import Companies from './components/admin/Companies'
import CompanyCreate from './components/admin/CompanyCreate'
import CompanySetup from './components/admin/CompanySetup'
import AdminJobs from './components/admin/AdminJobs'
import PostJob from './components/admin/PostJob'
import Applicants from './components/admin/Applicants'
import ProtectedRoute from './components/admin/ProtectedRoute'
import Loader from './components/shared/Loader' // ✅ Import loader here

const appRouter = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/jobs', element: <Jobs /> },
  { path: '/description/:id', element: <JobDescription /> },
  { path: '/browse', element: <Browse /> },
  { path: '/profile', element: <Profile /> },
  { path: '/admin/companies', element: <ProtectedRoute><Companies /></ProtectedRoute> },
  { path: '/admin/companies/create', element: <ProtectedRoute><CompanyCreate /></ProtectedRoute> },
  { path: '/admin/companies/:id', element: <ProtectedRoute><CompanySetup /></ProtectedRoute> },
  { path: '/admin/jobs', element: <ProtectedRoute><AdminJobs /></ProtectedRoute> },
  { path: '/admin/jobs/create', element: <ProtectedRoute><PostJob /></ProtectedRoute> },
  { path: '/admin/jobs/:id/applicants', element: <ProtectedRoute><Applicants /></ProtectedRoute> }
])

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500) // Show loader for 2.5s
    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      {loading ? <Loader /> : <RouterProvider router={appRouter} />}
    </div>
  )
}

export default App
