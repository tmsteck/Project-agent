import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Storage helpers ────────────────────────────────────────────────────────
// We use a single "store" table with (key text PRIMARY KEY, value jsonb).
// All data for this personal app lives under well-known keys.

export async function dbGet(key) {
  const { data, error } = await supabase
    .from('store')
    .select('value')
    .eq('key', key)
    .maybeSingle()
  if (error) throw error
  return data?.value ?? null
}

export async function dbSet(key, value) {
  const { error } = await supabase
    .from('store')
    .upsert({ key, value }, { onConflict: 'key' })
  if (error) throw error
}

// ─── Project-level helpers ──────────────────────────────────────────────────
export async function loadProjects() {
  const data = await dbGet('projects')
  return data ?? []
}

export async function saveProjects(projects) {
  await dbSet('projects', projects)
}
