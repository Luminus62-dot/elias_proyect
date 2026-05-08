import { supabase } from '../lib/supabase'
import { Baby } from 'lucide-react'

export default function Auth() {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    
    if (error) console.error('Error logging in:', error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full glass-card rounded-2xl p-8 space-y-8 text-center shadow-xl">
        <div className="flex justify-center">
          <div className="bg-primary/10 p-4 rounded-full">
            <Baby className="w-16 h-16 text-primary" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Baby Tracker</h2>
          <p className="mt-2 text-gray-600">Lleva el control de tu bebé de forma fácil</p>
        </div>
        
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl px-6 py-4 text-gray-700 font-medium hover:bg-gray-50 transition-all shadow-sm"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continuar con Google
        </button>
      </div>
    </div>
  )
}
