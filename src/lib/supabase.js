import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://wymywqcfzqcbszhgqwwd.supabase.co"
const supabaseAnonKey = "sb_publishable_i5TfjTPNz-Q9IrOZO8oJCg_wLqHjv-Y"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)