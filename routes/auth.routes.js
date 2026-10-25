import { Router } from 'express';
import bcrypt from 'bcrypt';
import validateBody from '../middleware/validateBody.js';
import checkAuth from '../middleware/checkAuth.js';
import { registerSchema, loginSchema } from '../validation-schemas/auth.js';
import { findUserByEmail, findUserByUsername, createUser } from '../queries/auth.queries.js';

const router = Router();

router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (await findUserByEmail(email.toLowerCase()))
      return res
        .status(409)
        .json({ error: 'Validation failed', errors: { email: { errors: ['Email already registered'] } } });
    if (await findUserByUsername(username))
      return res
        .status(409)
        .json({ error: 'Validation failed', errors: { username: { errors: ['Username already taken'] } } });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ username, email: email.toLowerCase(), passwordHash });
    res.status(201).json({ message: 'Account created successfully', data: { user } });
  } catch (err) {
    next(err);
  }
});

router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email.toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ error: 'Invalid email or password' });
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user.id;
      res.json({
        message: 'Logged in successfully',
        data: { user: { id: user.id, username: user.username, email: user.email } },
      });
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

router.get('/me', checkAuth, (req, res) => {
  res.json({ data: { user: req.user } });
});

export default router;