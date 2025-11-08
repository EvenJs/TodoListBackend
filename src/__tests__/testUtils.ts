import { Todo } from '../models/Todo';
import { TASK_STATUS } from '../constants';

export const createTestTodo = async (overrides = {}) => {
  const defaultTodo = {
    title: 'Test Todo',
    description: 'Test Description',
    status: TASK_STATUS.NOT_STARTED,
    ...overrides,
  };

  return await Todo.create(defaultTodo);
};

export const createMultipleTestTodos = async (count: number, status?: string) => {
  const todos = [];
  for (let i = 0; i < count; i++) {
    const todo = await createTestTodo({
      title: `Test Todo ${i + 1}`,
      status: status || TASK_STATUS.NOT_STARTED,
    });
    todos.push(todo);
  }
  return todos;
};