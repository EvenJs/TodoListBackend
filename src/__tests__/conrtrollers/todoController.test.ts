import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import todoRoutes from '../../routes/todo';
import { Todo } from '../../models/Todo';
import { TASK_STATUS } from '../../constants';

const app = express();
app.use(express.json());
app.use('/tasks', todoRoutes);

describe('Todo Controller', () => {
  describe('GET /tasks', () => {
    it('should return all todos with pagination', async () => {
      // Create test data
      await Todo.create([
        { title: 'Todo 1', status: TASK_STATUS.NOT_STARTED },
        { title: 'Todo 2', status: TASK_STATUS.IN_PROGRESS },
        { title: 'Todo 3', status: TASK_STATUS.COMPLETED },
      ]);

      const response = await request(app)
        .get('/tasks')
        .expect(200);

      expect(response.body.todos).toHaveLength(3);
      expect(response.body.total).toBe(3);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.totalPages).toBe(1);
      expect(response.body.stats).toBeDefined();
    });

    it('should filter todos by status', async () => {
      await Todo.create([
        { title: 'Todo 1', status: TASK_STATUS.NOT_STARTED },
        { title: 'Todo 2', status: TASK_STATUS.NOT_STARTED },
        { title: 'Todo 3', status: TASK_STATUS.COMPLETED },
      ]);

      const response = await request(app)
        .get('/tasks?status=not_started')
        .expect(200);

      expect(response.body.todos).toHaveLength(2);
      expect(response.body.todos[0].status).toBe(TASK_STATUS.NOT_STARTED);
      expect(response.body.todos[1].status).toBe(TASK_STATUS.NOT_STARTED);
    });

    it('should handle pagination', async () => {
      // Create 15 todos
      const todos = [];
      for (let i = 0; i < 15; i++) {
        todos.push({ title: `Todo ${i}`, status: TASK_STATUS.NOT_STARTED });
      }
      await Todo.create(todos);

      const response = await request(app)
        .get('/tasks?page=2&limit=5')
        .expect(200);

      expect(response.body.todos).toHaveLength(5);
      expect(response.body.currentPage).toBe(2);
      expect(response.body.totalPages).toBe(3);
      expect(response.body.total).toBe(15);
    });

    it('should return empty array when no todos exist', async () => {
      const response = await request(app)
        .get('/tasks')
        .expect(200);

      expect(response.body.todos).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });
  });

  describe('POST /tasks', () => {
    it('should create a new todo', async () => {
      const todoData = {
        title: 'New Todo',
        description: 'New Description',
        status: TASK_STATUS.IN_PROGRESS,
      };

      const response = await request(app)
        .post('/tasks')
        .send(todoData)
        .expect(201);

      expect(response.body.title).toBe(todoData.title);
      expect(response.body.description).toBe(todoData.description);
      expect(response.body.status).toBe(todoData.status);
      expect(response.body._id).toBeDefined();

      // Verify it was saved to database
      const todoInDb = await Todo.findById(response.body._id);
      expect(todoInDb).toBeDefined();
      expect(todoInDb?.title).toBe(todoData.title);
    });

    it('should require title field', async () => {
      const todoData = {
        description: 'Description without title',
      };

      const response = await request(app)
        .post('/tasks')
        .send(todoData)
        .expect(400);

      expect(response.body.error).toContain('Title is required');
    });

    it('should set default status when not provided', async () => {
      const todoData = {
        title: 'Todo without status',
      };

      const response = await request(app)
        .post('/tasks')
        .send(todoData)
        .expect(201);

      expect(response.body.status).toBe(TASK_STATUS.NOT_STARTED);
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should update a todo', async () => {
      const todo = await Todo.create({
        title: 'Original Title',
        description: 'Original Description',
        status: TASK_STATUS.NOT_STARTED,
      });

      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
      };

      const response = await request(app)
        .put(`/tasks/${todo._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.status).toBe(TASK_STATUS.NOT_STARTED); // Status should remain unchanged
    });

    it('should return 404 for non-existent todo', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await request(app)
        .put(`/tasks/${nonExistentId}`)
        .send({ title: 'Updated Title' })
        .expect(404);
    });

    it('should handle partial updates', async () => {
      const todo = await Todo.create({
        title: 'Original Title',
        description: 'Original Description',
        status: TASK_STATUS.NOT_STARTED,
      });

      const response = await request(app)
        .put(`/tasks/${todo._id}`)
        .send({ title: 'Only Title Updated' })
        .expect(200);

      expect(response.body.title).toBe('Only Title Updated');
      expect(response.body.description).toBe('Original Description'); // Should remain unchanged
    });
  });

  describe('PATCH /tasks/:id/status', () => {
    it('should update todo status', async () => {
      const todo = await Todo.create({
        title: 'Test Todo',
        status: TASK_STATUS.NOT_STARTED,
      });

      const response = await request(app)
        .patch(`/tasks/${todo._id}/status`)
        .send({ status: TASK_STATUS.COMPLETED })
        .expect(200);

      expect(response.body.todo.status).toBe(TASK_STATUS.COMPLETED);
    });

    it('should return 400 for invalid status', async () => {
      const todo = await Todo.create({
        title: 'Test Todo',
        status: TASK_STATUS.NOT_STARTED,
      });

      await request(app)
        .patch(`/tasks/${todo._id}/status`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });

    it('should return 404 for non-existent todo', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await request(app)
        .patch(`/tasks/${nonExistentId}/status`)
        .send({ status: TASK_STATUS.COMPLETED })
        .expect(404);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete a todo', async () => {
      const todo = await Todo.create({
        title: 'Todo to delete',
        status: TASK_STATUS.NOT_STARTED,
      });

      await request(app)
        .delete(`/tasks/${todo._id}`)
        .expect(200);

      // Verify todo is deleted from database
      const deletedTodo = await Todo.findById(todo._id);
      expect(deletedTodo).toBeNull();
    });

    it('should return 404 for non-existent todo', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await request(app)
        .delete(`/tasks/${nonExistentId}`)
        .expect(404);
    });
  });


});