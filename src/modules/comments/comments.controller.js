import {
  createComment,
  listComments,
  deleteComment,
  createAttachment,
} from './comments.service.js';

export async function handleCreateComment(req, res) {
  try {
    const comment = await createComment(req.params.taskId, req.user.userId, req.body);
    res.status(201).json(comment);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleListComments(req, res) {
  try {
    const comments = await listComments(req.params.taskId);
    res.json(comments);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleDeleteComment(req, res) {
  try {
    await deleteComment(req.params.id, req.user.userId, req.membership.role);
    res.status(204).send();
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleCreateAttachment(req, res) {
  try {
    const attachment = await createAttachment(req.params.taskId, req.user.userId, req.body);
    res.status(201).json(attachment);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}
