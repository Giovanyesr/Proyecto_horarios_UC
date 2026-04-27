const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.message)

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }))
    return res.status(422).json({ detail: 'Error de validación', field_errors: errors })
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'campo'
    return res.status(409).json({ detail: `El valor de '${field}' ya existe` })
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ detail: 'ID inválido' })
  }

  const status = err.status || err.statusCode || 500
  res.status(status).json({ detail: err.message || 'Error interno del servidor' })
}

module.exports = errorHandler
