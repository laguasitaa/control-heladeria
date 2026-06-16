-- Función update_updated_at (idempotente por si no existe)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ── Tabla documentos ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documentos (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  heladeria_id    uuid        NOT NULL REFERENCES heladeria(id) ON DELETE CASCADE,
  nombre          text        NOT NULL,
  categoria       text        NOT NULL DEFAULT 'otros',
  descripcion     text,
  archivo_path    text        NOT NULL,  -- path en Storage: {heladeria_id}/{uuid}/{nombre}
  archivo_nombre  text        NOT NULL,  -- nombre original del archivo
  archivo_tamanio bigint,                -- bytes
  fecha           date        NOT NULL DEFAULT CURRENT_DATE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Índice
CREATE INDEX IF NOT EXISTS documentos_heladeria_fecha_idx ON documentos(heladeria_id, fecha DESC);

-- Trigger updated_at
CREATE TRIGGER documentos_updated_at
  BEFORE UPDATE ON documentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_access_documentos" ON documentos
  USING (heladeria_id IN (
    SELECT heladeria_id FROM heladeria_miembros WHERE user_id = auth.uid()
  ))
  WITH CHECK (heladeria_id IN (
    SELECT heladeria_id FROM heladeria_miembros WHERE user_id = auth.uid()
  ));

-- ── Storage bucket (privado) ──────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos',
  'documentos',
  false,
  20971520,   -- 20 MB
  ARRAY[
    'application/pdf',
    'image/jpeg','image/png','image/webp','image/heic',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: solo miembros de la heladería acceden a su carpeta
CREATE POLICY "org_upload_documentos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documentos'
    AND (storage.foldername(name))[1] IN (
      SELECT heladeria_id::text FROM heladeria_miembros WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "org_read_documentos" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documentos'
    AND (storage.foldername(name))[1] IN (
      SELECT heladeria_id::text FROM heladeria_miembros WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "org_delete_documentos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documentos'
    AND (storage.foldername(name))[1] IN (
      SELECT heladeria_id::text FROM heladeria_miembros WHERE user_id = auth.uid()
    )
  );
