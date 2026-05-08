import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { X } from 'lucide-react'
import { format } from 'date-fns'

const ML_TO_OZ = 29.5735

export default function AddEventModal({ onClose, session, eventToEdit = null }) {
  const [type, setType] = useState(eventToEdit?.type || 'comida')
  const [subtype, setSubtype] = useState(eventToEdit?.subtype || '')
  const [valueMl, setValueMl] = useState(eventToEdit?.value_ml || '')
  const [durationMin, setDurationMin] = useState(eventToEdit?.duration_min || '')
  const [bristolScore, setBristolScore] = useState(eventToEdit?.bristol_score || '')
  const [notes, setNotes] = useState(eventToEdit?.notes || '')
  
  const [eventTime, setEventTime] = useState(
    eventToEdit?.created_at 
      ? format(new Date(eventToEdit.created_at), "yyyy-MM-dd'T'HH:mm") 
      : format(new Date(), "yyyy-MM-dd'T'HH:mm")
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (eventToEdit) {
      setType(eventToEdit.type || 'comida')
      setSubtype(eventToEdit.subtype || '')
      setValueMl(eventToEdit.value_ml || '')
      setDurationMin(eventToEdit.duration_min || '')
      setBristolScore(eventToEdit.bristol_score || '')
      setNotes(eventToEdit.notes || '')
      setEventTime(
        eventToEdit.created_at 
          ? format(new Date(eventToEdit.created_at), "yyyy-MM-dd'T'HH:mm") 
          : format(new Date(), "yyyy-MM-dd'T'HH:mm")
      )
    }
  }, [eventToEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      type,
      subtype: subtype || null,
      value_ml: valueMl ? parseFloat(valueMl) : null,
      duration_min: durationMin ? parseInt(durationMin) : null,
      bristol_score: bristolScore ? parseInt(bristolScore) : null,
      notes: notes || null,
      user_id: session.user.id,
      created_at: new Date(eventTime).toISOString()
    }

    let error;
    if (eventToEdit) {
      const res = await supabase.from('events').update(payload).eq('id', eventToEdit.id)
      error = res.error
    } else {
      const res = await supabase.from('events').insert([payload])
      error = res.error
    }
    
    if (error) {
      console.error('Error saving event:', error)
      alert('Error guardando evento')
    } else {
      onClose()
    }
    setLoading(false)
  }

  const renderFields = () => {
    switch (type) {
      case 'comida':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Comida</label>
              <select 
                value={subtype} 
                onChange={(e) => setSubtype(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-primary focus:border-primary"
              >
                <option value="">Seleccionar...</option>
                <option value="Formula">Fórmula</option>
                <option value="Leche Materna">Leche Materna</option>
                <option value="Pecho">Pecho directamente</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {subtype !== 'Pecho' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad (ml)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.1"
                      value={valueMl} 
                      onChange={(e) => setValueMl(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-3 pr-12 focus:ring-primary focus:border-primary"
                      placeholder="Ej. 120"
                    />
                    {valueMl && (
                      <div className="absolute right-3 top-3.5 text-[10px] text-gray-400 font-medium">
                        ~{(parseFloat(valueMl) / ML_TO_OZ).toFixed(1)}oz
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className={subtype === 'Pecho' ? 'col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
                <input 
                  type="number" 
                  value={durationMin} 
                  onChange={(e) => setDurationMin(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-primary focus:border-primary"
                  placeholder="Ej. 15"
                />
              </div>
            </div>
          </>
        )
      case 'popo':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escala de Bristol (1-7)</label>
            <input 
              type="number" 
              min="1" max="7"
              value={bristolScore} 
              onChange={(e) => setBristolScore(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-primary focus:border-primary"
              placeholder="Ej. 4"
            />
            <p className="text-xs text-gray-500 mt-1">1: Bolitas duras, 7: Totalmente líquida</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{eventToEdit ? 'Editar Registro' : 'Añadir Registro'}</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora del Registro</label>
            <input 
              type="datetime-local" 
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">¿Qué hizo el bebé?</label>
            <div className="grid grid-cols-3 gap-3">
              {['comida', 'pipi', 'popo'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-3 rounded-xl border-2 transition-all capitalize font-medium ${
                    type === t 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {renderFields()}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              rows="2"
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-primary focus:border-primary resize-none"
              placeholder="Algo que recordar..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-hover active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  )
}
