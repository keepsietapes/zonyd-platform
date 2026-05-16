const { z } = require('zod');

const releaseSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(100),
  artist: z.string().min(1, "El artista es requerido").max(100),
  trackIds: z.array(z.string()).optional(),
  splits: z.array(z.any()).optional()
}).passthrough();

const validateRelease = (req, res, next) => {
  try {
    req.body = releaseSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
};

module.exports = { validateRelease };
