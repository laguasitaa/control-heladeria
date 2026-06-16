-- Función update_updated_at (idempotente)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ── inventario_items: catálogo de productos ───────────────────────────────────
CREATE TABLE IF NOT EXISTS inventario_items (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  heladeria_id uuid        NOT NULL REFERENCES heladeria(id) ON DELETE CASCADE,
  nombre       text        NOT NULL,
  unidad       text        NOT NULL DEFAULT 'kg',   -- kg, L, piezas, bolsas, etc.
  categoria    text        NOT NULL DEFAULT 'otros',
  activo       boolean     NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inventario_items_heladeria_idx ON inventario_items(heladeria_id);

CREATE TRIGGER inventario_items_updated_at
  BEFORE UPDATE ON inventario_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE inventario_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_access_inventario_items" ON inventario_items
  USING (heladeria_id IN (
    SELECT heladeria_id FROM heladeria_miembros WHERE user_id = auth.uid()
  ))
  WITH CHECK (heladeria_id IN (
    SELECT heladeria_id FROM heladeria_miembros WHERE user_id = auth.uid()
  ));

-- ── inventario_registros: snapshot mensual por producto ───────────────────────
-- Un registro por producto por mes. stock_actual se recalcula con los consumos.
CREATE TABLE IF NOT EXISTS inventario_registros (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  heladeria_id    uuid        NOT NULL REFERENCES heladeria(id) ON DELETE CASCADE,
  item_id         uuid        NOT NULL REFERENCES inventario_items(id) ON DELETE CASCADE,
  mes             integer     NOT NULL CHECK (mes BETWEEN 1 AND 12),
  anio            integer     NOT NULL,
  stock_inicial   numeric     NOT NULL CHECK (stock_inicial >= 0),
  notas           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_id, mes, anio)
);

CREATE INDEX IF NOT EXISTS inventario_registros_heladeria_mes_idx
  ON inventario_registros(heladeria_id, anio DESC, mes DESC);

CREATE TRIGGER inventario_registros_updated_at
  BEFORE UPDATE ON inventario_registros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE inventario_registros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_access_inventario_registros" ON inventario_registros
  USING (heladeria_id IN (
    SELECT heladeria_id FROM heladeria_miembros WHERE user_id = auth.uid()
  ))
  WITH CHECK (heladeria_id IN (
    SELECT heladeria_id FROM heladeria_miembros WHERE user_id = auth.uid()
  ));

-- ── inventario_consumos: consumos semanales ───────────────────────────────────
CREATE TABLE IF NOT EXISTS inventario_consumos (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  heladeria_id uuid        NOT NULL REFERENCES heladeria(id) ON DELETE CASCADE,
  registro_id  uuid        NOT NULL REFERENCES inventario_registros(id) ON DELETE CASCADE,
  cantidad     numeric     NOT NULL CHECK (cantidad > 0),
  fecha        date        NOT NULL DEFAULT CURRENT_DATE,
  notas        text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inventario_consumos_registro_idx
  ON inventario_consumos(registro_id, fecha DESC);

ALTER TABLE inventario_consumos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_access_inventario_consumos" ON inventario_consumos
  USING (heladeria_id IN (
    SELECT heladeria_id FROM heladeria_miembros WHERE user_id = auth.uid()
  ))
  WITH CHECK (heladeria_id IN (
    SELECT heladeria_id FROM heladeria_miembros WHERE user_id = auth.uid()
  ));
