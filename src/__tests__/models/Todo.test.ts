import { Todo } from '../../models/Todo';
import { TASK_STATUS } from '../../constants';

describe('Todo Model', () => {
  it('should create a todo successfully', async () => {
    const todoData = {
      title: 'Test Todo',
      description: 'Test Description',
      status: TASK_STATUS.NOT_STARTED,
    };

    const todo = await Todo.create(todoData);

    expect(todo._id).toBeDefined();
    expect(todo.title).toBe(todoData.title);
    expect(todo.description).toBe(todoData.description);
    expect(todo.status).toBe(todoData.status);
    expect(todo.createdAt).toBeDefined();
  });

  it('should require title field', async () => {
    const todoData = {
      description: 'Test Description',
      status: TASK_STATUS.NOT_STARTED,
    };

    await expect(Todo.create(todoData)).rejects.toThrow();
  });

  it('should set default status to NOT_STARTED', async () => {
    const todoData = {
      title: 'Test Todo',
    };

    const todo = await Todo.create(todoData);
    expect(todo.status).toBe(TASK_STATUS.NOT_STARTED);
  });

  it('should validate status enum', async () => {
    const todoData = {
      title: 'Test Todo',
      status: 'INVALID_STATUS',
    };

    await expect(Todo.create(todoData)).rejects.toThrow();
  });
});