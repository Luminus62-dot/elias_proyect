-- Políticas de seguridad: Los usuarios autenticados pueden actualizar sus eventos
CREATE POLICY "Usuarios pueden actualizar eventos" ON events
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Políticas de seguridad: Los usuarios autenticados pueden eliminar sus eventos
CREATE POLICY "Usuarios pueden eliminar eventos" ON events
  FOR DELETE USING (auth.role() = 'authenticated');
