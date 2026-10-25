export default (finder, param = 'id') => async (req, res, next) => {
  try {
    const row = await finder(Number(req.params[param]));
    if (!row) return res.status(404).json({ error: 'Not found' });
    if (row.userId !== req.user.id)
      return res.status(403).json({ error: 'You are not allowed to do this' });
    next();
  } catch (err) {
    next(err);
  }
};