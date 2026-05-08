-- Crear tabla events
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('comida', 'pipi', 'popo')),
  subtype TEXT,
  value_ml NUMERIC,
  duration_min INTEGER,
  bristol_score INTEGER CHECK (bristol_score >= 1 AND bristol_score <= 7),
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad: Los usuarios autenticados pueden ver todos los eventos
CREATE POLICY "Usuarios pueden ver todos los eventos" ON events
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas de seguridad: Los usuarios autenticados pueden insertar eventos
CREATE POLICY "Usuarios pueden insertar eventos" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Activar Realtime para la tabla events
ALTER PUBLICATION supabase_realtime ADD TABLE events;
