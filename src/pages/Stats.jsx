import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Milk, Baby } from 'lucide-react'

const ML_TO_OZ = 29.5735

export default function Stats({ session }) {
  const [stats, setStats] = useState({
    totalMilk: 0,
    diapers: 0
  })

  useEffect(() => {
    fetchTodayStats()
  }, [])

  const fetchTodayStats = async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('created_at', today.toISOString())
    
    if (!error && data) {
      let totalMilk = 0
      let diapers = 0

      data.forEach(event => {
        if (event.type === 'comida' && event.value_ml) {
          totalMilk += event.value_ml
        }
        if (event.type === 'pipi' || event.type === 'popo') {
          diapers += 1
        }
      })

      setStats({ totalMilk, diapers })
    }
  }

  return (
    <>
      <header className="bg-white px-4 py-6 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Resumen de Hoy</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-primary/20">
              <Milk className="w-7 h-7" />
            </div>
            <p className="text-sm text-gray-500 font-medium mb-1">Leche Total</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalMilk} ml</h3>
            <span className="text-xs text-gray-400">~{(stats.totalMilk / ML_TO_OZ).toFixed(1)} oz</span>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-sky-100 text-sky-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-sky-200">
              <Baby className="w-7 h-7" />
            </div>
            <p className="text-sm text-gray-500 font-medium mb-1">Pañales</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.diapers}</h3>
            <span className="text-xs text-gray-400">cambios</span>
          </div>
        </div>

        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 text-center">
          <h3 className="text-primary font-bold mb-2">¡Sigue así!</h3>
          <p className="text-sm text-gray-600">
            Mantener el registro ayuda a crear rutinas más saludables para tu bebé.
          </p>
        </div>
      </div>
    </>
  )
}
