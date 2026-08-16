import {
  createWorkspace,
  listWorkspaces,
  getWorkspace,
  inviteMember,
  updateMemberRole,
  removeMember,
  deleteWorkspace,
} from './workspaces.service.js';

export async function handleCreateWorkspace(req, res) {
  try {
    const workspace = await createWorkspace(req.user.userId, req.body);
    res.status(201).json(workspace);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleListWorkspaces(req, res) {
  try {
    const workspaces = await listWorkspaces(req.user.userId);
    res.json(workspaces);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleGetWorkspace(req, res) {
  try {
    const workspace = await getWorkspace(req.params.id);
    res.json(workspace);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleInviteMember(req, res) {
  try {
    const member = await inviteMember(req.params.id, req.user.userId, req.body);
    res.status(201).json(member);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleUpdateMemberRole(req, res) {
  try {
    const member = await updateMemberRole(
      req.params.id,
      req.user.userId,
      req.params.userId,
      req.body
    );
    res.json(member);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleRemoveMember(req, res) {
  try {
    await removeMember(req.params.id, req.user.userId, req.params.userId);
    res.status(204).send();
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleDeleteWorkspace(req, res) {
  try {
    await deleteWorkspace(req.params.id, req.user.userId);
    res.status(204).send();
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}
