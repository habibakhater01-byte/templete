export default (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const errors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] ?? 'form';
      if (!errors[field]) errors[field] = { errors: [] };
      errors[field].errors.push(issue.message);
    }
    return res.status(400).json({ error: 'Validation failed', errors });
  }
  req.body = result.data;
  next();
};