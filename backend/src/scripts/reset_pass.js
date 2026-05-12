const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetPasswordManual(email, newPassword) {
  try {
    console.log(`🛠️ Intentando resetear contraseña para: ${email}...`);
    
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.find(u => u.email === email);
    if (!user) {
      console.error(`❌ Error: Usuario no encontrado.`);
      return;
    }

    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (error) throw error;

    console.log(`✅ ¡ÉXITO! La contraseña de ${email} ha sido actualizada.`);
    console.log(`Contraseña: ${newPassword}`);

  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

resetPasswordManual('rztk82sucio@gmail.com', 'ZonydMaster2026!');
