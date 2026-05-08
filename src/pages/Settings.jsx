import { supabase } from '../lib/supabase'
import { LogOut, User, Bell } from 'lucide-react'

export default function Settings({ session }) {
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <>
      <header className="bg-white px-4 py-6 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ajustes</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6 mt-4">
        
        {/* User Info Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <User className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900 text-lg">Cuenta</h2>
            <p className="text-sm text-gray-500">{session?.user?.email}</p>
          </div>
        </div>

        {/* Options */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <button className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-gray-900">Notificaciones</h3>
              <p className="text-xs text-gray-500">Configura avisos y alertas</p>
            </div>
          </button>
          
          <button 
            onClick={handleSignOut}
            className="w-full px-6 py-4 flex items-center gap-4 hover:bg-red-50 transition-colors text-red-600"
          >
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium">Cerrar Sesión</h3>
              <p className="text-xs text-red-400">Salir de tu cuenta en este dispositivo</p>
            </div>
          </button>
        </div>

      </div>
    </>
  )
}
