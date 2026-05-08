import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Droplet, Milk, Moon, Edit2, Trash2 } from 'lucide-react'
import AddEventModal from '../components/AddEventModal'

const ML_TO_OZ = 29.5735

export default function History({ session }) {
  const [events, setEvents] = useState([])
  const [editingEvent, setEditingEvent] = useState(null)

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

  const getEventIcon = (type) => {
    switch(type) {
      case 'comida': 
        return (
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-sm border border-primary/20">
            <Milk className="w-6 h-6" />
          </div>
        )
      case 'pipi': 
        return (
          <div className="w-12 h-12 bg-sky-100 text-sky-500 rounded-2xl flex items-center justify-center shadow-sm border border-sky-200">
            <Droplet className="w-6 h-6" />
          </div>
        )
      case 'popo': 
        return (
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm border border-amber-200">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.5 2 7 4.5 7 6.5C7 7.5 7.5 8.2 8.2 8.7C7.5 9.2 7 10 7 11C7 12 7.5 12.8 8.2 13.3C6.8 14 6 15.2 6 16.5C6 19.5 8.5 22 12 22C15.5 22 18 19.5 18 16.5C18 15.2 17.2 14 15.8 13.3C16.5 12.8 17 12 17 11C17 10 16.5 9.2 15.8 8.7C16.5 8.2 17 7.5 17 6.5C17 4.5 15.5 2 12 2Z" />
            </svg>
          </div>
        )
      default: 
        return (
          <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-2xl flex items-center justify-center shadow-sm border border-gray-200">
            <Moon className="w-6 h-6" />
          </div>
        )
    }
  }

  const renderFormulaStatus = (event) => {
    if (event.subtype !== 'Formula') return null
    
    const eventDate = new Date(event.created_at)
    const expiryDate = new Date(eventDate.getTime() + 60 * 60 * 1000)
    const isExpired = new Date() > expiryDate

    if (isExpired) {
      return <span className="inline-block mt-1 text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full border border-red-100 font-medium">Fórmula expirada</span>
    } else {
      return <span className="inline-block mt-1 text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100 font-medium">Fórmula válida hasta {format(expiryDate, "h:mm a", { locale: es })}</span>
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que quieres eliminar este registro? Esta acción no se puede deshacer.')) {
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (error) {
        console.error('Error deleting event:', error)
        alert('Hubo un error al intentar eliminar el registro.')
      }
    }
  }

  return (
    <>
      <header className="bg-white px-4 py-6 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Historial</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-4 mt-4">
        {events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay registros aún. ¡Añade el primero!
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-white p-4 sm:p-5 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-300 hover:shadow-md transition-shadow">
              
              {/* Icon Container */}
              <div className="shrink-0">
                {getEventIcon(event.type)}
              </div>

              {/* Content Container */}
              <div className="flex-1 min-w-0 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 capitalize text-[17px] leading-tight">
                    {event.type}
                  </h3>
                  <span className="text-xs font-medium text-gray-400">
                    {format(new Date(event.created_at), "h:mm a", { locale: es })}
                  </span>
                </div>
                
                {/* Details Row */}
                {(event.subtype || event.value_ml || event.duration_min || event.bristol_score) && (
                  <div className="text-gray-600 text-sm flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5 mt-1.5">
                    {event.subtype && (
                      <span className="font-semibold text-primary/80 bg-primary/5 px-2 py-0.5 rounded-md text-xs">
                        {event.subtype}
                      </span>
                    )}
                    
                    {event.value_ml && (
                      <span className="inline-flex items-center">
                        {event.value_ml} ml 
                        <span className="text-gray-400 text-xs ml-1">
                          ({(event.value_ml / ML_TO_OZ).toFixed(1)} oz)
                        </span>
                      </span>
                    )}
                    
                    {event.duration_min && (
                      <span className="inline-flex items-center text-gray-500">
                        <span className="mx-1">•</span> {event.duration_min} min
                      </span>
                    )}
                    
                    {event.bristol_score && (
                      <span className="inline-flex items-center text-gray-500">
                        <span className="mx-1">•</span> Bristol {event.bristol_score}
                      </span>
                    )}
                  </div>
                )}
                
                {renderFormulaStatus(event)}
                
                {event.notes && (
                  <p className="mt-2 text-sm text-gray-500 bg-gray-50 p-2.5 rounded-xl italic border border-gray-100/50">
                    "{event.notes}"
                  </p>
                )}
              </div>

              {/* Right: Actions */}
              <div className="shrink-0 flex items-center gap-1 pl-2 border-l border-gray-50">
                <button 
                  onClick={() => handleDelete(event.id)} 
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-xl"
                  title="Eliminar"
                >
                  <Trash2 className="w-[18px] h-[18px]" />
                </button>
                <button 
                  onClick={() => setEditingEvent(event)} 
                  className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl"
                  title="Editar"
                >
                  <Edit2 className="w-[18px] h-[18px]" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {editingEvent && (
        <AddEventModal 
          session={session} 
          eventToEdit={editingEvent} 
          onClose={() => setEditingEvent(null)} 
        />
      )}
    </>
  )
}
