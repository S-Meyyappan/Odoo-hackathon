import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  taskName: { type: String, required: true },
  taskAssignees: { type: [String], required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "project", required: true },
  taskTags: { type: [String], required: true },
  deadline: { type: Date, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
});

const Task = mongoose.model("task", TaskSchema);
export default Task;
