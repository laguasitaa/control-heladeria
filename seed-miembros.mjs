import pg from 'pg'
const { Client } = pg

const client = new Client({
  connectionString: 'postgresql://postgres.tgvhlnuloasvlbltsals:coral-tigre-gaby@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
})

await client.connect()

const HELADERIA_ID = 'e3135c46-dfc1-4fd0-a010-e444ba0f1e0c'
const USUARIOS = [
  'b793492d-6d01-4395-95e1-1bdda000a060',
]

for (const userId of USUARIOS) {
  const { rows } = await client.query(`
    INSERT INTO heladeria_miembros (heladeria_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT (heladeria_id, user_id) DO NOTHING
    RETURNING user_id
  `, [HELADERIA_ID, userId])

  if (rows.length > 0) {
    console.log('✅ Usuario vinculado:', userId)
  } else {
    console.log('ℹ️  Ya existía:', userId)
  }
}

await client.end()
console.log('\n🎉 Listo. Ya puedes iniciar sesión.')
