import postgres from 'postgres'
import * as fs from 'fs'
import * as path from 'path'

// Native .env.local loader
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return

  const content = fs.readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) {
      process.env[key] = val
    }
  }
}

async function checkConnection() {
  loadEnv()

  console.log('\n==========================================')
  console.log('   CAMPUSCONNECT — SUPABASE DB DIAGNOSTIC  ')
  console.log('==========================================\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const dbUrl = process.env.DATABASE_URL

  let hasErrors = false

  // 1. Supabase URL check
  if (!supabaseUrl || supabaseUrl.includes('your_supabase_project_url') || supabaseUrl.includes('placeholder')) {
    console.log('❌ NEXT_PUBLIC_SUPABASE_URL: Not configured or using placeholder.')
    console.log('   Expected format: https://[your-project-ref].supabase.co')
    hasErrors = true
  } else {
    console.log(`✅ NEXT_PUBLIC_SUPABASE_URL: Configured (${supabaseUrl})`)
  }

  // 2. Supabase Anon Key check
  if (!anonKey || anonKey.includes('your_supabase_anon_key') || anonKey.includes('placeholder')) {
    console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: Not configured or using placeholder.')
    hasErrors = true
  } else {
    console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Configured (length: ' + anonKey.length + ' chars)')
  }

  // 3. Service Role Key check (optional for client, needed for admin tasks)
  if (!serviceKey || serviceKey.includes('your_supabase_service_role_key')) {
    console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY: Optional/Not configured.')
  } else {
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY: Configured')
  }

  // 4. DATABASE_URL check
  if (!dbUrl || dbUrl.includes('your_supabase_postgres_connection_string') || dbUrl.includes('localhost:5432')) {
    console.log('❌ DATABASE_URL: Not configured or using placeholder.')
    console.log('   Expected format: postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres')
    console.log('   or connection pooler: postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true')
    hasErrors = true
  } else {
    const maskedUrl = dbUrl.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:******@')
    console.log(`✅ DATABASE_URL: Configured (${maskedUrl})`)
  }

  // If credentials are placeholder, stop here with instructions
  if (hasErrors) {
    console.log('\n------------------------------------------')
    console.log('⚠️  ACTION REQUIRED:')
    console.log('Please update campusconnect/.env.local with your real Supabase credentials:')
    console.log('  1. Go to https://supabase.com/dashboard')
    console.log('  2. Create or select your project')
    console.log('  3. In Project Settings -> API:')
    console.log('     Copy Project URL -> NEXT_PUBLIC_SUPABASE_URL')
    console.log('     Copy "anon public" key -> NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.log('     Copy "service_role" key -> SUPABASE_SERVICE_ROLE_KEY')
    console.log('  4. In Project Settings -> Database:')
    console.log('     Copy Connection String (URI format) -> DATABASE_URL')
    console.log('     (Remember to replace [YOUR-PASSWORD] with your actual database password)')
    console.log('------------------------------------------\n')
    process.exit(1)
  }

  // 5. Test Live PostgreSQL Connection
  console.log('\nConnecting to PostgreSQL database...')
  let sql: ReturnType<typeof postgres> | null = null
  try {
    sql = postgres(dbUrl!, {
      connect_timeout: 10,
      prepare: false,
    })

    const info = await sql`SELECT current_database() as db_name, current_user as db_user, version() as pg_version;`
    console.log('🎉 PostgreSQL connection successful!')
    console.log(`   Connected to Database: ${info[0].db_name}`)
    console.log(`   Database User:        ${info[0].db_user}`)
    console.log(`   Server Version:       ${info[0].pg_version.split(' ')[0]} ${info[0].pg_version.split(' ')[1]}`)

    // Check table count
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `

    console.log(`\nFound ${tables.length} tables in public schema:`)
    if (tables.length === 0) {
      console.log('⚠️  No tables found in public schema yet.')
      console.log('   Run `npm run db:push` to push the schema from src/lib/db/schema.ts')
      console.log('   Or run the SQL migration in Supabase SQL editor!')
    } else {
      tables.forEach(t => console.log(`   - ${t.table_name}`))
      console.log('\n✅ Database schema is active and ready!')
    }
  } catch (err: any) {
    console.error('❌ Failed to connect to PostgreSQL database:')
    console.error(`   ${err.message}`)
    if (err.message.includes('password authentication failed')) {
      console.error('   👉 Check if the database password in DATABASE_URL is correct.')
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      console.error('   👉 Hostname could not be resolved. Verify the host in DATABASE_URL.')
    }
    process.exit(1)
  } finally {
    if (sql) {
      await sql.end()
    }
  }
}

checkConnection()
