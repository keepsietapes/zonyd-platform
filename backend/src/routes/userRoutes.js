const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Upsert: si el User no existe en la BD pública lo creamos automáticamente.
    // Esto resuelve el caso donde se borra el usuario de Supabase Auth y se re-registra
    // con el mismo correo (genera nuevo UUID), o cuando es la primera sesión Google.
    let user = await prisma.user.findUnique({
      where: { email: req.user.email },
      include: { artistProfiles: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: req.user.id,
          email: req.user.email,
          role: 'ARTIST'
        },
        include: { artistProfiles: true }
      });
    }

    res.json(user);
  } catch (error) {
    console.error('[/me error]', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
