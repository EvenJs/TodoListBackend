import express, { Request, Response } from "express";
import { Todo } from "../models/Todo";
import { TASK_STATUS, NOT_STARTED } from "../constants";

export const getTodos = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const filter: Record<string, any> = {};

    // ✅ Validate and apply status filter
    if (typeof status === "string") {
      const upperStatus = status.toUpperCase();

      if (Object.keys(TASK_STATUS).includes(upperStatus)) {
        const key = upperStatus as keyof typeof TASK_STATUS;
        filter.status = TASK_STATUS[key];
      }
    }
    const todos = await Todo.find(filter)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Todo.countDocuments(filter);

    // Calculate statistics for ALL todos (ignoring filters)
    const stats = await Todo.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          notStarted: {
            $sum: { $cond: [{ $eq: ['$status', 'not_started'] }, 1, 0] }
          }
        }
      }
    ]);

    // If no todos exist, return zeros
    const statsResult = stats.length > 0 ? stats[0] : {
      total: 0,
      completed: 0,
      inProgress: 0,
      notStarted: 0
    };

    // Remove the _id field and add progress percentage
    const { _id, ...cleanStats } = statsResult;


    res.json({
      todos,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total,
      stats: {
        ...cleanStats,
        progress: cleanStats.total > 0 ? Math.round((cleanStats.completed / cleanStats.total) * 100) : 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch todos" });
  }
};

// Create todo
export const createTodo = async (req: Request, res: Response) => {
  try {
    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const todo = new Todo({
      title,
      description,
      status: status || NOT_STARTED
    });

    const savedTodo = await todo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message || "Failed to create todo" });
  }
};

// Update todo
export const updateTodo = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const { id } = req.params;

    const updateData: Partial<{
      title: string;
      description: string;
    }> = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    const todo = await Todo.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(todo);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Update todo status
export const updateTodoStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const validStatuses = Object.values(TASK_STATUS);

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const todo = await Todo.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Get updated statistics after status change
    const stats = await Todo.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          notStarted: {
            $sum: { $cond: [{ $eq: ['$status', 'not_started'] }, 1, 0] }
          }
        }
      }
    ]);
    const { _id, ...cleanStats } = stats[0]

    res.json({
      todo,
      stats: {
        ...cleanStats,
        progress: cleanStats.total > 0 ? Math.round((cleanStats.completed / cleanStats.total) * 100) : 0
      }
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Delete todo
export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Todo.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

