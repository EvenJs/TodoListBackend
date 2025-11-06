import { Router } from "express";
import { getTodos, createTodo } from "../controllers/todo.js";


const router = Router();


// GET /tasks (optional ?status=)
router.get('/', getTodos);
router.post('/', createTodo);

export default router;