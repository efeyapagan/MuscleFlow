import dotenv from 'dotenv'
import { defineConfig } from 'prisma/config'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

// Strip params not supported by the standard pg driver used by Prisma CLI
function getCliUrl() {
  const url = process.env['DATABASE_URL'] ?? ''
  return url
    .replace('&channel_binding=require', '')
    .replace('?channel_binding=require&', '?')
    .replace('?channel_binding=require', '')
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: getCliUrl(),
  },
})
