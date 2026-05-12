const { z } = require('zod');

const trackSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'El título es requerido').max(200),
    artist: z.string().optional(),
    genre: z.string().optional(),
    explicit: z.preprocess((val) => val === 'true', z.boolean()).optional(),
  })
});

const releaseSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'El título del release es requerido'),
    releaseDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Fecha de lanzamiento inválida",
    }).optional(),
    upc: z.string().length(12, 'El UPC debe tener exactamente 12 dígitos').optional(),
  })
});

module.exports = {
  trackSchema,
  releaseSchema
};
