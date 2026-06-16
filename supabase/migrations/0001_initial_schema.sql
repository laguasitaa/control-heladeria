-- ============================================================
-- Panel de Control Heladería — Schema inicial
-- ============================================================

-- 1. Organización (la heladería)
CREATE TABLE IF NOT EXISTS heladeria (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Miembros (vincula usuarios de Supabase Auth con la org)
CREATE TABLE IF NOT EXISTS heladeria_miembros (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heladeria_id UUID NOT NULL REFERENCES heladeria(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (heladeria_id, user_id)
);

-- 3. Gastos
CREATE TABLE IF NOT EXISTS gastos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heladeria_id UUID NOT NULL REFERENCES heladeria(id) ON DELETE CASCADE,
  fecha        DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria    TEXT NOT NULL,
  monto        NUMERIC(12, 2) NOT NULL CHECK (monto > 0),
  descripcion  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Ventas (cierre de caja diario)
CREATE TABLE IF NOT EXISTS ventas (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heladeria_id UUID NOT NULL REFERENCES heladeria(id) ON DELETE CASCADE,
  fecha        DATE NOT NULL DEFAULT CURRENT_DATE,
  monto_total  NUMERIC(12, 2) NOT NULL CHECK (monto_total >= 0),
  notas        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (heladeria_id, fecha)
);

-- 5. Vencimientos
CREATE TABLE IF NOT EXISTS vencimientos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heladeria_id      UUID NOT NULL REFERENCES heladeria(id) ON DELETE CASCADE,
  nombre            TEXT NOT NULL,
  tipo              TEXT NOT NULL CHECK (tipo IN ('renta', 'contrato', 'inventario', 'otro')),
  fecha_vencimiento DATE NOT NULL,
  monto_mensual     NUMERIC(12, 2),
  notas             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Índices para queries frecuentes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_gastos_heladeria_fecha
  ON gastos (heladeria_id, fecha DESC);

CREATE INDEX IF NOT EXISTS idx_ventas_heladeria_fecha
  ON ventas (heladeria_id, fecha DESC);

CREATE INDEX IF NOT EXISTS idx_vencimientos_heladeria_fecha
  ON vencimientos (heladeria_id, fecha_vencimiento ASC);

-- ============================================================
-- updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gastos_updated_at
  BEFORE UPDATE ON gastos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER ventas_updated_at
  BEFORE UPDATE ON ventas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER vencimientos_updated_at
  BEFORE UPDATE ON vencimientos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE heladeria          ENABLE ROW LEVEL SECURITY;
ALTER TABLE heladeria_miembros ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas             ENABLE ROW LEVEL SECURITY;
ALTER TABLE vencimientos       ENABLE ROW LEVEL SECURITY;

-- heladeria: solo lectura para miembros de esa org
CREATE POLICY "miembros_ven_heladeria" ON heladeria
  FOR SELECT
  USING (
    id IN (
      SELECT heladeria_id FROM heladeria_miembros WHERE user_id = auth.uid()
    )
  );

-- heladeria_miembros: cada user ve solo sus propias membresías
CREATE POLICY "own_memberships" ON heladeria_miembros
  FOR SELECT
  USING (user_id = auth.uid());

-- gastos: CRUD completo solo para miembros de la org
CREATE POLICY "org_access_gastos" ON gastos
  USING (
    heladeria_id IN (
      SELECT heladeria_id FROM heladeria_miembros WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    heladeria_id IN (
      SELECT heladeria_id FROM heladeria_miembros WHERE user_id = auth.uid()
    )
  );

-- ventas: CRUD completo solo para miembros de la org
CREATE POLICY "org_access_ventas" ON ventas
  USING (
    heladeria_id IN (
      SELECT heladeria_id FROM heladeria_miembros WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    heladeria_id IN (
      SELECT heladeria_id FROM heladeria_miembros WHERE user_id = auth.uid()
    )
  );

-- vencimientos: CRUD completo solo para miembros de la org
CREATE POLICY "org_access_vencimientos" ON vencimientos
  USING (
    heladeria_id IN (
      SELECT heladeria_id FROM heladeria_miembros WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    heladeria_id IN (
      SELECT heladeria_id FROM heladeria_miembros WHERE user_id = auth.uid()
    )
  );
