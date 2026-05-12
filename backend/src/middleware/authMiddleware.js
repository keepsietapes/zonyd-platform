const { supabase } = require('../utils/supabase');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'TOKEN_REQUERIDO' });
  }

  const token = authHeader.split(' ')[1];

  // BYPASS TEMPORAL PARA DESARROLLO (Para poder probar la subida de audio sin correos)
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    req.user = { id: 'test-user-id', email: 'test@zonyd.com', role: 'ADMIN' };
    return next();
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
