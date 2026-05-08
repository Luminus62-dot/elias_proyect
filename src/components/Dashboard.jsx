import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Droplet, Milk, Moon, LogOut, Plus } from 'lucide-react'
import AddEventModal from './AddEventModal'

const ML_TO_OZ = 29.5735

export default function Dashboard({ session }) {
  const [events, setEvents] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchEvents()

    const subscription = supabase
      .channel('public:events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, payload => {
        if (payload.eventType === 'INSERT') {
          setEvents(current => [payload.new, ...current])
        } else if (payload.eventType === 'DELETE') {
          setEvents(current => current.filter(e => e.id !== payload.old.id))
        } else if (payload.eventType === 'UPDATE') {
          setEvents(current => current.map(e => e.id === payload.new.id ? payload.new : e))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (!error && data) {
      setEvents(data)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const getEventIcon = (type) => {
    switch(type) {
      case 'comida': return <Milk className="w-6 h-6 text-blue-500" />
      case 'pipi': return <Droplet className="w-6 h-6 text-yellow-500" />
      case 'popo': return <div className="w-6 h-6 rounded-full bg-amber-700 flex items-center justify-center text-xs text-white">💩</div>
      default: return <Moon className="w-6 h-6 text-purple-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 py-6 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Historial de Bebé</h1>
          <button onClick={handleSignOut} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4 mt-4">
        {events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay registros aún. ¡Añade el primero!
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-gray-900 capitalize text-lg">{event.type}</h3>
                  <span className="text-sm text-gray-500">
                    {format(new Date(event.created_at), "h:mm a", { locale: es })}
                  </span>
                </div>
                <div className="text-gray-600 text-sm">
                  {event.subtype && <span className="font-medium mr-2">{event.subtype}</span>}
                  
                  {event.value_ml && (
                    <span className="inline-flex items-center gap-1">
                      {event.value_ml} ml 
                      <span className="text-gray-400 text-xs">
                        ({(event.value_ml / ML_TO_OZ).toFixed(1)} oz)
                      </span>
                    </span>
                  )}
                  
                  {event.duration_min && (
                    <span>• {event.duration_min} min</span>
                  )}
                  
                  {event.bristol_score && (
                    <span>• Tipo {event.bristol_score} (Bristol)</span>
                  )}
                </div>
                {event.notes && (
                  <p className="mt-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg italic">
                    "{event.notes}"
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </main>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 lg:right-[calc(50%-20rem)] w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>

      {isModalOpen && (
        <AddEventModal onClose={() => setIsModalOpen(false)} session={session} />
      )}
    </div>
  )
}
