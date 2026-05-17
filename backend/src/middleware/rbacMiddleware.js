const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autorizado: Sesión no encontrada' });
    }
    
    const userRole = req.user.role; 
    
    // Si el usuario es ADMIN, SUPERADMIN o LABEL, tiene acceso total a administración
    if (userRole === 'ADMIN' || userRole === 'SUPERADMIN' || userRole === 'LABEL') {
      return next();
    }

    // Verificar si el rol coincide
    if (userRole !== role) {
      return res.status(403).json({ 
        error: `Acceso denegado: Se requiere rol ${role}. Tu rol actual es ${userRole || 'USER'}` 
      });
    }

    next();
  };
};

module.exports = { requireRole };
