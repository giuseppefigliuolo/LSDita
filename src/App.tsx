import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import WorkoutDay from './pages/WorkoutDay'
import ActiveWorkout from './pages/ActiveWorkout'
import CalendarPage from './pages/CalendarPage'
import ProgressPage from './pages/ProgressPage'
import SettingsPage from './pages/SettingsPage'
import ReloadPrompt from './components/ui/ReloadPrompt'

export default function App() {
  return (
    <>
      <AnimatePresence mode="wait">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="/workout/:weekNumber/:dayOfWeek" element={<WorkoutDay />} />
          <Route path="/workout/:weekNumber/:dayOfWeek/active" element={<ActiveWorkout />} />
        </Routes>
      </AnimatePresence>
      <ReloadPrompt />
    </>
  )
}
