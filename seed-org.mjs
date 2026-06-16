import pg from 'pg'
const { Client } = pg

const client = new Client({
  connectionString: 'postgresql://postgres.tgvhlnuloasvlbltsals:coral-tigre-gaby@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
})

await client.connect()

// 1. Insert the heladería org
const { rows: helRows } = await client.query(`
  INSERT INTO heladeria (nombre)
  VALUES ('Heladería Los Cabos')
  ON CONFLICT DO NOTHING
  RETURNING id, nombre
`)

let heladeriaId
if (helRows.length > 0) {
  heladeriaId = helRows[0].id
  console.log('✅ Heladería creada:', heladeriaId, helRows[0].nombre)
} else {
  const { rows } = await client.query(`SELECT id, nombre FROM heladeria LIMIT 1`)
  heladeriaId = rows[0].id
  console.log('ℹ️  Heladería ya existe:', heladeriaId, rows[0].nombre)
}

console.log('')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('heladeria_id:', heladeriaId)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('')
console.log('Siguiente: crea los usuarios en Supabase Auth (Dashboard → Authentication → Users → Invite user)')
console.log('Después corre seed-miembros.mjs con sus user_ids')

await client.end()
