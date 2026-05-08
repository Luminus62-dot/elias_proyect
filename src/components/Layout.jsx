import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Plus, Clock, BarChart2, Settings as SettingsIcon } from 'lucide-react'
import AddEventModal from './AddEventModal'

export default function Layout({ session }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 pb-24 relative overflow-y-auto">
        <Outlet />
      </main>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 lg:right-[calc(50%-20rem)] w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-20"
      >
        <Plus className="w-6 h-6" />
      </button>

      {isModalOpen && (
        <AddEventModal onClose={() => setIsModalOpen(false)} session={session} />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 px-6 py-3 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `flex flex-col items-center p-2 rounded-xl transition-colors ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`
            }
          >
            <Clock className="w-6 h-6" />
            <span className="text-xs font-medium mt-1">Historial</span>
          </NavLink>
          
          <NavLink 
            to="/stats" 
            className={({ isActive }) => 
              `flex flex-col items-center p-2 rounded-xl transition-colors ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`
            }
          >
            <BarChart2 className="w-6 h-6" />
            <span className="text-xs font-medium mt-1">Resumen</span>
          </NavLink>

          <NavLink 
            to="/settings" 
            className={({ isActive }) => 
              `flex flex-col items-center p-2 rounded-xl transition-colors ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`
            }
          >
            <SettingsIcon className="w-6 h-6" />
            <span className="text-xs font-medium mt-1">Ajustes</span>
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
