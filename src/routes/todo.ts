import { Router } from "express";
import { getTodos, createTodo, deleteTodo, updateTodo, updateTodoStatus } from "../controllers/todo.js";


const router = Router();


// GET /tasks (optional ?status=)
router.get('/', getTodos);
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.patch('/:id/status', updateTodoStatus);
router.delete('/:id', deleteTodo);

export default router;