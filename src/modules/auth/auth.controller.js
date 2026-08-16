import { signUp, login, refreshAccessToken } from './auth.service.js';

export async function handleSignup(req, res) {
  try {
    const { email, password, name } = req.body;
    const result = await signUp({ email, password, name });
    res.status(201).json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;
    const result = await login({ email, password });
    res.json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleRefresh(req, res) {
  try {
    const { refreshToken } = req.body;
    const result = await refreshAccessToken(refreshToken);
    res.json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}
