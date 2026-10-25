import { getUserById } from '../queries/auth.queries.js';

export default async (req, res, next) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: 'Please login first' });
    const user = await getUserById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'Please login first' });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};