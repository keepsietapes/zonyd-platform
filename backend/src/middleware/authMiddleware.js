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
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { artistProfiles: true }
    });

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
