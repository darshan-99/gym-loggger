import { NavLink, Route, Routes } from 'react-router-dom'
import Today from './pages/Today'
import Routine from './pages/Routine'
import Dashboard from './pages/Dashboard'
import Holidays from './pages/Holidays'

const tabs = [['/', 'Today'], ['/routine', 'Routine'], ['/dashboard', 'Dashboard'], ['/holidays', 'Holidays']]

export default function App() {
  return (
    <>
      <main className="max-w-xl mx-auto p-4 pb-28">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/routine" element={<Routine />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/holidays" element={<Holidays />} />
        </Routes>
      </main>
      <nav className="fixed inset-x-0 bottom-0 bg-card border-t border-line flex px-1.5 pt-1.5" style={{ paddingBottom: 'calc(6px + env(safe-area-inset-bottom))' }}>
        {tabs.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `flex-1 py-2.5 text-center text-[13px] font-semibold ${isActive ? 'text-acc' : 'text-mut'}`}>
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
