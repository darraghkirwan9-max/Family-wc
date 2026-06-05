import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://imbrmhkybsgfmpzddibf.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_ciYCFytTHtfDO0_aZ6kj8A_ECAxRpJa'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
