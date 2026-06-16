import pg from 'pg'
import { readFileSync } from 'fs'

const { Client } = pg
const client = new Client({
  connectionString: 'postgresql://postgres.tgvhlnuloasvlbltsals:coral-tigre-gaby@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
})

const sql = readFileSync('./supabase/migrations/0003_inventario.sql', 'utf8')
await client.connect()
await client.query(sql)
console.log('✅ Migración 0003 aplicada — inventario_items, inventario_registros, inventario_consumos')
await client.end()
