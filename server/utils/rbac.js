export function requireAuth(req, res, next) {
  if (!req.user || !req.user.username) return res.status(401).json({ error: 'Unauthorized' })
  next()
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.username) return res.status(401).json({ error: 'Unauthorized' })
    const role = req.user.role || 'user'
    if (!roles.includes(role)) return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}
