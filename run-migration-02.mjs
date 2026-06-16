import pg from 'pg'
import { readFileSync } from 'fs'

const { Client } = pg
const client = new Client({
  connectionString: 'postgresql://postgres.tgvhlnuloasvlbltsals:coral-tigre-gaby@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
})

const sql = readFileSync('/Users/gabrielam/raicode-proyectos/control-heladeria/supabase/migrations/0002_documentos.sql', 'utf8')

await client.connect()
await client.query(sql)
console.log('✅ Migración 0002 aplicada — tabla documentos + bucket Storage')
await client.end()
