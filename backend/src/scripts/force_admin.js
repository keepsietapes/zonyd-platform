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

async function forceConfirmAndPromote(email) {
  try {
    console.log(`🔍 Buscando usuario: ${email}...`);
    
    // 1. Obtener el ID del usuario en Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.find(u => u.email === email);
    if (!user) {
      console.error(`❌ Error: El usuario con email ${email} no existe en Supabase Auth. Asegúrate de haberte registrado.`);
      return;
    }

    console.log(`✅ Usuario encontrado (ID: ${user.id}). Forzando confirmación...`);

    // 2. Confirmar email
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );
    if (updateError) throw updateError;

    console.log(`✅ Email confirmado.`);

    // 3. Crear el registro en public.User si no existe (bypass trigger)
    // Usamos Prisma o el mismo cliente de Supabase
    // Aquí usamos el cliente de Supabase para mayor rapidez
    const { error: dbError } = await supabase
      .from('User')
      .upsert({
        id: user.id,
        email: email,
        role: 'ADMIN'
      });
    
    if (dbError) {
        console.warn(`⚠️ Nota sobre la DB: ${dbError.message}`);
    } else {
        console.log(`🚀 Usuario promovido a ADMIN en la base de datos pública.`);
    }

    // 4. Crear Artist profile con plan LABEL
    const { error: artistError } = await supabase
      .from('Artist')
      .upsert({
        userId: user.id,
        stageName: 'Master Admin',
        plan: 'LABEL'
      });
    
    if (artistError) {
        console.warn(`⚠️ Nota sobre Artist: ${artistError.message}`);
    } else {
        console.log(`🌟 Plan LABEL activado.`);
    }

    console.log(`\n🎉 TODO LISTO. Ahora puedes iniciar sesión con tu contraseña.`);

  } catch (error) {
    console.error('❌ ERROR FATAL:', error.message);
  }
}

const targetEmail = process.argv[2];
if (!targetEmail) {
  console.log('Uso: node force_admin.js tu@correo.com');
} else {
  forceConfirmAndPromote(targetEmail);
}
