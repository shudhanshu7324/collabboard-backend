import {
  createTask,
  listBoardTasks,
  getTask,
  updateTask,
  moveTask,
  deleteTask,
} from './tasks.service.js';
import { emitToBoard } from '../../sockets/index.js';

export async function handleCreateTask(req, res) {
  try {
    const task = await createTask(req.params.listId, req.user.userId, req.body);
    emitToBoard(task.list.boardId, 'task:created', task);
    res.status(201).json(task);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleListBoardTasks(req, res) {
  try {
    const tasks = await listBoardTasks(req.params.boardId);
    res.json(tasks);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleGetTask(req, res) {
  try {
    const task = await getTask(req.params.id);
    res.json(task);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleUpdateTask(req, res) {
  try {
    const task = await updateTask(req.params.id, req.user.userId, req.body);
    emitToBoard(task.list.boardId, 'task:updated', task);
    res.json(task);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleMoveTask(req, res) {
  try {
    const { task, sourceBoardId, targetBoardId } = await moveTask(
      req.params.id,
      req.user.userId,
      req.body
    );
    emitToBoard(targetBoardId, 'task:moved', task);
    if (sourceBoardId !== targetBoardId) {
      emitToBoard(sourceBoardId, 'task:moved', task);
    }
    res.json(task);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}

export async function handleDeleteTask(req, res) {
  try {
    const { task, boardId } = await deleteTask(req.params.id, req.user.userId);
    emitToBoard(boardId, 'task:deleted', { id: task.id });
    res.status(204).send();
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
}
