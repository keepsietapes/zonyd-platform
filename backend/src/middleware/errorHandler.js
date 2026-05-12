const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
      code: err.code
    });
  } else {
    // Producción: No exponer detalles del stack trace
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        code: err.code,
        message: err.message
      });
    } else {
      // Error de programación o desconocido: No filtrar detalles al cliente
      console.error('ERROR CRÍTICO 💥:', err);
      res.status(500).json({
        status: 'error',
        message: 'Algo salió muy mal en el servidor.'
      });
    }
  }
};

module.exports = errorHandler;
