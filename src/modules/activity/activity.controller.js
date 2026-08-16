import { listActivity } from './activity.service.js';

export async function handleListActivity(req, res) {
  try {
    const activity = await listActivity(req.params.id, {
      limit: req.query.limit,
      cursor: req.query.cursor,
    });
    res.json(activity);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}
