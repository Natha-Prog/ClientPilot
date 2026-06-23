export const errorHandler = (err, req, res, _next) => {
  console.error(err)
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: err.errors[0]?.message || 'Données invalides' })
  }
  res.status(err.status || 500).json({ error: err.message || 'Erreur serveur' })
}
