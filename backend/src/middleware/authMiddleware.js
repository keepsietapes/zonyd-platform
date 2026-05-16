const { supabase } = require('../utils/supabase');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
  }

  try {

    // Validación real usando el SDK de Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error(`[AUTH_ERROR] ${error?.message || 'Usuario no encontrado'}`);
      return res.status(401).json({ error: 'AUTH_FAILED', details: error?.message });
    }

    // Buscamos los datos adicionales en la DB pública
    const prisma = require('../utils/prisma');
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { artistProfiles: true }
    });

    // Si no se encuentra por ID pero sí por email, significa que el UUID de Supabase cambió
    // (común al re-registrarse con Google OAuth con la misma dirección de correo).
    if (!dbUser && user.email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: user.email },
        include: { artistProfiles: true }
      });

      if (existingUserByEmail) {
        try {
          console.log(`[authMiddleware] Sincronizando UUID de Supabase para ${user.email} (de ${existingUserByEmail.id} a ${user.id})`);
          
          // Actualizamos el ID del usuario directamente en la base de datos
          dbUser = await prisma.user.update({
            where: { email: user.email },
            data: { id: user.id },
            include: { artistProfiles: true }
          });
        } catch (updateError) {
          console.error(`[authMiddleware] Error sincronizando UUID: ${updateError.message}. Usando perfiles existentes.`);
          dbUser = existingUserByEmail;
        }
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: dbUser?.role || 'ARTIST',
      artistProfiles: dbUser?.artistProfiles || [],
      artistProfile: dbUser?.artistProfiles?.[0] || null
    };

    if (!req.user.id) {
      throw new Error('ID de usuario no disponible tras validación');
    }
    
    next();
  } catch (err) {
    console.error(`[AUTH_CRITICAL_FAIL] ${err.message}`);
    return res.status(401).json({ error: 'AUTH_SYSTEM_ERROR' });
  }
};

module.exports = authMiddleware;
