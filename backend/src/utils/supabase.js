const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey.includes('TU_SERVICE_ROLE_KEY')) {
  console.warn('⚠️ ADVERTENCIA: Supabase Storage no está configurado correctamente en el .env');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  },
  realtime: {
    transport: ws,
  }
});

module.exports = { supabase };
