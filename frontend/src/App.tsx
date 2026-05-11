import { Routes, Route, Navigate } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import Dashboard from "./pages/Dashboard"
import Habits from "./pages/Habits"
import Analytics from "./pages/Analytics"
import Calendar from "./pages/Calendar"
import Settings from "./pages/Settings"
import Login from "./pages/Login"
import Register from "./pages/Register"
import { useAuth } from "./lib/AuthContext"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="h-screen w-screen bg-[#0E0E11] flex items-center justify-center text-zinc-500">Loading...</div>
  if (!user) return <Navigate to="/login" />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
