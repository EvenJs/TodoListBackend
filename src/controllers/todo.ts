import express, { Request, Response } from "express";
import { Todo } from "../models/Todo.js";
import { TASK_STATUS, NOT_STARTED } from "../constant.js";

export const getTodos = async (req: Request, res: Response) => {
  try {
    const todos = await Todo.find();
    res.json({ todos });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch todos" });
  }
};



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
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to create todo" });
  }
};
