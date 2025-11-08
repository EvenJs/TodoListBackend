import mongoose from "mongoose";
import { NOT_STARTED, TASK_STATUS } from "../constants";

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: TASK_STATUS,
      default: NOT_STARTED,
    },
  },
  { timestamps: true }
);

export const Todo = mongoose.model("Todo", todoSchema);