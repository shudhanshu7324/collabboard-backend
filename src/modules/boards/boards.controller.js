import {
  createBoard,
  listBoards,
  getBoard,
  updateBoard,
  deleteBoard,
  createList,
  updateList,
  deleteList,
} from './boards.service.js';

export async function handleCreateBoard(req, res) {
  try {
    const board = await createBoard(req.params.workspaceId, req.user.userId, req.body);
    res.status(201).json(board);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleListBoards(req, res) {
  try {
    const boards = await listBoards(req.params.workspaceId);
    res.json(boards);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleGetBoard(req, res) {
  try {
    const board = await getBoard(req.params.id);
    res.json(board);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleUpdateBoard(req, res) {
  try {
    const board = await updateBoard(req.params.id, req.user.userId, req.body);
    res.json(board);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleDeleteBoard(req, res) {
  try {
    await deleteBoard(req.params.id, req.user.userId);
    res.status(204).send();
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleCreateList(req, res) {
  try {
    const list = await createList(req.params.boardId, req.user.userId, req.body);
    res.status(201).json(list);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleUpdateList(req, res) {
  try {
    const list = await updateList(req.params.id, req.user.userId, req.body);
    res.json(list);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleDeleteList(req, res) {
  try {
    await deleteList(req.params.id, req.user.userId);
    res.status(204).send();
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}
