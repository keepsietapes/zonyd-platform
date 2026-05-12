const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/me', authMiddleware, async (req, res) => {
  try {
    // req.user viene del middleware de auth (si está configurado)
    // Para simplificar ahora y que funcione el Dashboard:
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { artistProfiles: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
