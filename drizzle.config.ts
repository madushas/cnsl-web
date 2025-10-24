import 'dotenv/config'
import type { Config } from 'drizzle-kit'

const raw = process.env.DATABASE_URL || ''
const url = raw.replaceAll(/(^["']|["']$)/g, '').trim()

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url,
  },
  tablesFilter: ['public.*', 'neon_auth.*'],
} satisfies Config
